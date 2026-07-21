import { NextRequest, NextResponse } from 'next/server'
import {
  activatePortableLicense,
  allowApiRequest,
  deactivatePortableLicense,
  PortableLicenseError,
  validatePortableLicense,
} from '../../lib/license'

export const runtime = 'nodejs'

type LicenseAction = 'activate' | 'validate' | 'deactivate'

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!allowApiRequest(req, 8)) {
    return NextResponse.json({ error: '操作が多すぎます。1分後にお試しください。' }, { status: 429 })
  }

  let body: { action?: LicenseAction; licenseKey?: string; instanceName?: string; instanceId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  }

  if (!body.action || !['activate', 'validate', 'deactivate'].includes(body.action) || typeof body.licenseKey !== 'string') {
    return NextResponse.json({ error: '入力内容を確認してください。' }, { status: 400 })
  }

  try {
    if (body.action === 'activate') {
      if (typeof body.instanceName !== 'string') throw new Error('端末情報を確認してください。')
      return NextResponse.json(await activatePortableLicense(body.licenseKey, body.instanceName))
    }
    if (typeof body.instanceId !== 'string') throw new Error('端末情報を確認してください。')
    if (body.action === 'validate') {
      return NextResponse.json(await validatePortableLicense(body.licenseKey, body.instanceId))
    }
    await deactivatePortableLicense(body.licenseKey, body.instanceId)
    return NextResponse.json({ paid: false, expiresAt: null, instanceId: null, instanceName: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ライセンスを確認できませんでした。'
    const upstream = error instanceof PortableLicenseError && error.upstream
    return NextResponse.json({ error: message }, { status: upstream ? 502 : 400 })
  }
}
