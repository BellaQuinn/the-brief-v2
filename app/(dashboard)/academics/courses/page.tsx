import { createClient } from "@/lib/supabase/server";
import { CoursesClient } from "@/components/academics/courses/CoursesClient";
import type { Assignment, Course, Degree, Term } from "@/types/database.types";

export interface CourseWithFullContext extends Course {
  assignments: Assignment[];
  term: Term & { degree: Degree };
}

export default async function CoursesPage() {
  const supabase = await createClient();

  // Every course across every degree — same "everything on file"
  // philosophy as Assignments and Calendar. Assignments come along in
  // the same query so the detail panel's grade computation never needs
  // a second round-trip once a course is selected.
  const { data } = await supabase
    .from("courses")
    .select("*, assignments(*), term:terms(*, degree:degrees(*))")
    .order("created_at", { ascending: true })
    .returns<CourseWithFullContext[]>();

  return <CoursesClient initialCourses={data ?? []} />;
}
