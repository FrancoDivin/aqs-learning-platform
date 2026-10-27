import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

/*
 * Shared types and hook for the authentication context (decision D15, clarified 23 October 2026).
 * The provider lives in auth.tsx so that Fast Refresh keeps working for components.
 */

export interface AuthActionResult {
  error: string | null
}

export interface AuthContextValue {
  /** The current session, or null when signed out or when authentication is unavailable. */
  session: Session | null
  /** True until the first auth-state event arrives. Always false when authentication is unavailable. */
  loading: boolean
  /** False when VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing. */
  authAvailable: boolean
  /** `redirectTo` must be on the Auth redirect allow-list (live sign-in passes /auth/callback). */
  signInWithGoogle: (options?: { redirectTo?: string }) => Promise<AuthActionResult>
  signOut: () => Promise<AuthActionResult>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}
