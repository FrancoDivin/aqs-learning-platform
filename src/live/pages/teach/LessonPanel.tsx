import { useState } from 'react'
import { Badge, Banner, Button, ButtonLink, Card, CardHeader, TextArea, TextField } from '../../../components/ui'
import base from '../../../pages/InstructorCoursePage.module.css'
import { ActionFeedback } from '../../components/States'
import { authoring, type AuthoringCourse, type AuthoringLesson } from '../../data/authoring'
import { formatBytes, LESSON_TYPE_LABEL } from '../../learner-model'
import { useAction } from '../../useResource'
import styles from './CourseEditor.module.css'

/*
 * Lesson editor (the approved builder's right-hand card). Lesson text is plain text: blank
 * lines make paragraphs and web addresses become links. The design's "Required to complete"
 * switch is not shown: every lesson is required (L6). Uploads go to the exact path the
 * database issues and only while the course is an editable draft (0010).
 */

const MATERIAL_TYPES = '.pdf,.txt,.csv,.png,.jpg,.jpeg,.webp,.zip,.mp3,.m4a,.doc,.docx,.xls,.xlsx,.ppt,.pptx'

export function LessonPanel({
  course,
  lesson,
  editable,
  quizPath,
  onDeleted,
  onChanged,
}: {
  course: AuthoringCourse
  lesson: AuthoringLesson
  editable: boolean
  quizPath: string
  onDeleted: () => void
  onChanged: () => void
}) {
  const [title, setTitle] = useState(lesson.title)
  const [body, setBody] = useState(lesson.body)
  const [youtube, setYoutube] = useState(lesson.youtubeId ?? '')
  const [attest, setAttest] = useState(false)
  const [downloadable, setDownloadable] = useState(true)
  const [saved, setSaved] = useState<string | null>(null)
  const run = useAction(async (work: () => Promise<unknown>, message: string) => {
    await work()
    setSaved(message)
    onChanged()
  })
  const textChanged = title.trim() !== lesson.title || body !== lesson.body

  return (
    <Card as="section" padding="md" aria-label="Lesson editor" className={base.editor}>
      <CardHeader title="Lesson editor" subtitle={`${LESSON_TYPE_LABEL[lesson.type]} lesson`} headingLevel="h2" size="md" />
      <ActionFeedback error={run.error} success={saved} />

      <form
        className={base.fields}
        onSubmit={async (event) => {
          event.preventDefault()
          setSaved(null)
          await run.run(async () => {
            if (title.trim() !== lesson.title) await authoring.renameLesson(lesson.id, title.trim())
            if (lesson.type !== 'quiz' && body !== lesson.body) await authoring.setBody(lesson.id, body)
          }, 'Lesson saved.')
        }}
      >
        <TextField id={`title-${lesson.id}`} label="Lesson title" value={title} disabled={!editable} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
        {lesson.type !== 'quiz' ? (
          <TextArea
            id={`body-${lesson.id}`}
            label={lesson.type === 'video' ? 'Description' : 'Lesson text'}
            hint="Plain text. Leave a blank line between paragraphs."
            rows={lesson.type === 'video' ? 4 : 12}
            value={body}
            disabled={!editable}
            maxLength={200000}
            onChange={(e) => setBody(e.target.value)}
          />
        ) : null}
        {editable ? (
          <div className={styles.row}>
            <Button type="submit" variant="secondary" loading={run.busy} disabled={!textChanged}>
              Save lesson
            </Button>
            <Button
              variant="text"
              onClick={() => {
                if (window.confirm(`Delete the lesson "${lesson.title}"?`)) {
                  void run.run(async () => {
                    await authoring.deleteLesson(lesson.id)
                    onDeleted()
                  }, 'Lesson deleted.')
                }
              }}
            >
              Delete lesson
            </Button>
          </div>
        ) : null}
      </form>

      {lesson.type === 'quiz' ? (
        <section className={base.quizSection} aria-label="Quiz">
          <h3 className={base.quizHeading}>Quiz</h3>
          <p className={styles.muted}>{lesson.quizId ? 'Questions, answers and settings.' : 'No questions yet.'}</p>
          <ButtonLink to={quizPath} variant="secondary" size="sm">
            Open quiz builder<span className="visually-hidden"> for {lesson.title}</span>
          </ButtonLink>
        </section>
      ) : null}

      {lesson.type === 'video' ? (
        <section className={base.materials} aria-labelledby={`video-${lesson.id}`}>
          <h3 id={`video-${lesson.id}`} className={base.sectionTitle}>
            Video
          </h3>
          <p className={styles.muted}>
            {lesson.videoPath ? 'An uploaded video is attached.' : lesson.youtubeId ? `YouTube video ${lesson.youtubeId}` : 'No video yet.'}
          </p>
          {editable ? (
            <>
              <label className={base.dropzone}>
                Upload a video file
                <span className={base.dropzoneHint}>MP4 or WebM, up to 500 MB (the current plan may allow less).</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  className="visually-hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (file) void run.run(() => authoring.uploadVideo(lesson.id, file), 'Video uploaded.')
                  }}
                />
              </label>
              {course.visibility === 'public' ? (
                <form
                  className={styles.addForm}
                  onSubmit={(event) => {
                    event.preventDefault()
                    const id = /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/.exec(youtube)?.[1] ?? youtube.trim()
                    void run.run(() => authoring.setYoutube(lesson.id, id, attest), 'YouTube video set.')
                  }}
                >
                  <TextField
                    id={`youtube-${lesson.id}`}
                    label="Or an unlisted YouTube video"
                    hint="Paste the link or the 11-character video ID. Public courses only."
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                  />
                  <label className={styles.row}>
                    <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} />
                    <span>This course contains nothing sensitive, so it may use YouTube (P16).</span>
                  </label>
                  <div>
                    <Button type="submit" size="sm" variant="neutral" disabled={!attest || !youtube.trim()} loading={run.busy}>
                      Use this YouTube video
                    </Button>
                  </div>
                </form>
              ) : (
                <p className={styles.muted}>YouTube videos are allowed only in public courses.</p>
              )}
              {lesson.videoPath || lesson.youtubeId ? (
                <Button variant="text" size="sm" onClick={() => run.run(() => authoring.clearVideo(lesson.id), 'Video removed.')}>
                  Remove video
                </Button>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}

      {lesson.type !== 'quiz' ? (
        <section className={base.materials} aria-labelledby={`materials-${lesson.id}`}>
          <h3 id={`materials-${lesson.id}`} className={base.sectionTitle}>
            Upload materials
          </h3>
          {editable ? (
            <>
              <label className={styles.row}>
                <input type="checkbox" checked={downloadable} onChange={(e) => setDownloadable(e.target.checked)} />
                <span>Learners may download new files (L7)</span>
              </label>
              <label className={base.dropzone}>
                Click to choose a file
                <span className={base.dropzoneHint}>PDF, Office documents, images, CSV or ZIP. Up to 100 MB per file.</span>
                <input
                  type="file"
                  accept={MATERIAL_TYPES}
                  className="visually-hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (file) void run.run(() => authoring.addResource(lesson.id, file, downloadable), `${file.name} uploaded.`)
                  }}
                />
              </label>
            </>
          ) : null}
          {lesson.resources.length > 0 ? (
            <ul className={base.fileList}>
              {lesson.resources.map((file) => (
                <li key={file.id} className={base.file}>
                  <span>{file.fileName}</span>
                  <span className={base.fileMeta}>
                    {formatBytes(file.sizeBytes)} ·{' '}
                    {file.downloadable ? <Badge tone="success">Downloadable</Badge> : <Badge>Not downloadable</Badge>}
                    {editable ? (
                      <>
                        {' '}
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => run.run(() => authoring.updateResource(file.id, file.fileName, !file.downloadable), 'File updated.')}
                        >
                          {file.downloadable ? 'Stop downloads' : 'Allow downloads'}
                        </Button>
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => run.run(() => authoring.deleteResource(file.id, file.storagePath), 'File removed.')}
                        >
                          Remove<span className="visually-hidden"> {file.fileName}</span>
                        </Button>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No files.</p>
          )}
        </section>
      ) : null}

      {lesson.type === 'reading' && course.visibility === 'public' ? (
        <section className={base.materials} aria-label="Preview">
          <h3 className={base.sectionTitle}>Public preview</h3>
          <p className={styles.muted}>
            {lesson.isPreview
              ? 'Approved: anyone can read this lesson on the course page.'
              : lesson.previewRequested
                ? 'Requested. The course approver approves previews together with publication (L3, P2).'
                : 'Let visitors read this lesson before enrolling. Needs the approver’s approval.'}
          </p>
          {editable ? (
            lesson.previewRequested || lesson.isPreview ? (
              <Button variant="text" size="sm" onClick={() => run.run(() => authoring.removePreview(lesson.id), 'Preview removed.')}>
                Remove preview
              </Button>
            ) : (
              <Button variant="neutral" size="sm" onClick={() => run.run(() => authoring.requestPreview(lesson.id), 'Preview requested.')}>
                Request preview
              </Button>
            )
          ) : null}
        </section>
      ) : null}

      {!editable && course.status === 'published' ? (
        <Banner tone="info">This course is published. Fix typos, formatting or broken links with a correction (below).</Banner>
      ) : null}
    </Card>
  )
}
