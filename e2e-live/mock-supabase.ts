import type { Page, Route } from '@playwright/test'

/*
 * A small stand-in for the Supabase HTTP API used by live-mode tests. Handlers are matched
 * on table / function name; unmatched calls fail loudly so a test never passes by accident.
 */

export const API = 'http://127.0.0.1:54399'

export const USER = { id: '00000000-0000-4000-8000-0000000000a1', email: 'ada@example.test', name: 'Ada Learner' }

export type Handler = (req: { method: string; url: URL; body: unknown }) => { status?: number; json: unknown } | undefined

export interface Mock {
  tables: Record<string, Handler>
  rpc: Record<string, Handler>
  functions: Record<string, Handler>
  calls: Array<{ kind: string; name: string; body: unknown; url: string }>
}

export async function signIn(page: Page) {
  const session = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
    user: { id: USER.id, email: USER.email, aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'google' }, user_metadata: { full_name: USER.name }, created_at: '2026-10-01T00:00:00Z' },
  }
  await page.addInitScript((value) => localStorage.setItem('sb-127-auth-token', value), JSON.stringify(session))
}

export async function mockSupabase(page: Page, partial: Partial<Omit<Mock, 'calls'>> = {}): Promise<Mock> {
  const mock: Mock = { tables: {}, rpc: {}, functions: {}, calls: [], ...partial }
  await page.route(`${API}/**`, async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    let body: unknown
    try {
      body = request.postDataJSON()
    } catch {
      body = request.postData()
    }
    const parts = url.pathname.split('/').filter(Boolean)
    let kind = ''
    let name = ''
    if (parts[0] === 'rest' && parts[2] === 'rpc') [kind, name] = ['rpc', parts[3]]
    else if (parts[0] === 'rest') [kind, name] = ['tables', parts[2]]
    else if (parts[0] === 'functions') [kind, name] = ['functions', parts[2]]
    else if (parts[0] === 'auth') {
      if (parts[2] === 'logout') return route.fulfill({ status: 204, headers: cors })
      if (parts[2] === 'user') return route.fulfill({ status: 200, headers: cors, json: { id: USER.id, email: USER.email } })
      return route.fulfill({ status: 200, headers: cors, json: {} })
    }
    mock.calls.push({ kind, name, body, url: url.toString() })
    const handler = (mock as unknown as Record<string, Record<string, Handler>>)[kind]?.[name]
    const answer = handler?.({ method: request.method(), url, body })
    if (!answer) {
      return route.fulfill({ status: 500, headers: cors, json: { code: 'XX000', message: `unmocked ${kind} ${name} ${url.search}` } })
    }
    // PostgREST .maybeSingle() asks for an object; return the first row (or null).
    const wantsObject = (request.headers()['accept'] ?? '').includes('vnd.pgrst.object')
    let json = answer.json
    if (wantsObject && Array.isArray(json)) json = json[0] ?? null
    if (wantsObject && json === null) return route.fulfill({ status: 406, headers: cors, json: { code: 'PGRST116', message: 'no rows' } })
    return route.fulfill({ status: answer.status ?? 200, headers: { ...cors, 'Content-Range': '0-0/*' }, json })
  })
  return mock
}

/** Rows for the session: profile, not a Platform Admin, optional memberships. */
export function sessionTables(memberships: unknown[] = []): Record<string, Handler> {
  return {
    profiles: ({ method }) => (method === 'GET' ? { json: [{ id: USER.id, email: USER.email, full_name: USER.name, status: 'active' }] } : { json: [] }),
    platform_admins: () => ({ json: [] }),
    organization_memberships: () => ({ json: memberships }),
  }
}

export const COURSE = {
  id: '00000000-0000-4000-8000-0000000000c1',
  title: 'Introduction to Regression',
  slug: 'introduction-to-regression',
  summary: 'Turn data into useful predictions.',
  thumbnail_path: null,
  visibility: 'public',
  enrollment_policy: 'open',
  owner_type: 'platform',
  org_id: null,
  status: 'published',
  course_modules: [
    {
      id: 'm1',
      title: 'Foundations',
      position: 0,
      lessons: [
        { id: '00000000-0000-4000-8000-0000000000e1', title: 'What regression is for', type: 'reading', position: 0, is_preview: true },
        { id: '00000000-0000-4000-8000-0000000000e2', title: 'Check your understanding', type: 'quiz', position: 1, is_preview: false },
      ],
    },
  ],
}
