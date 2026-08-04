import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { daysUntilTest, sectionAverages } from "@/lib/lsat";
import type { LsatGoalCheckpoint, LsatPracticeTest, LsatStudyPlanSuggestion, SuggestedMilestone } from "@/types/database.types";

const STUDY_PLAN_TOOL: Anthropic.Tool = {
  name: "propose_study_plan",
  description: "Propose a dated LSAT study plan for human review -- never applied automatically.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "A specific, concrete task -- not vague advice like 'study more'." },
            target_date: { type: "string", description: "ISO 8601 (YYYY-MM-DD), between today and the test date (or within the next 6 weeks if no test date is set)." },
            notes: { type: ["string", "null"], description: "Optional expanded detail on the task." },
            reason: { type: "string", description: "Why this task, grounded in the specific section averages/trends/notes given -- not generic LSAT advice." },
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

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Study plan generation isn't configured on this deployment yet." }, { status: 500 });
  }

  const [{ data: profile }, { data: tests }, { data: checkpoints }] = await Promise.all([
    supabase.from("users").select("lsat_goal_score, lsat_diagnostic_score, lsat_planned_test_date").eq("id", user.id).single(),
    supabase.from("lsat_practice_tests").select("*").order("test_date", { ascending: true }),
    supabase.from("lsat_goal_checkpoints").select("*").order("target_date", { ascending: true }),
  ]);

  const typedTests = (tests as LsatPracticeTest[]) ?? [];
  const scoredTests = typedTests.filter((t) => t.scaled_score != null);
  if (scoredTests.length === 0) {
    return NextResponse.json({ error: "Log at least one scored practice test before generating a study plan." }, { status: 400 });
  }
  if (profile?.lsat_goal_score == null) {
    return NextResponse.json({ error: "Set a goal score before generating a study plan." }, { status: 400 });
  }

  const sections = sectionAverages(typedTests);
  const daysUntil = daysUntilTest(profile.lsat_planned_test_date);
  const typedCheckpoints = (checkpoints as LsatGoalCheckpoint[]) ?? [];

  const summaryLines = [
    `Goal score: ${profile.lsat_goal_score}`,
    profile.lsat_diagnostic_score != null ? `Diagnostic score: ${profile.lsat_diagnostic_score}` : null,
    `Latest score: ${scoredTests[scoredTests.length - 1]!.scaled_score}`,
    daysUntil != null ? `Days until planned test: ${daysUntil}` : "No planned test date set -- plan over the next 6 weeks.",
    "",
    "Section averages (independent per section, not cross-compared):",
    sections.logicalReasoning.average != null
      ? `- Logical Reasoning: avg ${sections.logicalReasoning.average.toFixed(1)}, trend ${sections.logicalReasoning.trend}`
      : "- Logical Reasoning: not enough data yet",
    sections.readingComprehension.average != null
      ? `- Reading Comprehension: avg ${sections.readingComprehension.average.toFixed(1)}, trend ${sections.readingComprehension.trend}`
      : "- Reading Comprehension: not enough data yet",
    sections.analyticalReasoning.average != null
      ? `- Analytical Reasoning: avg ${sections.analyticalReasoning.average.toFixed(1)}, trend ${sections.analyticalReasoning.trend}`
      : "- Analytical Reasoning: not enough data yet",
    "",
    "Recent practice test notes (most recent first):",
    ...scoredTests
      .slice(-5)
      .reverse()
      .map((t) => `- ${t.test_date} (score ${t.scaled_score}): ${t.notes ?? "no notes"}`),
    "",
    typedCheckpoints.length > 0
      ? `Existing planned checkpoints: ${typedCheckpoints.map((c) => `${c.target_score} by ${c.target_date}`).join(", ")}`
      : "No goal checkpoints planned yet.",
  ].filter((line): line is string => line != null);

  const prompt = `You are helping a student prepare for the LSAT. Based only on the data below, propose a focused study plan as a list of dated, concrete tasks. Prioritize whichever section shows the lowest average or a declining trend. Do not invent weaknesses the data doesn't show, and do not give generic advice ("practice more") -- every item must be specific and its reason must cite the actual numbers or notes given.

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
    .from("lsat_study_plan_suggestions")
    .insert(
      items.map((item) => ({
        user_id: user.id,
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

  return NextResponse.json({ ok: true, suggestions: (inserted ?? []) as LsatStudyPlanSuggestion[] });
}
