import { NextRequest, NextResponse } from 'next/server'
import { checkAppleKey, claimAppleKeyDevice, DeviceLimitError, issueAppleKey, releaseAppleKeyDevice } from '../../lib/apple-key'
import { paidOriginalTransactionId } from '../../lib/apple-plus'
import { allowApiRequest } from '../../lib/license'

export const runtime = 'nodejs'

/**
 * iPhone で買った Plus を PC 版でも使うためのキー。
 * - action "issue"：iPhone が署名つきの購入記録を送る → PC 用のキーを返す
 * - action "validate"：PC がキーと端末の番号を送る → いま有効か・いつまでかを返す（iPhone を含めて2台まで）
 * - action "release"：PC の「この端末で解除」→ 枠を空ける
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!allowApiRequest(req, 10)) {
    return NextResponse.json({ error: '操作が多すぎます。1分後にお試しください。' }, { status: 429 })
  }
  let body: { action?: string; signedTransaction?: unknown; key?: unknown; deviceId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  }

  try {
    if (body.action === 'issue') {
      const id = await paidOriginalTransactionId(body.signedTransaction)
      if (!id) return NextResponse.json({ error: '有効な Plus の購入が見つかりません。' }, { status: 400 })
      return NextResponse.json({ key: issueAppleKey(id) })
    }
    if (body.action === 'validate') {
      if (typeof body.key !== 'string' || body.key.length > 80) {
        return NextResponse.json({ error: 'キーを確認してください。' }, { status: 400 })
      }
      if (typeof body.deviceId !== 'string' || !body.deviceId || body.deviceId.length > 100) {
        return NextResponse.json({ error: 'アプリを最新版に更新してから、もう一度お試しください。' }, { status: 400 })
      }
      const state = await checkAppleKey(body.key)
      if (state.paid) await claimAppleKeyDevice(body.key, body.deviceId)
      return NextResponse.json(state)
    }
    if (body.action === 'release') {
      if (typeof body.key !== 'string' || typeof body.deviceId !== 'string' || body.deviceId.length > 100) {
        return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
      }
      await releaseAppleKeyDevice(body.key, body.deviceId)
      return NextResponse.json({ released: true })
    }
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  } catch (error) {
    if (error instanceof DeviceLimitError) return NextResponse.json({ error: error.message }, { status: 409 })
    const message = error instanceof Error ? error.message : '確認できませんでした。'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
