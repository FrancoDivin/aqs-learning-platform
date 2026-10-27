import {
  listCatalog,
  listCoursesWithOutline,
  myCompletedLessons,
  myEnrollments,
  type CourseSummary,
  type Enrollment,
  type OutlineModule,
} from '../../data/learning'
import { progressOf, type Progress } from '../../learner-model'

export type LearningStatus = 'in-progress' | 'not-started' | 'completed'

export interface EnrolledCourse {
  course: CourseSummary
  outline: OutlineModule[]
  enrollment: Enrollment
  progress: Progress
  status: LearningStatus
}

export interface LearnerOverview {
  enrolled: EnrolledCourse[]
  /** Published courses the person may open and is not enrolled in. */
  others: CourseSummary[]
  lessonsCompleted: number
}

/** Everything the learner dashboard and My courses need, in three queries. */
export async function loadLearnerOverview(userId: string): Promise<LearnerOverview> {
  const [enrollments, catalog] = await Promise.all([myEnrollments(userId), listCatalog()])
  const ids = enrollments.map((e) => e.courseId)
  const [courses, done] = await Promise.all([listCoursesWithOutline(ids), myCompletedLessons(userId, ids)])
  const byId = new Map(courses.map((c) => [c.id, c]))
  const enrolled: EnrolledCourse[] = []
  for (const enrollment of enrollments) {
    const course = byId.get(enrollment.courseId)
    if (!course) continue // not visible right now (e.g. organization suspended, P11)
    const progress = progressOf(course.outline, done.get(course.id) ?? new Set())
    const status: LearningStatus =
      enrollment.status === 'completed' ? 'completed' : progress.done === 0 ? 'not-started' : 'in-progress'
    enrolled.push({ course, outline: course.outline, enrollment, progress, status })
  }
  const enrolledIds = new Set(ids)
  return {
    enrolled,
    others: catalog.filter((c) => !enrolledIds.has(c.id)),
    lessonsCompleted: [...done.values()].reduce((n, set) => n + set.size, 0),
  }
}
