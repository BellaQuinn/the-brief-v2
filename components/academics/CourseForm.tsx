"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Course, CourseDeliveryMode, CourseStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: "in_progress", label: "In progress" },
  { value: "planned", label: "Planned" },
  { value: "completed", label: "Completed" },
  { value: "withdrawn", label: "Withdrawn" },
];

const DELIVERY_OPTIONS: { value: CourseDeliveryMode | ""; label: string }[] = [
  { value: "", label: "Not set" },
  { value: "online", label: "Online" },
  { value: "in_person", label: "In person" },
  { value: "hybrid", label: "Hybrid" },
];

interface CourseFormProps {
  termId: string;
  course?: Course | null;
  onSaved: (course: Course) => void;
  onCancel: () => void;
}

export function CourseForm({ termId, course, onSaved, onCancel }: CourseFormProps) {
  const supabase = createClient();
  const [courseCode, setCourseCode] = useState(course?.course_code ?? "");
  const [courseName, setCourseName] = useState(course?.course_name ?? "");
  const [credits, setCredits] = useState(String(course?.credits ?? "3"));
  const [professor, setProfessor] = useState(course?.professor ?? "");
  const [deliveryMode, setDeliveryMode] = useState<CourseDeliveryMode | "">(course?.delivery_mode ?? "");
  const [status, setStatus] = useState<CourseStatus>(course?.status ?? "planned");
  const [notes, setNotes] = useState(course?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      course_code: courseCode || null,
      course_name: courseName,
      credits: credits ? Number(credits) : null,
      professor: professor || null,
      delivery_mode: deliveryMode || null,
      status,
      notes: notes || null,
    };

    const { data, error } = course
      ? await supabase.from("courses").update(payload).eq("id", course.id).select().single()
      : await supabase.from("courses").insert({ ...payload, term_id: termId }).select().single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Course);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Course code" placeholder="CYBR 320" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
        <Input label="Credits" type="number" min={0} value={credits} onChange={(e) => setCredits(e.target.value)} />
      </div>
      <Input
        label="Course name"
        required
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Professor" value={professor} onChange={(e) => setProfessor(e.target.value)} />
        <Select
          label="Delivery mode"
          value={deliveryMode}
          onChange={(e) => setDeliveryMode(e.target.value as CourseDeliveryMode | "")}
          options={DELIVERY_OPTIONS}
        />
      </div>
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as CourseStatus)}
        options={STATUS_OPTIONS}
      />
      <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
