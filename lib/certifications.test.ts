import { describe, expect, it, vi, afterEach } from "vitest";
import { nextCertificationExam } from "@/lib/certifications";
import type { Certification } from "@/types/database.types";

function makeCert(overrides: Partial<Certification> = {}): Certification {
  return {
    id: `cert-${Math.random()}`,
    user_id: "u1",
    name: "AWS Certified Solutions Architect",
    provider: "AWS",
    status: "studying",
    exam_date: null,
    expiration_date: null,
    progress: 0,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

describe("nextCertificationExam", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when nothing has an exam date", () => {
    expect(nextCertificationExam([makeCert({ exam_date: null })])).toBeNull();
  });

  it("returns null when the only exam dates are in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 15));
    const result = nextCertificationExam([makeCert({ exam_date: "2026-08-01" })]);
    expect(result).toBeNull();
  });

  it("ignores certifications that are not studying or scheduled", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 1));
    const result = nextCertificationExam([makeCert({ status: "passed", exam_date: "2026-09-01" })]);
    expect(result).toBeNull();
  });

  it("picks the nearest future exam by name and day count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 1));
    const result = nextCertificationExam([
      makeCert({ name: "Far exam", exam_date: "2026-09-15", status: "scheduled" }),
      makeCert({ name: "Near exam", exam_date: "2026-08-13", status: "studying" }),
    ]);
    expect(result).toEqual({ name: "Near exam", daysUntil: 12 });
  });
});
