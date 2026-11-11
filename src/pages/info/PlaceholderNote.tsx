import type { ReactNode } from 'react'
import styles from './PlaceholderNote.module.css'

/*
 * A marked placeholder for content AQS has not supplied yet (owner decision, 10 November 2026).
 * Development builds only: in a production build it renders nothing, so no placeholder or dummy
 * text is ever published. `npm run check:build` also fails if the placeholder label ships.
 */
export function PlaceholderNote({ label, children, inline = false }: { label: string; children: ReactNode; inline?: boolean }) {
  if (!import.meta.env.DEV) return null
  const Tag = inline ? 'span' : 'div'
  return (
    <Tag className={inline ? styles.inline : styles.block} data-placeholder="true">
      <span className={styles.tag}>Placeholder · {label} · AQS to supply</span>
      {inline ? ' ' : null}
      <span className={styles.text}>{children}</span>
    </Tag>
  )
}
