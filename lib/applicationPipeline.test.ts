import { describe, expect, it } from "vitest";
import { groupApplicationPipeline } from "@/lib/applicationPipeline";
import type { Application, ApplicationStatus } from "@/types/database.types";

function makeApplication(status: ApplicationStatus): Application {
  return {
    id: `app-${status}-${Math.random()}`,
    user_id: "u1",
    company: "Acme",
    position: "Engineer",
    salary: null,
    location: null,
    status,
    date_applied: null,
    next_action: null,
    notes: null,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  };
}

describe("groupApplicationPipeline", () => {
  it("returns all-zero buckets for no applications", () => {
    expect(groupApplicationPipeline([])).toEqual({ saved: 0, applied: 0, interviewing: 0, offer: 0 });
  });

  it("merges phone_screen and interviewing into one stage", () => {
    const result = groupApplicationPipeline([makeApplication("phone_screen"), makeApplication("interviewing")]);
    expect(result.interviewing).toBe(2);
  });

  it("excludes terminal statuses from every bucket", () => {
    const result = groupApplicationPipeline([makeApplication("rejected"), makeApplication("withdrawn")]);
    expect(result).toEqual({ saved: 0, applied: 0, interviewing: 0, offer: 0 });
  });

  it("counts each real stage correctly", () => {
    const result = groupApplicationPipeline([
      makeApplication("saved"),
      makeApplication("saved"),
      makeApplication("applied"),
      makeApplication("offer"),
    ]);
    expect(result).toEqual({ saved: 2, applied: 1, interviewing: 0, offer: 1 });
  });
});
