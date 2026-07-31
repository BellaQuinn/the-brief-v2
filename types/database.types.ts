// ============================================================================
// THE BRIEF — Database Types
// Hand-authored to match database/schema.sql exactly.
// Once the project is live, replace with generated types:
//   npx supabase gen types typescript --project-id <id> > types/database.types.ts
// ============================================================================

export type DegreeStatus = "active" | "completed" | "paused" | "planned";
export type TermStatus = "upcoming" | "active" | "completed";
export type CourseDeliveryMode = "in_person" | "online" | "hybrid";
export type CourseStatus = "in_progress" | "completed" | "withdrawn" | "planned";
export type AssignmentType =
  | "homework"
  | "quiz"
  | "exam"
  | "paper"
  | "project"
  | "discussion"
  | "reading"
  | "other";
export type AssignmentStatus = "not_started" | "in_progress" | "submitted" | "graded";
export type PriorityLevel = "low" | "medium" | "high" | "urgent";
export type CertificationStatus =
  | "planned"
  | "studying"
  | "scheduled"
  | "passed"
  | "failed"
  | "expired";
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "phone_screen"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";
export type ResourceCategory = "book" | "article" | "template" | "link" | "course" | "other";

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  timezone: string;
  resume_url: string | null;
  resume_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Degree {
  id: string;
  user_id: string;
  school_name: string;
  degree_name: string;
  major: string | null;
  minor: string | null;
  catalog_year: string | null;
  total_credits: number | null;
  completed_credits: number;
  expected_graduation: string | null;
  status: DegreeStatus;
  created_at: string;
  updated_at: string;
}

export interface Term {
  id: string;
  degree_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: TermStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  term_id: string;
  course_code: string | null;
  course_name: string;
  credits: number | null;
  professor: string | null;
  delivery_mode: CourseDeliveryMode | null;
  status: CourseStatus;
  // Added by database/migrate_v1_data.sql — not in the original schema.sql.
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  due_date: string | null;
  points_possible: number | null;
  points_earned: number | null;
  status: AssignmentStatus;
  priority: PriorityLevel;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  provider: string | null;
  status: CertificationStatus;
  exam_date: string | null;
  expiration_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  position: string;
  salary: string | null;
  location: string | null;
  status: ApplicationStatus;
  date_applied: string | null;
  next_action: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NetworkingContact {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  linkedin: string | null;
  last_contact: string | null;
  next_follow_up: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  user_id: string;
  title: string;
  category: ResourceCategory;
  url: string | null;
  notes: string | null;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Composite / query-shape types used across workspaces.
// Assignments are the single source of truth — this is the shape the
// dashboard, calendar, and course views all consume, joined once at the
// data layer rather than re-fetched or duplicated per-feature.
// ----------------------------------------------------------------------------
export interface AssignmentWithContext extends Assignment {
  course: Pick<Course, "id" | "course_code" | "course_name">;
}

// Calendar needs to say *which degree* a due date belongs to (useful once a
// user has several), hence the extra nesting through term -> degree.
export interface AssignmentWithDegreeContext extends Assignment {
  course: Pick<Course, "course_code" | "course_name"> & {
    term: { degree: Pick<Degree, "degree_name"> };
  };
}

// Academics workspace nests courses under terms under a degree. Assignments
// are lazy-loaded per course (fetched on first expand), hence optional.
export interface CourseWithAssignments extends Course {
  assignments?: Assignment[];
}

export interface TermWithCourses extends Term {
  courses: CourseWithAssignments[];
}

export interface DegreeWithTerms extends Degree {
  terms: TermWithCourses[];
}

// supabase-js's generic client requires each table to satisfy `GenericTable`
// (Row/Insert/Update/Relationships) and the schema to satisfy `GenericSchema`
// (Tables/Views/Functions) — without Relationships/Views/Functions here,
// the constraint silently fails and query builder methods like .update()
// and narrow .select() projections resolve their argument/result types to
// `never` instead of erroring at the declaration site.
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User> & { id: string; email: string };
        Update: Partial<User>;
        Relationships: [];
      };
      degrees: { Row: Degree; Insert: Partial<Degree>; Update: Partial<Degree>; Relationships: [] };
      terms: { Row: Term; Insert: Partial<Term>; Update: Partial<Term>; Relationships: [] };
      courses: { Row: Course; Insert: Partial<Course>; Update: Partial<Course>; Relationships: [] };
      assignments: {
        Row: Assignment;
        Insert: Partial<Assignment>;
        Update: Partial<Assignment>;
        Relationships: [];
      };
      certifications: {
        Row: Certification;
        Insert: Partial<Certification>;
        Update: Partial<Certification>;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: Partial<Application>;
        Update: Partial<Application>;
        Relationships: [];
      };
      networking: {
        Row: NetworkingContact;
        Insert: Partial<NetworkingContact>;
        Update: Partial<NetworkingContact>;
        Relationships: [];
      };
      resources: { Row: Resource; Insert: Partial<Resource>; Update: Partial<Resource>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
