import type {
  AcademicDocumentCategory,
  DocumentRelationshipEntityType,
  DocumentStatus,
  DocumentWithRelationships,
} from "@/types/database.types";

export const CATEGORY_LABEL: Record<AcademicDocumentCategory, string> = {
  syllabus: "Syllabus",
  notes: "Notes",
  assignment_submission: "Assignment submission",
  reference: "Reference",
  transcript: "Transcript",
  certificate: "Certificate",
  resume: "Resume",
  cover_letter: "Cover letter",
  recommendation: "Recommendation",
  financial: "Financial",
  essay: "Essay",
  other: "Other",
};

export const ENTITY_TYPE_LABEL: Record<DocumentRelationshipEntityType, string> = {
  degree: "Degree",
  term: "Term",
  course: "Course",
  assignment: "Assignment",
  certification: "Certification",
  application: "Application",
  law_school: "Law school",
  scholarship: "Scholarship",
  milestone: "Milestone",
};

export type FileKind = "pdf" | "image" | "office" | "text" | "other";

// Drives preview treatment (inline for pdf/image, download-link fallback
// for everything else) -- not a full MIME registry, just enough branches
// to route the UI correctly.
export function getFileKind(mimeType: string): FileKind {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "text/plain") return "text";
  if (
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("powerpoint") ||
    mimeType.includes("officedocument")
  ) {
    return "office";
  }
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  const rounded = mb < 10 ? Math.round(mb * 10) / 10 : Math.round(mb);
  return `${rounded} MB`;
}

export interface DocumentFilters {
  search?: string;
  category?: AcademicDocumentCategory;
  entityType?: DocumentRelationshipEntityType;
  status?: DocumentStatus;
  favoritesOnly?: boolean;
}

// `status` defaults to "active" when omitted -- archived items are opt-in,
// never mixed into the default list (same "silence over clutter" pattern
// as everything else: an archived item shouldn't compete for attention
// with what's actually in use).
export function filterDocuments(
  documents: DocumentWithRelationships[],
  filters: DocumentFilters = {}
): DocumentWithRelationships[] {
  const status = filters.status ?? "active";
  const search = filters.search?.trim().toLowerCase();

  return documents.filter((doc) => {
    if (doc.status !== status) return false;
    if (filters.category && doc.category !== filters.category) return false;
    if (filters.favoritesOnly && !doc.is_favorite) return false;
    if (filters.entityType && !doc.relationships.some((r) => r.entity_type === filters.entityType)) {
      return false;
    }
    if (search) {
      const haystack = `${doc.title} ${doc.description ?? ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export function sortDocumentsByRecency(documents: DocumentWithRelationships[]): DocumentWithRelationships[] {
  return [...documents].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
