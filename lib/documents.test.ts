import { describe, expect, it } from "vitest";
import { filterDocuments, formatFileSize, getFileKind, sortDocumentsByRecency } from "@/lib/documents";
import type { DocumentWithRelationships } from "@/types/database.types";

function makeDoc(overrides: Partial<DocumentWithRelationships> = {}): DocumentWithRelationships {
  return {
    id: "d1",
    user_id: "u1",
    title: "CS-340 Syllabus",
    description: null,
    category: "syllabus",
    status: "active",
    is_favorite: false,
    storage_path: "u1/d1/1-syllabus.pdf",
    file_name: "syllabus.pdf",
    file_size: 12345,
    mime_type: "application/pdf",
    extracted_text: null,
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z",
    relationships: [],
    ...overrides,
  };
}

describe("getFileKind", () => {
  it("classifies pdf, image, office, and text", () => {
    expect(getFileKind("application/pdf")).toBe("pdf");
    expect(getFileKind("image/png")).toBe("image");
    expect(getFileKind("image/jpeg")).toBe("image");
    expect(getFileKind("text/plain")).toBe("text");
    expect(
      getFileKind("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ).toBe("office");
    expect(getFileKind("application/msword")).toBe("office");
  });

  it("falls back to other for unrecognized types", () => {
    expect(getFileKind("application/zip")).toBe("other");
  });
});

describe("formatFileSize", () => {
  it("formats bytes, kilobytes, and megabytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});

describe("filterDocuments", () => {
  const docs = [
    makeDoc({ id: "d1", title: "CS-340 Syllabus", category: "syllabus", is_favorite: true }),
    makeDoc({
      id: "d2",
      title: "Resume 2026",
      category: "resume",
      relationships: [{ id: "r1", document_id: "d2", user_id: "u1", entity_type: "application", entity_id: "a1", created_at: "", label: "Acme Corp" }],
    }),
    makeDoc({ id: "d3", title: "Old Notes", status: "archived" }),
  ];

  it("defaults to active status only", () => {
    const result = filterDocuments(docs);
    expect(result.map((d) => d.id)).toEqual(["d1", "d2"]);
  });

  it("filters by category", () => {
    expect(filterDocuments(docs, { category: "resume" }).map((d) => d.id)).toEqual(["d2"]);
  });

  it("filters by favoritesOnly", () => {
    expect(filterDocuments(docs, { favoritesOnly: true }).map((d) => d.id)).toEqual(["d1"]);
  });

  it("filters by entityType via relationships", () => {
    expect(filterDocuments(docs, { entityType: "application" }).map((d) => d.id)).toEqual(["d2"]);
  });

  it("filters by case-insensitive search across title and description", () => {
    expect(filterDocuments(docs, { search: "syllabus" }).map((d) => d.id)).toEqual(["d1"]);
    expect(filterDocuments(docs, { search: "RESUME" }).map((d) => d.id)).toEqual(["d2"]);
  });

  it("includes archived only when explicitly requested", () => {
    expect(filterDocuments(docs, { status: "archived" }).map((d) => d.id)).toEqual(["d3"]);
  });
});

describe("sortDocumentsByRecency", () => {
  it("orders most recently updated first without mutating the input", () => {
    const docs = [
      makeDoc({ id: "old", updated_at: "2026-01-01T00:00:00.000Z" }),
      makeDoc({ id: "new", updated_at: "2026-08-01T00:00:00.000Z" }),
    ];
    const sorted = sortDocumentsByRecency(docs);
    expect(sorted.map((d) => d.id)).toEqual(["new", "old"]);
    expect(docs.map((d) => d.id)).toEqual(["old", "new"]);
  });
});
