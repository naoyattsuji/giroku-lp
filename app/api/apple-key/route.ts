import { NextRequest, NextResponse } from 'next/server'
import { checkAppleKey, issueAppleKey } from '../../lib/apple-key'
import { paidOriginalTransactionId } from '../../lib/apple-plus'
import { allowApiRequest } from '../../lib/license'

export const runtime = 'nodejs'

/**
 * iPhone で買った Plus を PC 版でも使うためのキー。
 * - action "issue"：iPhone が署名つきの購入記録を送る → PC 用のキーを返す
 * - action "validate"：PC がキーを送る → いま有効か・いつまでかを返す
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!allowApiRequest(req, 10)) {
    return NextResponse.json({ error: '操作が多すぎます。1分後にお試しください。' }, { status: 429 })
  }
  let body: { action?: string; signedTransaction?: unknown; key?: unknown }
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
      return NextResponse.json(await checkAppleKey(body.key))
    }
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : '確認できませんでした。'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
