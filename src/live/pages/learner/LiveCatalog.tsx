import type { ReactNode } from 'react'
import { PublicLayout } from '../../../components/layout/PublicLayout'
import { Badge, ButtonLink, Card, EmptyState } from '../../../components/ui'
import { useAuth } from '../../../lib/auth-context'
import { countOf } from '../../../lib/plural'
import styles from '../../../pages/CatalogPage.module.css'
import { LiveShell } from '../../components/LiveShell'
import { Loaded } from '../../components/States'
import { listCatalog } from '../../data/learning'
import { learnerShell } from '../../navigation'
import { useResource } from '../../useResource'

/*
 * Course catalog at /catalog. Signed-out visitors see the public courses (F1, L8) in the public
 * layout; signed-in people also see their organizations' courses (row rules decide) in the
 * learner shell. Layout from the catalog design draft (CatalogPage.tsx).
 */
export default function LiveCatalog() {
  const { session } = useAuth()
  const catalog = useResource(listCatalog, `catalog:${session?.user.id ?? 'anon'}`)

  const body: ReactNode = (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Course catalog</h1>
        <p className={styles.intro}>
          {session ? 'Courses open to you, from your organizations and the public catalog.' : 'Browse our public courses.'}
        </p>
      </header>
      <Loaded resource={catalog} label="Loading courses">
        {(courses) =>
          courses.length === 0 ? (
            <EmptyState title="No courses yet" description="New courses will appear here when they are published." />
          ) : (
            <ul className={styles.grid} aria-label="Courses">
              {courses.map((course) => (
                <li key={course.id}>
                  <Card as="article" className={styles.card}>
                    <h2 className={styles.courseTitle}>{course.title}</h2>
                    <p className={styles.meta}>
                      {countOf(course.moduleCount, 'module')} · {countOf(course.lessonCount, 'lesson')}
                    </p>
                    <div className={styles.badges}>
                      <Badge tone={course.visibility === 'public' ? 'info' : 'neutral'}>
                        {course.visibility === 'public' ? 'Public' : 'Your organization'}
                      </Badge>
                    </div>
                    <ButtonLink variant="secondary" to={`/courses/${course.id}`} className={styles.action}>
                      View course
                      <span className="visually-hidden"> {course.title}</span>
                    </ButtonLink>
                  </Card>
                </li>
              ))}
            </ul>
          )
        }
      </Loaded>
    </>
  )

  if (!session) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>{body}</div>
      </PublicLayout>
    )
  }
  return <LiveShell shell={learnerShell()}>{body}</LiveShell>
}
