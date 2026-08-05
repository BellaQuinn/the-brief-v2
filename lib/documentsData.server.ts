import type { SupabaseClient } from "@supabase/supabase-js";
import type { EntityOptionMap } from "@/components/documents/DocumentRelationshipPicker";
import type {
  Database,
  DocumentRelationship,
  DocumentRelationshipEntityType,
  DocumentRecord,
  DocumentWithRelationships,
} from "@/types/database.types";

// Shared by both the global Documents workspace and the Courses
// workspace's embedded per-course section -- one fetch/label-resolution
// path, not two, so a document's relationship label can never drift
// between where it's shown (Documents feeds the global search & filter,
// Courses feeds the CourseDocumentsSection.tsx panel embedded per course).
export async function fetchDocumentsWorkspaceData(
  supabase: SupabaseClient<Database>
): Promise<{ documents: DocumentWithRelationships[]; entityOptions: EntityOptionMap }> {
  const [
    { data: documentsRaw },
    { data: degrees },
    { data: terms },
    { data: courses },
    { data: assignments },
    { data: certifications },
    { data: applications },
    { data: lawSchools },
    { data: scholarships },
    { data: milestones },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("*, document_relationships(*)")
      .order("updated_at", { ascending: false })
      .returns<(DocumentRecord & { document_relationships: DocumentRelationship[] })[]>(),
    supabase.from("degrees").select("id, degree_name"),
    supabase.from("terms").select("id, name, degree:degrees(degree_name)"),
    supabase.from("courses").select("id, course_code, course_name"),
    supabase.from("assignments").select("id, title, course:courses(course_code, course_name)"),
    supabase.from("certifications").select("id, name"),
    supabase.from("applications").select("id, company, position"),
    supabase.from("law_schools").select("id, school_name"),
    supabase.from("scholarships").select("id, name"),
    supabase.from("milestones").select("id, title"),
  ]);

  const entityOptions: EntityOptionMap = {
    degree: (degrees ?? []).map((d) => ({ id: d.id, label: d.degree_name })),
    term: (terms ?? []).map((t) => ({
      id: t.id,
      label: `${(t.degree as unknown as { degree_name: string } | null)?.degree_name ?? "Degree"} — ${t.name}`,
    })),
    course: (courses ?? []).map((c) => ({ id: c.id, label: c.course_code ?? c.course_name })),
    assignment: (assignments ?? []).map((a) => {
      const course = a.course as unknown as { course_code: string | null; course_name: string } | null;
      return { id: a.id, label: `${a.title}${course ? ` (${course.course_code ?? course.course_name})` : ""}` };
    }),
    certification: (certifications ?? []).map((c) => ({ id: c.id, label: c.name })),
    application: (applications ?? []).map((a) => ({ id: a.id, label: `${a.position} — ${a.company}` })),
    law_school: (lawSchools ?? []).map((s) => ({ id: s.id, label: s.school_name })),
    scholarship: (scholarships ?? []).map((s) => ({ id: s.id, label: s.name })),
    milestone: (milestones ?? []).map((m) => ({ id: m.id, label: m.title })),
  };

  const labelLookup = new Map<string, string>();
  for (const type of Object.keys(entityOptions) as DocumentRelationshipEntityType[]) {
    for (const option of entityOptions[type]) {
      labelLookup.set(`${type}:${option.id}`, option.label);
    }
  }

  const documents: DocumentWithRelationships[] = (documentsRaw ?? []).map((doc) => {
    const { document_relationships, ...rest } = doc;
    return {
      ...rest,
      relationships: document_relationships.map((r) => ({
        ...r,
        label: labelLookup.get(`${r.entity_type}:${r.entity_id}`) ?? "(no longer available)",
      })),
    };
  });

  return { documents, entityOptions };
}
