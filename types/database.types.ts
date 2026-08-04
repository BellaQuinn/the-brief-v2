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
export type LawSchoolStatus =
  | "researching"
  | "planning_to_apply"
  | "applying"
  | "applied"
  | "waitlisted"
  | "accepted"
  | "rejected"
  | "enrolled";
export type LawSchoolPriority = "dream" | "reach" | "target" | "safety";
export type ScholarshipStatus = "researching" | "eligible" | "applying" | "applied" | "awarded" | "declined";
export type MilestoneStatus = "upcoming" | "in_progress" | "completed";
export type DocumentCategory = "essay" | "recommendation" | "transcript" | "financial" | "other";

// Added by database/add_documents.sql — the shared Academic Documents
// system, distinct from LawSchoolDocument/DocumentCategory above (that one
// stays law-school-only; this one spans every domain).
export type AcademicDocumentCategory =
  | "syllabus"
  | "notes"
  | "assignment_submission"
  | "reference"
  | "transcript"
  | "certificate"
  | "resume"
  | "cover_letter"
  | "recommendation"
  | "financial"
  | "essay"
  | "other";
export type DocumentRelationshipEntityType =
  | "degree"
  | "term"
  | "course"
  | "assignment"
  | "certification"
  | "application"
  | "law_school"
  | "scholarship"
  | "milestone";
export type DocumentStatus = "active" | "archived";

// Added by database/add_document_suggestions.sql — Syllabus Intelligence.
export type DocumentSuggestionConfidence = "high" | "medium" | "low";
export type DocumentSuggestionStatus = "pending" | "accepted" | "edited_and_accepted" | "dismissed";

// The proposed assignment fields Claude extracts from a syllabus — mirrors
// Assignment's own shape, kept loose (all optional except title) since a
// syllabus rarely states every field explicitly.
export interface SuggestedAssignment {
  title: string;
  type: AssignmentType;
  due_date: string | null;
  points_possible: number | null;
  weight_percent: number | null;
  priority: PriorityLevel;
}

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  timezone: string;
  resume_url: string | null;
  resume_updated_at: string | null;
  // Added by database/add_graduate_law_school.sql — singleton LSAT prep
  // settings, same pattern as resume_url/resume_updated_at above.
  lsat_goal_score: number | null;
  lsat_diagnostic_score: number | null;
  lsat_planned_test_date: string | null;
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
  // Added by database/add_academic_standing.sql. Escape hatch for a grade
  // assignment data can't capture (instructor curve, transfer/legacy
  // course) — a grade string from the institution policy's scale, e.g.
  // "A-", or a non-GPA mark like "W"/"I"/"P"/"AU".
  final_grade_override: string | null;
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
  // Added by database/add_academic_standing.sql. If set on any included
  // assignment in a course, that course's grade is a weight-normalized
  // average instead of simple points aggregation.
  weight_percent: number | null;
  // Added by database/add_academic_standing.sql. Excludes this assignment
  // from grade calculations (extra credit, a dropped lowest score) without
  // deleting it.
  grade_excluded: boolean;
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
// Graduate & Law School — direct-ownership tables (user_id -> users), same
// simple-RLS pattern as Certification/Application/NetworkingContact/Resource
// above, not nested through degree/term/course like Academics.
// ----------------------------------------------------------------------------
export interface LawSchool {
  id: string;
  user_id: string;
  school_name: string;
  status: LawSchoolStatus;
  priority: LawSchoolPriority | null;
  application_deadline: string | null;
  lsat_requirement: number | null;
  median_gpa: number | null;
  median_lsat: number | null;
  essays_status: string | null;
  recommendations_status: string | null;
  why_this_school: string | null;
  personal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  user_id: string;
  law_school_id: string | null;
  name: string;
  amount: number | null;
  deadline: string | null;
  status: ScholarshipStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Added by database/add_lsat_goal_checkpoints.sql -- the goal-gap planner.
export interface LsatGoalCheckpoint {
  id: string;
  user_id: string;
  target_date: string;
  target_score: number;
  label: string | null;
  created_at: string;
  updated_at: string;
}

export interface LsatPracticeTest {
  id: string;
  user_id: string;
  test_date: string;
  source: string | null;
  scaled_score: number | null;
  logical_reasoning_score: number | null;
  reading_comprehension_score: number | null;
  analytical_reasoning_score: number | null;
  timed: boolean;
  confidence: number | null;
  missed_questions: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LawSchoolDocument {
  id: string;
  user_id: string;
  law_school_id: string | null;
  title: string;
  category: DocumentCategory;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  title: string;
  target_date: string | null;
  status: MilestoneStatus;
  progress: number;
  notes: string | null;
  linked_href: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Named `*Record`, not `PushSubscription` — that name is already the
// browser's native Push API type (lib/pushClient.ts deals in those
// directly), and reusing it here for the database row would collide.
export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationLogEntry {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  reminder_window: string;
  sent_at: string;
}

// ----------------------------------------------------------------------------
// Academic Documents — database/add_documents.sql. Shared across every
// domain (see AcademicDocumentCategory/DocumentRelationshipEntityType
// above), plus the first real Supabase Storage usage in this app.
// ----------------------------------------------------------------------------
export interface DocumentRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: AcademicDocumentCategory;
  status: DocumentStatus;
  is_favorite: boolean;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  extracted_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRelationship {
  id: string;
  document_id: string;
  user_id: string;
  entity_type: DocumentRelationshipEntityType;
  entity_id: string;
  created_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  version_number: number;
  uploaded_at: string;
}

export interface DocumentView {
  id: string;
  document_id: string;
  user_id: string;
  viewed_at: string;
}

export interface DocumentSuggestion {
  id: string;
  document_id: string;
  user_id: string;
  recommendation: SuggestedAssignment;
  reason: string;
  evidence: string | null;
  confidence: DocumentSuggestionConfidence;
  status: DocumentSuggestionStatus;
  resolved_at: string | null;
  created_at: string;
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

// Documents workspace's list/card view needs both the raw relationship rows
// (for editing) and a resolved, human-readable label per relationship (for
// display) — entity_id alone means nothing on screen. Resolution happens at
// the data layer (app/(dashboard)/academics/documents/page.tsx), not here.
export interface DocumentRelationshipWithLabel extends DocumentRelationship {
  label: string;
}

export interface DocumentWithRelationships extends DocumentRecord {
  relationships: DocumentRelationshipWithLabel[];
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
      law_schools: { Row: LawSchool; Insert: Partial<LawSchool>; Update: Partial<LawSchool>; Relationships: [] };
      scholarships: { Row: Scholarship; Insert: Partial<Scholarship>; Update: Partial<Scholarship>; Relationships: [] };
      lsat_practice_tests: {
        Row: LsatPracticeTest;
        Insert: Partial<LsatPracticeTest>;
        Update: Partial<LsatPracticeTest>;
        Relationships: [];
      };
      lsat_goal_checkpoints: {
        Row: LsatGoalCheckpoint;
        Insert: Partial<LsatGoalCheckpoint>;
        Update: Partial<LsatGoalCheckpoint>;
        Relationships: [];
      };
      law_school_documents: {
        Row: LawSchoolDocument;
        Insert: Partial<LawSchoolDocument>;
        Update: Partial<LawSchoolDocument>;
        Relationships: [];
      };
      milestones: { Row: Milestone; Insert: Partial<Milestone>; Update: Partial<Milestone>; Relationships: [] };
      push_subscriptions: {
        Row: PushSubscriptionRecord;
        Insert: Partial<PushSubscriptionRecord>;
        Update: Partial<PushSubscriptionRecord>;
        Relationships: [];
      };
      notification_log: {
        Row: NotificationLogEntry;
        Insert: Partial<NotificationLogEntry>;
        Update: Partial<NotificationLogEntry>;
        Relationships: [];
      };
      documents: {
        Row: DocumentRecord;
        Insert: Partial<DocumentRecord>;
        Update: Partial<DocumentRecord>;
        Relationships: [];
      };
      document_relationships: {
        Row: DocumentRelationship;
        Insert: Partial<DocumentRelationship>;
        Update: Partial<DocumentRelationship>;
        Relationships: [];
      };
      document_versions: {
        Row: DocumentVersion;
        Insert: Partial<DocumentVersion>;
        Update: Partial<DocumentVersion>;
        Relationships: [];
      };
      document_views: {
        Row: DocumentView;
        Insert: Partial<DocumentView>;
        Update: Partial<DocumentView>;
        Relationships: [];
      };
      document_suggestions: {
        Row: DocumentSuggestion;
        Insert: Partial<DocumentSuggestion>;
        Update: Partial<DocumentSuggestion>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
