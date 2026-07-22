export type CourseStatus = 'planned' | 'registered' | 'in-progress' | 'completed'

export interface Course {
  id: string
  code: string
  title: string
  semester: string
  term: '7A' | '7B'
  category: string
  credits: number
  status: CourseStatus
  grade: string
  notes: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  dueDate: string
  completed: boolean
}

export interface PlannerState {
  settings: {
    startCredits: number
    degreeCredits: number
    graduationTarget: string
  }
  courses: Course[]
  assignments: Assignment[]
}
