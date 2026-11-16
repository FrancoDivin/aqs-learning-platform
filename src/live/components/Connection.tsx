import type { ReactNode } from 'react'
import { Banner, ConnectionContext } from '../../components/ui'
import { useOnline } from '../../lib/use-online'

/*
 * Task 6-4: while the browser is offline, one notice at the top of every live page says so, and
 * action buttons are disabled (ConnectionContext, read by Button). Nothing is promised offline:
 * no queued saves and no offline copies (D7). The notice clears itself when the connection is back.
 */
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const online = useOnline()
  return (
    <ConnectionContext.Provider value={online}>
      {online ? null : (
        <div className="offline-notice">
          <Banner tone="warning" icon="wifiOff" flush>
            You&apos;re offline. Saving and other changes are paused until your connection is back.
          </Banner>
        </div>
      )}
      {children}
    </ConnectionContext.Provider>
  )
}
