import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.117.3'
import { corsHeaders, FunctionError } from './core.ts'

/*
 * Request plumbing shared by the AQS Edge Functions. Secrets come only from the function's
 * environment (T6): SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are set by
 * Supabase; SITE_URL, ALLOWED_ORIGINS, RESEND_API_KEY and EMAIL_FROM are set by the owner.
 */

export function env(name: string, required = true): string {
  const value = Deno.env.get(name) ?? ''
  if (required && !value) throw new FunctionError('unavailable', 'This service is not configured.')
  return value
}

/** A client that acts as the caller (their JWT), so every database check applies to them. */
export function callerClient(req: Request): SupabaseClient {
  const authorization = req.headers.get('Authorization') ?? ''
  if (!/^Bearer .+/.test(authorization)) throw new FunctionError('forbidden', 'Sign in again to continue.', 401)
  return createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function serve(handler: (req: Request, body: Record<string, unknown>) => Promise<unknown>) {
  Deno.serve(async (req) => {
    const cors = corsHeaders(req.headers.get('Origin'), Deno.env.get('ALLOWED_ORIGINS') ?? '')
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    const json = (status: number, payload: unknown) =>
      new Response(JSON.stringify(payload), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
    if (req.method !== 'POST') return json(405, { error: { kind: 'invalid', message: 'Use POST.' } })
    try {
      let body: Record<string, unknown> = {}
      try {
        body = (await req.json()) as Record<string, unknown>
      } catch {
        throw new FunctionError('invalid', 'The request body must be JSON.')
      }
      return json(200, await handler(req, body))
    } catch (error) {
      if (error instanceof FunctionError) return json(error.status, { error: { kind: error.kind, message: error.message } })
      console.error('unhandled', error instanceof Error ? error.message : 'unknown error')
      return json(500, { error: { kind: 'unknown', message: 'Something went wrong. Please try again.' } })
    }
  })
}
