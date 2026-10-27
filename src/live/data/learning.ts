import { callFunction, query, rpc } from '../api'

/*
 * Learner data: catalog, course outline, enrolment, lessons, files and progress. Every query
 * runs with the person's own token, so the row rules decide what comes back (F1, L8, P11,
 * L13); a course the person may not see simply is not returned.
 */

export type LessonType = 'reading' | 'video' | 'quiz'

export interface CourseSummary {
  id: string
  title: string
  slug: string
  summary: string
  thumbnailPath: string | null
  visibility: 'public' | 'organization'
  enrollmentPolicy: 'open' | 'assigned'
  ownerType: 'platform' | 'organization'
  orgId: string | null
  status: 'draft' | 'published' | 'archived'
  moduleCount: number
  lessonCount: number
}

export interface OutlineLesson {
  id: string
  title: string
  type: LessonType
  position: number
  isPreview: boolean
}

export interface OutlineModule {
  id: string
  title: string
  position: number
  lessons: OutlineLesson[]
}

export interface Enrollment {
  id: string
  courseId: string
  status: 'active' | 'completed'
  source: 'self' | 'assigned'
  enrolledAt: string
  dueAt: string | null
  completedAt: string | null
}

type CourseRow = {
  id: string
  title: string
  slug: string
  summary: string
  thumbnail_path: string | null
  visibility: CourseSummary['visibility']
  enrollment_policy: CourseSummary['enrollmentPolicy']
  owner_type: CourseSummary['ownerType']
  org_id: string | null
  status: CourseSummary['status']
  course_modules?: Array<{
    id: string
    title: string
    position: number
    lessons: Array<{ id: string; title: string; type: LessonType; position: number; is_preview: boolean }> | null
  }> | null
}

const COURSE_COLUMNS = 'id, title, slug, summary, thumbnail_path, visibility, enrollment_policy, owner_type, org_id, status'
const OUTLINE = 'course_modules(id, title, position, lessons(id, title, type, position, is_preview))'

function outlineOf(row: CourseRow): OutlineModule[] {
  return (row.course_modules ?? [])
    .map((m) => ({
      id: m.id,
      title: m.title,
      position: m.position,
      lessons: (m.lessons ?? [])
        .map((l) => ({ id: l.id, title: l.title, type: l.type, position: l.position, isPreview: l.is_preview }))
        .sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => a.position - b.position)
}

function summaryOf(row: CourseRow): CourseSummary {
  const outline = outlineOf(row)
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    thumbnailPath: row.thumbnail_path,
    visibility: row.visibility,
    enrollmentPolicy: row.enrollment_policy,
    ownerType: row.owner_type,
    orgId: row.org_id,
    status: row.status,
    moduleCount: outline.length,
    lessonCount: outline.reduce((n, m) => n + m.lessons.length, 0),
  }
}

function enrollmentOf(row: {
  id: string
  course_id: string
  status: Enrollment['status']
  source: Enrollment['source']
  enrolled_at: string
  due_at: string | null
  completed_at: string | null
}): Enrollment {
  return {
    id: row.id,
    courseId: row.course_id,
    status: row.status,
    source: row.source,
    enrolledAt: row.enrolled_at,
    dueAt: row.due_at,
    completedAt: row.completed_at,
  }
}

/** Published courses this person (or a signed-out visitor) may see. */
export async function listCatalog(): Promise<CourseSummary[]> {
  const rows = await query<CourseRow[]>((db) =>
    db.from('courses').select(`${COURSE_COLUMNS}, ${OUTLINE}`).eq('status', 'published').order('title'),
  )
  return rows.map(summaryOf)
}

/** Courses by ID with their outlines (any status the person may see, e.g. archived, L13). */
export async function listCoursesWithOutline(ids: string[]): Promise<Array<CourseSummary & { outline: OutlineModule[] }>> {
  if (ids.length === 0) return []
  const rows = await query<CourseRow[]>((db) => db.from('courses').select(`${COURSE_COLUMNS}, ${OUTLINE}`).in('id', ids))
  return rows.map((row) => ({ ...summaryOf(row), outline: outlineOf(row) }))
}

export interface CourseDetail {
  course: CourseSummary
  outline: OutlineModule[]
  instructors: string[]
}

export async function getCourseDetail(courseId: string): Promise<CourseDetail | null> {
  const [row, instructors] = await Promise.all([
    query<CourseRow | null>((db) =>
      db.from('courses').select(`${COURSE_COLUMNS}, ${OUTLINE}`).eq('id', courseId).maybeSingle(),
    ),
    query<Array<{ display_name: string }>>((db) =>
      db.from('course_instructor_names').select('display_name').eq('course_id', courseId),
    ),
  ])
  if (!row) return null
  return { course: summaryOf(row), outline: outlineOf(row), instructors: instructors.map((i) => i.display_name) }
}

export async function myEnrollments(userId: string): Promise<Enrollment[]> {
  const rows = await query<Parameters<typeof enrollmentOf>[0][]>((db) =>
    db
      .from('enrollments')
      .select('id, course_id, status, source, enrolled_at, due_at, completed_at')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false }),
  )
  return rows.map(enrollmentOf)
}

export async function myEnrollmentFor(userId: string, courseId: string): Promise<Enrollment | null> {
  const row = await query<Parameters<typeof enrollmentOf>[0] | null>((db) =>
    db
      .from('enrollments')
      .select('id, course_id, status, source, enrolled_at, due_at, completed_at')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle(),
  )
  return row ? enrollmentOf(row) : null
}

/** IDs of the lessons this person has completed, per course. */
export async function myCompletedLessons(userId: string, courseIds?: string[]): Promise<Map<string, Set<string>>> {
  const rows = await query<Array<{ course_id: string; lesson_id: string }>>((db) => {
    let q = db.from('lesson_progress').select('course_id, lesson_id').eq('user_id', userId)
    if (courseIds && courseIds.length > 0) q = q.in('course_id', courseIds)
    return q
  })
  const byCourse = new Map<string, Set<string>>()
  for (const row of rows) {
    const set = byCourse.get(row.course_id) ?? new Set<string>()
    set.add(row.lesson_id)
    byCourse.set(row.course_id, set)
  }
  return byCourse
}

export async function enrol(courseId: string): Promise<void> {
  await rpc('enrol_in_course', { p_course: courseId })
}

export async function completeLesson(lessonId: string): Promise<void> {
  await rpc('complete_lesson', { p_lesson: lessonId })
}

export interface LessonContent {
  body: string
  videoPath: string | null
  youtubeId: string | null
  resources: Array<{ id: string; fileName: string; contentType: string; sizeBytes: number; downloadable: boolean }>
}

export async function getLessonContent(lessonId: string): Promise<LessonContent> {
  const [content, resources] = await Promise.all([
    query<{ body: string; video_path: string | null; youtube_id: string | null } | null>((db) =>
      db.from('lesson_contents').select('body, video_path, youtube_id').eq('lesson_id', lessonId).maybeSingle(),
    ),
    query<Array<{ id: string; file_name: string; content_type: string; size_bytes: number; downloadable: boolean }>>((db) =>
      db
        .from('lesson_resources')
        .select('id, file_name, content_type, size_bytes, downloadable')
        .eq('lesson_id', lessonId)
        .order('file_name'),
    ),
  ])
  return {
    body: content?.body ?? '',
    videoPath: content?.video_path ?? null,
    youtubeId: content?.youtube_id ?? null,
    resources: resources.map((r) => ({
      id: r.id,
      fileName: r.file_name,
      contentType: r.content_type,
      sizeBytes: r.size_bytes,
      downloadable: r.downloadable,
    })),
  }
}

/** A 15-minute signed URL from the media-url Edge Function (P16). */
export async function mediaUrl(kind: 'resource' | 'video' | 'thumbnail', id: string): Promise<{ url: string; expiresAt: string }> {
  return callFunction('media-url', { kind, id })
}

/** Public URL of a thumbnail in the public bucket, or null when it is private. */
export function publicThumbnailUrl(thumbnailPath: string | null): string | null {
  if (!thumbnailPath || !thumbnailPath.startsWith('course-thumbnails/')) return null
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined
  return base ? `${base}/storage/v1/object/public/${thumbnailPath}` : null
}
