#!/usr/bin/env node
// Seeds a standalone demo account with fictional data across every
// workspace, for showcasing The Brief without exposing real personal data.
// Re-runnable: deletes any existing demo user first (cascades everything
// via FK on delete cascade), then rebuilds from scratch.
//
// Usage: node scripts/seed-demo-account.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(projectRoot, ".env.local");
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const DEMO_EMAIL = "demo@thebrief.app";
export const DEMO_PASSWORD = "ShowcaseDemo2026!";

// timestamptz columns need a noon-UTC anchor -- storing a bare date at
// literal UTC midnight rolls back a day for any negative-UTC-offset reader
// (the exact bug AssignmentForm.tsx had to fix once for real user input).
function noon(dateStr) {
  return `${dateStr}T12:00:00.000Z`;
}

function assertNoError(label, error) {
  if (error) {
    console.error(`Failed: ${label}`, error);
    process.exit(1);
  }
}

// A minimal, hand-built single-page PDF (no dependency) -- ASCII-only
// content so string .length matches byte length for the xref offsets.
function buildSimplePdf(lines) {
  const fontSize = 11;
  const leading = 14;
  let content = `BT /F1 ${fontSize} Tf ${leading} TL 50 740 Td\n`;
  for (const line of lines) {
    const escaped = line.replace(/([()\\])/g, "\\$1");
    content += `(${escaped}) Tj T*\n`;
  }
  content += "ET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf-8");
}

async function main() {
  console.log("Checking for an existing demo account...");
  const { data: existingList } = await supabase.auth.admin.listUsers();
  const existing = existingList.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    console.log("Found one -- deleting for a clean reseed (cascades everything)...");
    await supabase.auth.admin.deleteUser(existing.id);
  }

  console.log("Creating demo auth user...");
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: "Alex", last_name: "Rivera" },
  });
  assertNoError("create demo user", createError);
  const userId = created.user.id;
  console.log("Created:", userId);

  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      timezone: "America/Chicago",
      resume_url: "https://docs.google.com/document/d/1DemoResumeAlexRivera/edit",
      resume_updated_at: noon("2026-07-15"),
      lsat_goal_score: 162,
      lsat_diagnostic_score: 152,
      lsat_planned_test_date: "2026-12-06",
    })
    .eq("id", userId);
  assertNoError("update users profile", userUpdateError);

  // ---------------------------------------------------------------- Degrees
  console.log("Seeding degrees...");
  const { data: degrees, error: degreesError } = await supabase
    .from("degrees")
    .insert([
      {
        user_id: userId,
        school_name: "Lakeshore State University",
        degree_name: "B.S. Business Administration",
        major: "Business Administration",
        minor: "Marketing",
        catalog_year: "2023-2024",
        total_credits: 120,
        completed_credits: 78,
        expected_graduation: "2027-05-15",
        status: "active",
      },
      {
        user_id: userId,
        school_name: "Lakeshore State University",
        degree_name: "M.S. Data Analytics",
        major: "Data Analytics",
        catalog_year: "2027-2028",
        total_credits: 36,
        completed_credits: 0,
        expected_graduation: "2029-05-15",
        status: "planned",
      },
    ])
    .select();
  assertNoError("insert degrees", degreesError);
  const bsDegree = degrees.find((d) => d.degree_name.startsWith("B.S."));

  // ---------------------------------------------------------------- Terms
  console.log("Seeding terms...");
  const { data: terms, error: termsError } = await supabase
    .from("terms")
    .insert([
      { degree_id: bsDegree.id, name: "Spring 2026", start_date: "2026-01-12", end_date: "2026-05-02", status: "completed" },
      { degree_id: bsDegree.id, name: "Summer 2026", start_date: "2026-05-18", end_date: "2026-07-24", status: "completed" },
      { degree_id: bsDegree.id, name: "Fall 2026", start_date: "2026-07-27", end_date: "2026-12-12", status: "active" },
    ])
    .select();
  assertNoError("insert terms", termsError);
  const springTerm = terms.find((t) => t.name === "Spring 2026");
  const summerTerm = terms.find((t) => t.name === "Summer 2026");
  const fallTerm = terms.find((t) => t.name === "Fall 2026");

  // ---------------------------------------------------------------- Courses
  console.log("Seeding courses...");
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .insert([
      { term_id: springTerm.id, course_code: "BUSN 210", course_name: "Principles of Marketing", credits: 3, professor: "Dr. Feldman", delivery_mode: "online", status: "completed" },
      { term_id: springTerm.id, course_code: "ACCT 220", course_name: "Managerial Accounting", credits: 3, professor: "Prof. Nakamura", delivery_mode: "online", status: "completed" },
      { term_id: springTerm.id, course_code: "MGMT 230", course_name: "Organizational Behavior", credits: 3, professor: "Dr. Whitfield", delivery_mode: "hybrid", status: "completed" },
      { term_id: summerTerm.id, course_code: "STAT 250", course_name: "Business Statistics", credits: 3, professor: "Dr. Alvarez", delivery_mode: "online", status: "completed" },
      { term_id: summerTerm.id, course_code: "BLAW 260", course_name: "Business Law I", credits: 3, professor: "Prof. Reyes", delivery_mode: "online", status: "completed" },
      { term_id: fallTerm.id, course_code: "FIN 310", course_name: "Financial Management", credits: 3, professor: "Dr. Okoye", delivery_mode: "hybrid", status: "in_progress" },
      { term_id: fallTerm.id, course_code: "MGMT 320", course_name: "Operations Management", credits: 3, professor: "Prof. Larsen", delivery_mode: "online", status: "in_progress" },
      { term_id: fallTerm.id, course_code: "MKTG 330", course_name: "Consumer Behavior", credits: 3, professor: "Dr. Feldman", delivery_mode: "online", status: "in_progress" },
      {
        term_id: fallTerm.id,
        course_code: "BUSN 340",
        course_name: "Strategic Management Capstone",
        credits: 3,
        professor: "Dr. Whitfield",
        delivery_mode: "hybrid",
        status: "in_progress",
        notes: "Capstone -- final project presented to a panel in week 15.",
      },
    ])
    .select();
  assertNoError("insert courses", coursesError);
  const byCode = (code) => courses.find((c) => c.course_code === code);

  // ------------------------------------------------------------ Assignments
  console.log("Seeding assignments...");
  function graded(courseId, title, type, dueDate, possible, earned, priority = "medium", weight = null) {
    return {
      course_id: courseId,
      title,
      type,
      due_date: noon(dueDate),
      points_possible: possible,
      points_earned: earned,
      status: "graded",
      priority,
      weight_percent: weight,
    };
  }
  function open(courseId, title, type, dueDate, status, priority = "medium", estimatedMinutes = null) {
    return {
      course_id: courseId,
      title,
      type,
      due_date: dueDate ? noon(dueDate) : null,
      status,
      priority,
      estimated_minutes: estimatedMinutes,
    };
  }

  const assignments = [
    // Spring 2026 -- Principles of Marketing (points-based, all graded)
    ...[
      graded(byCode("BUSN 210").id, "Market Research Brief", "paper", "2026-02-06", 100, 88, "medium"),
      graded(byCode("BUSN 210").id, "Midterm Exam", "exam", "2026-03-06", 100, 91, "high"),
      graded(byCode("BUSN 210").id, "Brand Positioning Project", "project", "2026-04-17", 150, 132, "high"),
      graded(byCode("BUSN 210").id, "Final Exam", "exam", "2026-04-28", 100, 85, "high"),
    ],
    // Spring 2026 -- Managerial Accounting
    ...[
      graded(byCode("ACCT 220").id, "Cost Analysis Worksheet", "homework", "2026-02-13", 50, 46, "low"),
      graded(byCode("ACCT 220").id, "Midterm Exam", "exam", "2026-03-13", 100, 79, "high"),
      graded(byCode("ACCT 220").id, "Budgeting Case Study", "project", "2026-04-10", 100, 90, "medium"),
      graded(byCode("ACCT 220").id, "Final Exam", "exam", "2026-04-30", 100, 83, "high"),
    ],
    // Spring 2026 -- Organizational Behavior
    ...[
      graded(byCode("MGMT 230").id, "Team Dynamics Reflection", "discussion", "2026-02-20", 30, 29, "low"),
      graded(byCode("MGMT 230").id, "Leadership Case Study", "paper", "2026-03-27", 100, 94, "medium"),
      graded(byCode("MGMT 230").id, "Final Project Presentation", "project", "2026-04-24", 150, 141, "high"),
    ],
    // Summer 2026 -- Business Statistics
    ...[
      graded(byCode("STAT 250").id, "Problem Set 1", "homework", "2026-05-29", 40, 37, "low"),
      graded(byCode("STAT 250").id, "Regression Analysis Project", "project", "2026-06-19", 100, 88, "medium"),
      graded(byCode("STAT 250").id, "Final Exam", "exam", "2026-07-17", 100, 81, "high"),
    ],
    // Summer 2026 -- Business Law I
    ...[
      graded(byCode("BLAW 260").id, "Contract Case Brief", "paper", "2026-06-05", 60, 54, "medium"),
      graded(byCode("BLAW 260").id, "Midterm Exam", "exam", "2026-06-26", 100, 92, "high"),
      graded(byCode("BLAW 260").id, "Final Exam", "exam", "2026-07-21", 100, 89, "high"),
    ],
    // Fall 2026 -- Financial Management (in progress; includes an overdue item)
    ...[
      graded(byCode("FIN 310").id, "Time Value of Money Homework", "homework", "2026-07-29", 30, 27, "low"),
      open(byCode("FIN 310").id, "Capital Budgeting Case", "project", "2026-07-30", "in_progress", "urgent", 150),
      open(byCode("FIN 310").id, "Ratio Analysis Quiz", "quiz", "2026-08-04", "not_started", "high", 45),
      open(byCode("FIN 310").id, "Valuation Problem Set", "homework", "2026-08-11", "not_started", "medium", 90),
    ],
    // Fall 2026 -- Operations Management
    ...[
      open(byCode("MGMT 320").id, "Supply Chain Discussion Post", "discussion", null, "in_progress", "low", 20),
      open(byCode("MGMT 320").id, "Process Mapping Exercise", "homework", "2026-08-06", "not_started", "medium", 60),
      open(byCode("MGMT 320").id, "Lean Six Sigma Case Study", "project", "2026-09-04", "not_started", "medium", 180),
    ],
    // Fall 2026 -- Consumer Behavior
    ...[
      open(byCode("MKTG 330").id, "Consumer Survey Design", "homework", "2026-08-09", "not_started", "medium", 90),
      open(byCode("MKTG 330").id, "Midterm Exam", "exam", "2026-10-02", "not_started", "high", null),
    ],
    // Fall 2026 -- Strategic Management Capstone (weight-based)
    ...[
      graded(byCode("BUSN 340").id, "Industry Analysis Draft", "paper", "2026-07-29", 100, 90, "medium", 20),
      open(byCode("BUSN 340").id, "Strategic Plan Draft", "project", "2026-09-18", "not_started", "high", 240),
      open(byCode("BUSN 340").id, "Final Capstone Presentation", "project", "2026-11-20", "not_started", "urgent", 300),
    ].map((a, i) => ({ ...a, weight_percent: [20, 40, 40][i] })),
  ];
  const { error: assignmentsError } = await supabase.from("assignments").insert(assignments);
  assertNoError("insert assignments", assignmentsError);

  // ------------------------------------------------------------ Certifications
  console.log("Seeding certifications...");
  const { error: certsError } = await supabase.from("certifications").insert([
    { user_id: userId, name: "Google Data Analytics Professional Certificate", provider: "Coursera / Google", status: "passed", exam_date: "2026-06-10", progress: 100 },
    { user_id: userId, name: "PMP - Project Management Professional", provider: "PMI", status: "studying", exam_date: "2026-10-15", progress: 45 },
    { user_id: userId, name: "Six Sigma Green Belt", provider: "ASQ", status: "planned", progress: 0 },
  ]);
  assertNoError("insert certifications", certsError);

  // ------------------------------------------------------------ Applications
  console.log("Seeding applications...");
  const { error: applicationsError } = await supabase.from("applications").insert([
    { user_id: userId, company: "Target Corporation", position: "Marketing Analyst", location: "Minneapolis, MN", status: "saved", notes: "Posted last week, strong fit for marketing minor." },
    { user_id: userId, company: "Best Buy", position: "Business Operations Associate", location: "Richfield, MN", status: "applied", date_applied: "2026-07-20", next_action: "Follow up if no response by Aug 10." },
    { user_id: userId, company: "3M", position: "Data Analyst Intern", location: "Maplewood, MN", status: "phone_screen", date_applied: "2026-07-10", next_action: "Phone screen scheduled Aug 6, 2pm." },
    { user_id: userId, company: "General Mills", position: "Supply Chain Analyst", location: "Golden Valley, MN", status: "interviewing", date_applied: "2026-06-28", next_action: "Second-round panel interview Thursday -- prep STAR stories." },
    { user_id: userId, company: "United Way", position: "Program Coordinator", location: "Chicago, IL", status: "offer", date_applied: "2026-06-01", next_action: "Decide by Aug 15 -- compare against General Mills outcome." },
    { user_id: userId, company: "Wells Fargo", position: "Financial Analyst", location: "Minneapolis, MN", status: "rejected", date_applied: "2026-05-15", notes: "Made it to final round; went with an internal candidate." },
  ]);
  assertNoError("insert applications", applicationsError);

  // ------------------------------------------------------------ Networking
  console.log("Seeding networking contacts...");
  const { error: networkingError } = await supabase.from("networking").insert([
    { user_id: userId, name: "Jordan Ellis", company: "General Mills", role: "Senior Recruiter", last_contact: "2026-07-22", next_follow_up: "2026-08-06", notes: "Met at the campus career fair; offered to review my resume before the panel interview." },
    { user_id: userId, company: "3M", name: "Priya Nair", role: "Data Analytics Manager", last_contact: "2026-07-15", next_follow_up: "2026-08-08", notes: "LinkedIn intro via a professor; open to an informational chat." },
    { user_id: userId, name: "Marcus Chen", company: "Target Corporation", role: "Marketing Director", last_contact: "2026-07-05", next_follow_up: "2026-07-28", notes: "Alumni from the same program -- overdue for a thank-you follow-up after our call." },
    { user_id: userId, name: "Sam Okafor", company: "Lakeshore State University Career Center", role: "Career Advisor", last_contact: "2026-07-25", next_follow_up: "2026-08-15", notes: "Reviewing my resume draft before the United Way decision deadline." },
  ]);
  assertNoError("insert networking", networkingError);

  // ------------------------------------------------------------ Law schools
  console.log("Seeding Graduate & Law School data...");
  const { data: lawSchools, error: lawSchoolsError } = await supabase
    .from("law_schools")
    .insert([
      {
        user_id: userId, school_name: "Midwest State University College of Law", status: "researching", priority: "target",
        application_deadline: "2027-02-01", lsat_requirement: 158, median_gpa: 3.5, median_lsat: 159,
        why_this_school: "Strong part-time program and a business law concentration that fits a corporate compliance path.",
      },
      {
        user_id: userId, school_name: "Great Lakes University School of Law", status: "researching", priority: "reach",
        application_deadline: "2027-01-15", lsat_requirement: 162, median_gpa: 3.7, median_lsat: 163,
        why_this_school: "Top regional reputation; would need to hit LSAT goal score to be competitive.",
      },
      {
        user_id: userId, school_name: "Riverside Law School", status: "planning_to_apply", priority: "safety",
        application_deadline: "2027-03-01", lsat_requirement: 152, median_gpa: 3.3, median_lsat: 153,
        why_this_school: "Strong scholarship history and an evening program compatible with working full-time.",
      },
    ])
    .select();
  assertNoError("insert law schools", lawSchoolsError);
  const riverside = lawSchools.find((s) => s.school_name === "Riverside Law School");

  const { error: scholarshipsError } = await supabase.from("scholarships").insert([
    { user_id: userId, law_school_id: riverside.id, name: "Riverside Merit Scholarship", amount: 15000, deadline: "2027-03-01", status: "researching", notes: "Awarded automatically with admission above median LSAT/GPA." },
  ]);
  assertNoError("insert scholarships", scholarshipsError);

  const { error: lsatError } = await supabase.from("lsat_practice_tests").insert([
    { user_id: userId, test_date: "2026-05-10", source: "Official LSAT PrepTest 90 (diagnostic)", scaled_score: 152, logical_reasoning_score: 15, reading_comprehension_score: 14, analytical_reasoning_score: 13, timed: true, confidence: 2, missed_questions: 32, notes: "Diagnostic -- logic games were the weakest section." },
    { user_id: userId, test_date: "2026-06-21", source: "Official LSAT PrepTest 95", scaled_score: 156, logical_reasoning_score: 17, reading_comprehension_score: 15, analytical_reasoning_score: 15, timed: true, confidence: 3, missed_questions: 24, notes: "Logic games improving with the drilling schedule." },
    { user_id: userId, test_date: "2026-07-26", source: "Official LSAT PrepTest 101", scaled_score: 159, logical_reasoning_score: 18, reading_comprehension_score: 16, analytical_reasoning_score: 16, timed: true, confidence: 4, missed_questions: 18, notes: "Best score yet -- 3 points left to goal." },
  ]);
  assertNoError("insert lsat practice tests", lsatError);

  const { error: milestonesError } = await supabase.from("milestones").insert([
    { user_id: userId, title: "Take the LSAT", target_date: "2026-12-06", status: "in_progress", progress: 60, sort_order: 1, linked_href: "/academics/graduate-law-school/lsat" },
    { user_id: userId, title: "Request recommendation letters", target_date: "2026-09-15", status: "upcoming", progress: 0, sort_order: 2 },
    { user_id: userId, title: "Draft personal statement", target_date: "2026-10-01", status: "upcoming", progress: 10, sort_order: 3 },
    { user_id: userId, title: "Submit CAS report", target_date: "2027-01-05", status: "upcoming", progress: 0, sort_order: 4 },
    { user_id: userId, title: "Submit primary applications", target_date: "2027-02-01", status: "upcoming", progress: 0, sort_order: 5 },
  ]);
  assertNoError("insert milestones", milestonesError);

  const { error: lawDocsError } = await supabase.from("law_school_documents").insert([
    { user_id: userId, title: "Personal Statement -- First Draft", category: "essay", notes: "Needs a stronger opening paragraph; career advisor reviewing next week." },
  ]);
  assertNoError("insert law school documents", lawDocsError);

  // ------------------------------------------------------------ Documents
  console.log("Seeding Academic Documents (uploads a few real files to Storage)...");
  const capstoneCourse = byCode("BUSN 340");

  const syllabusPdf = buildSimplePdf([
    "BUSN 340 -- Strategic Management Capstone",
    "Fall 2026 -- Dr. Whitfield",
    "",
    "Course Description: Integrates functional business knowledge into a",
    "capstone strategic analysis project, culminating in a panel presentation.",
    "",
    "Assignments:",
    "- Industry Analysis Draft -- due Jul 29, 2026 -- 100 pts -- 20% of grade",
    "- Strategic Plan Draft -- due Sep 18, 2026 -- 40% of grade",
    "- Final Capstone Presentation -- due Nov 20, 2026 -- 40% of grade",
    "",
    "Late work policy: 10% deducted per day late, up to 3 days.",
  ]);

  const resumeText = Buffer.from(
    [
      "Alex Rivera",
      "Business Administration -- Lakeshore State University",
      "",
      "Experience:",
      "- Marketing Intern, Regional Retail Co-op (2025-2026)",
      "- Peer Career Advisor, Lakeshore State University Career Center (2024-2025)",
      "",
      "Skills: Market research, financial modeling, Excel, Tableau, Salesforce",
    ].join("\n"),
    "utf-8"
  );

  const financialAidText = Buffer.from(
    [
      "Lakeshore State University -- Office of Financial Aid",
      "",
      "Award Letter -- Academic Year 2026-2027",
      "Merit Scholarship: $6,000",
      "Federal Direct Loan: $5,500",
      "Total Aid: $11,500",
    ].join("\n"),
    "utf-8"
  );

  const filesToUpload = [
    {
      title: "BUSN 340 Syllabus",
      description: "Fall 2026 syllabus for the capstone course.",
      category: "syllabus",
      fileName: "BUSN_340_Syllabus.pdf",
      mimeType: "application/pdf",
      buffer: syllabusPdf,
      relationships: [{ entity_type: "course", entity_id: capstoneCourse.id }],
    },
    {
      title: "Resume -- Alex Rivera",
      description: "Current resume draft.",
      category: "resume",
      fileName: "Alex_Rivera_Resume.txt",
      mimeType: "text/plain",
      buffer: resumeText,
      relationships: [{ entity_type: "degree", entity_id: bsDegree.id }],
    },
    {
      title: "Financial Aid Award Letter",
      description: "2026-2027 award letter from the financial aid office.",
      category: "financial",
      fileName: "Financial_Aid_Award_2026.txt",
      mimeType: "text/plain",
      buffer: financialAidText,
      relationships: [{ entity_type: "degree", entity_id: bsDegree.id }],
    },
  ];

  for (const file of filesToUpload) {
    const documentId = crypto.randomUUID();
    const storagePath = `${userId}/${documentId}/1-${file.fileName}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, file.buffer, {
      contentType: file.mimeType,
      upsert: true,
    });
    assertNoError(`upload ${file.fileName}`, uploadError);

    const { error: docInsertError } = await supabase.from("documents").insert({
      id: documentId,
      user_id: userId,
      title: file.title,
      description: file.description,
      category: file.category,
      status: "active",
      is_favorite: false,
      storage_path: storagePath,
      file_name: file.fileName,
      file_size: file.buffer.length,
      mime_type: file.mimeType,
    });
    assertNoError(`insert document row for ${file.fileName}`, docInsertError);

    await supabase.from("document_versions").insert({
      document_id: documentId,
      user_id: userId,
      storage_path: storagePath,
      file_name: file.fileName,
      file_size: file.buffer.length,
      mime_type: file.mimeType,
      version_number: 1,
    });

    if (file.relationships.length > 0) {
      await supabase.from("document_relationships").insert(
        file.relationships.map((r) => ({ document_id: documentId, user_id: userId, ...r }))
      );
    }
  }

  console.log("\nDemo account ready.");
  console.log("Email:   ", DEMO_EMAIL);
  console.log("Password:", DEMO_PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
