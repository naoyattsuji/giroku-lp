import { NextRequest, NextResponse } from 'next/server'

import { allowApiRequest } from '../../../lib/license'

export const runtime = 'nodejs'

/** App Store要件に従い、アプリ内から有料アカウントを完全削除する。 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  if (!allowApiRequest(req, 5)) {
    return NextResponse.json({ error: '操作が多すぎます。時間をおいてお試しください。' }, { status: 429 })
  }
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const authorization = req.headers.get('authorization')
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'アカウント削除機能は準備中です' }, { status: 503 })
  }
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: publishableKey, Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!userResponse.ok) return NextResponse.json({ error: 'ログインを確認できませんでした' }, { status: 401 })
  const user = await userResponse.json() as { id?: string }
  if (!user.id || !/^[0-9a-f-]{36}$/i.test(user.id)) {
    return NextResponse.json({ error: 'アカウントを確認できませんでした' }, { status: 400 })
  }

  const deletion = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey },
    signal: AbortSignal.timeout(10_000),
  })
  if (!deletion.ok) return NextResponse.json({ error: 'アカウントを削除できませんでした' }, { status: 502 })
  return NextResponse.json({ deleted: true }, { headers: { 'Cache-Control': 'no-store' } })
}
