import type { PlannerState } from './types'

export const semesters = ['Fall 2026', 'Spring 2027', 'Summer 2027', 'Fall 2027', 'Spring 2028']

export const defaultState: PlannerState = {
  settings: { startCredits: 36, degreeCredits: 120, graduationTarget: 'Spring 2028' },
  courses: [
    ['CMIT 130','Networking Fundamentals','Fall 2026','7A','network'],
    ['COMM 230','Small Group Communication','Fall 2026','7A','business'],
    ['CMIT 140','Introduction to Operating Systems','Fall 2026','7B','certificate'],
    ['SOCI 200','Social Justice Perspectives','Fall 2026','7B','gened'],
    ['WEBD 125','Web Page Development I','Fall 2026','7B','core'],
    ['CMIT 135','Introduction to Python','Spring 2027','7A','certificate'],
    ['GEN ED 1','General Education','Spring 2027','7A','gened'],
    ['NETW 210','Wireless Networking','Spring 2027','7B','network'],
    ['MGMT 260','Foundations of Project Management','Spring 2027','7B','business'],
    ['GEN ED 2','General Education','Spring 2027','7B','gened'],
    ['NETW 215','TCP/IP','Summer 2027','7A','network'],
    ['CFDI 240','Digital Forensic Investigation Techniques','Summer 2027','7A','certificate'],
    ['GEN ED 3','General Education','Summer 2027','7A','gened'],
    ['CYBR 240','Networking & Security','Summer 2027','7B','core'],
    ['CMIT 280','Cloud Computing Security','Summer 2027','7B','core'],
    ['ELECTIVE 1','Elective','Summer 2027','7B','elective'],
    ['NETW 255','System Administration & Network Services I','Fall 2027','7A','network'],
    ['CRIM 120','Criminal Law','Fall 2027','7A','certificate'],
    ['GEN ED 4','General Education','Fall 2027','7A','gened'],
    ['CYBR 260','Security Scripting with Python','Fall 2027','7B','core'],
    ['CYBR 310','Mobile Security','Fall 2027','7B','core'],
    ['CRIM 121','Criminal Procedure','Fall 2027','7B','certificate'],
    ['CYBR 320','Intrusion Analysis & Response','Spring 2028','7A','core'],
    ['CYBR 330','Operating System Security','Spring 2028','7A','core'],
    ['ELECTIVE 2','Elective','Spring 2028','7A','elective'],
    ['CYBR 335','Ethical Hacking','Spring 2028','7B','core'],
    ['CYBR 410','Emerging Threats & Defenses','Spring 2028','7B','core'],
    ['CFDI 345','Operating System Forensics','Spring 2028','7B','certificate']
  ].map((c, index) => ({
    id: `course-${index + 1}`,
    code: c[0], title: c[1], semester: c[2], term: c[3] as '7A'|'7B', category: c[4],
    credits: 3, status: index < 2 ? 'registered' : 'planned', grade: '', notes: ''
  })),
  assignments: []
}
