import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { DocumentRecord, DocumentSuggestion, SuggestedAssignment } from "@/types/database.types";

// Only formats Claude's document/image input actually accepts -- Office
// formats would need a conversion step this pass deliberately doesn't
// build (see the Documents architecture's own MVP cut on in-browser Office
// preview; same reasoning applies here).
const SUPPORTED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

const EXTRACTION_PROMPT = `You are reading a course syllabus. Extract every assignment, exam, quiz, project, paper, discussion, or reading with a concrete deliverable or due date. For each one:
- title: a short, human-readable name.
- type: the best-fitting category.
- due_date: ISO 8601 (YYYY-MM-DD) ONLY if the syllabus states an unambiguous date including a year you can determine from context (e.g. a stated term/semester). If the year is ambiguous or absent, leave this null -- do not guess a year.
- points_possible / weight_percent: only if explicitly stated; otherwise null. Never invent a number.
- priority: infer from how the syllabus frames it (exams/finals worth a large weight = high or urgent; routine homework = medium or low), not a fixed default.
- reason: one sentence on why this was extracted.
- evidence: the exact excerpt from the document this came from, verbatim.
- confidence: "high" only if the date and title are both explicit and unambiguous in the text; "medium" if inferred from context; "low" if uncertain.

Do not invent assignments that aren't actually in the document. If nothing qualifies, return an empty list.`;

const EXTRACTION_TOOL: Anthropic.Tool = {
  name: "propose_assignments",
  description: "Propose assignments extracted from a syllabus for human review -- never applied automatically.",
  input_schema: {
    type: "object",
    properties: {
      assignments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            type: {
              type: "string",
              enum: ["homework", "quiz", "exam", "paper", "project", "discussion", "reading", "other"],
            },
            due_date: { type: ["string", "null"] },
            points_possible: { type: ["number", "null"] },
            weight_percent: { type: ["number", "null"] },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
            reason: { type: "string" },
            evidence: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["title", "type", "priority", "reason", "confidence"],
        },
      },
    },
    required: ["assignments"],
  },
};

interface ExtractedAssignment extends SuggestedAssignment {
  reason: string;
  evidence: string | null;
  confidence: "high" | "medium" | "low";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Extraction isn't configured on this deployment yet." }, { status: 500 });
  }

  const { documentId } = (await request.json()) as { documentId?: string };
  if (!documentId) return NextResponse.json({ error: "Missing documentId." }, { status: 400 });

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single<DocumentRecord>();
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (document.category !== "syllabus") {
    return NextResponse.json({ error: "Extraction only runs on documents categorized as Syllabus." }, { status: 400 });
  }
  if (!SUPPORTED_MIME_TYPES.has(document.mime_type)) {
    return NextResponse.json(
      { error: "This file type isn't supported for extraction yet -- re-upload the syllabus as a PDF or image." },
      { status: 400 }
    );
  }

  const { data: file, error: downloadError } = await supabase.storage.from("documents").download(document.storage_path);
  if (downloadError || !file) {
    return NextResponse.json({ error: "The file couldn't be read from storage." }, { status: 500 });
  }
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const contentBlock: Anthropic.Base64PDFSource | Anthropic.Base64ImageSource =
    document.mime_type === "application/pdf"
      ? { type: "base64", media_type: "application/pdf", data: base64 }
      : { type: "base64", media_type: document.mime_type as "image/png" | "image/jpeg" | "image/webp", data: base64 };

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: "tool", name: "propose_assignments" },
      messages: [
        {
          role: "user",
          content: [
            document.mime_type === "application/pdf"
              ? { type: "document", source: contentBlock as Anthropic.Base64PDFSource }
              : { type: "image", source: contentBlock as Anthropic.Base64ImageSource },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Extraction failed." }, { status: 502 });
  }

  const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  const assignments = (toolUse?.input as { assignments?: ExtractedAssignment[] } | undefined)?.assignments ?? [];

  if (assignments.length === 0) {
    return NextResponse.json({ ok: true, suggestions: [] });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("document_suggestions")
    .insert(
      assignments.map((a) => ({
        document_id: documentId,
        user_id: user.id,
        recommendation: {
          title: a.title,
          type: a.type,
          due_date: a.due_date ?? null,
          points_possible: a.points_possible ?? null,
          weight_percent: a.weight_percent ?? null,
          priority: a.priority,
        } satisfies SuggestedAssignment,
        reason: a.reason,
        evidence: a.evidence ?? null,
        confidence: a.confidence,
        status: "pending",
      }))
    )
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, suggestions: (inserted ?? []) as DocumentSuggestion[] });
}
