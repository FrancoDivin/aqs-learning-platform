import { createClient } from 'npm:@supabase/supabase-js@2.117.3'
import { fromDbError, FunctionError, isUuid } from '../_shared/core.ts'
import { callerClient, env, serve } from '../_shared/http.ts'

/*
 * media-url (P16, T8): signed URLs that expire after 15 minutes. public.media_access is asked
 * AS THE CALLER whether they may open the file (enrolment, downloadable flag L7(a), L13,
 * P11, L11 P3); only then is the URL signed with the service key, which never leaves this
 * function. Learners cannot choose their own URL lifetime because they cannot read private
 * objects through the Storage API (0010).
 *
 * POST { kind: 'resource' | 'video' | 'thumbnail', id } -> { url, expiresAt }
 */

const LIFETIME_SECONDS = 15 * 60

serve(async (req, body) => {
  const kind = body.kind
  if (kind !== 'resource' && kind !== 'video' && kind !== 'thumbnail') throw new FunctionError('invalid', 'Unknown file kind.')
  if (!isUuid(body.id)) throw new FunctionError('invalid', 'Unknown file.')

  const { data, error } = await callerClient(req).rpc('media_access', { p_kind: kind, p_id: body.id })
  if (error) throw fromDbError(error)
  const access = (data as Array<{ bucket: string; object_path: string; download: boolean }>)[0]
  if (!access) throw new FunctionError('forbidden', 'You do not have permission to do that.')

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
  if (access.bucket === 'course-thumbnails') {
    const { data: pub } = admin.storage.from(access.bucket).getPublicUrl(access.object_path)
    return { url: pub.publicUrl, expiresAt: new Date(Date.now() + 365 * 864e5).toISOString() }
  }
  const { data: signed, error: signError } = await admin.storage
    .from(access.bucket)
    .createSignedUrl(access.object_path, LIFETIME_SECONDS, access.download ? { download: true } : undefined)
  if (signError || !signed) throw new FunctionError('not-found', 'The file is not available.')
  return { url: signed.signedUrl, expiresAt: new Date(Date.now() + LIFETIME_SECONDS * 1000).toISOString() }
})
