import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { daysUntilExam, domainAverages } from "@/lib/certificationPractice";
import type { Certification, CertificationPracticeTest, CertificationStudyPlanSuggestion, SuggestedMilestone } from "@/types/database.types";

const STUDY_PLAN_TOOL: Anthropic.Tool = {
  name: "propose_study_plan",
  description: "Propose a dated certification study plan for human review -- never applied automatically.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "A specific, concrete task -- not vague advice like 'study more'." },
            target_date: { type: "string", description: "ISO 8601 (YYYY-MM-DD), between today and the exam date (or within the next 6 weeks if no exam date is set)." },
            notes: { type: ["string", "null"], description: "Optional expanded detail on the task." },
            reason: { type: "string", description: "Why this task, grounded in the specific domain averages/trends/notes given -- not generic exam advice." },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["title", "target_date", "reason", "confidence"],
        },
      },
    },
    required: ["items"],
  },
};

interface ProposedItem extends SuggestedMilestone {
  reason: string;
  confidence: "high" | "medium" | "low";
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: certificationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Study plan generation isn't configured on this deployment yet." }, { status: 500 });
  }

  const [{ data: certification }, { data: tests }] = await Promise.all([
    supabase.from("certifications").select("*").eq("id", certificationId).single(),
    supabase
      .from("certification_practice_tests")
      .select("*")
      .eq("certification_id", certificationId)
      .order("test_date", { ascending: true }),
  ]);

  if (!certification) {
    return NextResponse.json({ error: "Certification not found." }, { status: 404 });
  }

  const typedCert = certification as Certification;
  const typedTests = (tests as CertificationPracticeTest[]) ?? [];
  const scoredTests = typedTests.filter((t) => t.overall_score != null || t.overall_result != null);
  if (scoredTests.length === 0) {
    return NextResponse.json(
      { error: "Log at least one practice test with a score or result before generating a study plan." },
      { status: 400 }
    );
  }

  const domains = domainAverages(typedTests);
  const domainLines = Object.entries(domains).map(([domain, stats]) =>
    stats.average != null
      ? `- ${domain}: avg ${stats.average.toFixed(1)}, trend ${stats.trend}`
      : `- ${domain}: not enough data yet`
  );
  const daysUntil = daysUntilExam(typedCert.exam_date);
  const latest = scoredTests[scoredTests.length - 1]!;

  const summaryLines = [
    `Certification: ${typedCert.name}${typedCert.provider ? ` (${typedCert.provider})` : ""}`,
    typedCert.passing_score != null ? `Passing score: ${typedCert.passing_score}` : "No numeric passing score set for this certification.",
    latest.overall_score != null ? `Latest overall score: ${latest.overall_score}` : `Latest overall result: ${latest.overall_result}`,
    daysUntil != null ? `Days until scheduled exam: ${daysUntil}` : "No exam date set -- plan over the next 6 weeks.",
    "",
    domainLines.length > 0 ? "Domain averages (independent per domain, not cross-compared):" : "No domain-level breakdown logged yet.",
    ...domainLines,
    "",
    "Recent practice test notes (most recent first):",
    ...scoredTests
      .slice(-5)
      .reverse()
      .map((t) => `- ${t.test_date} (${t.overall_score ?? t.overall_result ?? "no score"}): ${t.notes ?? "no notes"}`),
  ].filter((line): line is string => line != null);

  const prompt = `You are helping someone prepare for the ${typedCert.name} certification exam. Based only on the data below, propose a focused study plan as a list of dated, concrete tasks. Prioritize whichever domain shows the lowest average or a declining trend, or general exam readiness if no domain breakdown exists. Do not invent weaknesses the data doesn't show, and do not give generic advice ("study more") -- every item must be specific and its reason must cite the actual numbers or notes given.

${summaryLines.join("\n")}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      tools: [STUDY_PLAN_TOOL],
      tool_choice: { type: "tool", name: "propose_study_plan" },
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Study plan generation failed." }, { status: 502 });
  }

  const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  const items = (toolUse?.input as { items?: ProposedItem[] } | undefined)?.items ?? [];

  if (items.length === 0) {
    return NextResponse.json({ ok: true, suggestions: [] });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("certification_study_plan_suggestions")
    .insert(
      items.map((item) => ({
        user_id: user.id,
        certification_id: certificationId,
        recommendation: {
          title: item.title,
          target_date: item.target_date ?? null,
          notes: item.notes ?? null,
        } satisfies SuggestedMilestone,
        reason: item.reason,
        confidence: item.confidence,
        status: "pending",
      }))
    )
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, suggestions: (inserted ?? []) as CertificationStudyPlanSuggestion[] });
}
