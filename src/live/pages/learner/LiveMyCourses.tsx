import { Badge, ButtonLink, Card, EmptyState, ProgressBar } from '../../../components/ui'
import styles from '../../../pages/MyCoursesPage.module.css'
import { LiveShell } from '../../components/LiveShell'
import { Loaded } from '../../components/States'
import { formatDate, lessonHref } from '../../learner-model'
import { learnerShell } from '../../navigation'
import { useSession } from '../../session-context'
import { useResource } from '../../useResource'
import { loadLearnerOverview } from './learner-overview'

/** My courses at /my-courses: every enrolment with its progress (P8) and next lesson. */
export default function LiveMyCourses() {
  const { userId } = useSession()
  const overview = useResource(() => loadLearnerOverview(userId ?? ''), `overview:${userId}`)

  return (
    <LiveShell shell={learnerShell()}>
      <header className={styles.header}>
        <h1 className={styles.title}>My courses</h1>
        <p className={styles.intro}>Your courses and where you left off in each one.</p>
      </header>
      <Loaded resource={overview} label="Loading your courses">
        {({ enrolled }) =>
          enrolled.length === 0 ? (
            <EmptyState
              title="Start your first course"
              description="Choose a course from the catalog to start building your skills."
              action={<ButtonLink to="/catalog">Browse courses</ButtonLink>}
            />
          ) : (
            <ul className={styles.list} aria-label="My courses">
              {enrolled.map(({ course, progress, enrollment, status }) => (
                <li key={course.id}>
                  <Card as="article" className={styles.card}>
                    <div className={styles.summary}>
                      <div>
                        <h2 className={styles.courseTitle}>{course.title}</h2>
                        <p className={styles.meta}>
                          {progress.done} of {progress.total} lessons completed
                          {enrollment.dueAt ? ` · Due ${formatDate(enrollment.dueAt)}` : ''}
                          {course.status === 'archived' ? ' · Archived (read only)' : ''}
                        </p>
                      </div>
                      {status === 'completed' ? <Badge tone="success">Completed</Badge> : null}
                    </div>
                    <ProgressBar label={`${course.title} progress`} value={progress.percent} />
                    {progress.next ? (
                      <ButtonLink variant="primary" to={lessonHref(course.id, progress.next.lesson)} className={styles.action}>
                        {progress.done === 0 ? 'Start' : 'Resume'}
                        <span className="visually-hidden"> {progress.next.lesson.title}</span>
                      </ButtonLink>
                    ) : (
                      <ButtonLink variant="secondary" to={`/courses/${course.id}`} className={styles.action}>
                        Review
                        <span className="visually-hidden"> {course.title}</span>
                      </ButtonLink>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )
        }
      </Loaded>
    </LiveShell>
  )
}
