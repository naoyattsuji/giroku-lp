import { createPublicKey, verify } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { isValidAnonymousDeviceId } from '../../lib/license'
import { rewardKey } from '../../lib/dailyLimit'
import { redisPipeline } from '../../lib/redis'

/**
 * リワード広告を見終わったことを、AdMob から直接受け取る入口（サーバー側の検証。SSV）。
 *
 * iPhone の無料版で、月の AI 議事録の回数を使い切ったあと、広告を1回見るごとに議事録を1回足す
 * （2026-11-11 本人の判断。app/lib/dailyLimit.ts）。アプリが「見た」と言うだけでは偽れるので、
 * Google が署名した知らせだけを信じる。署名は Google が公開している鍵で確かめる。
 *
 * AdMob の広告ユニットの設定で、この URL を「サーバー側の検証」の送り先にする。
 * アプリは広告を出すときに、端末の匿名 ID を user_id として渡す。
 */
const KEYS_URL = 'https://www.gstatic.com/admob/reward/verifier-keys.json'
let cachedKeys: { at: number; keys: Map<string, string> } | null = null
/** 読み直しの最短の間隔。でたらめな key_id を送られても、Google へ何度も取りに行かないように */
const FORCED_REFRESH_INTERVAL_MS = 60 * 1000

async function verifierKeys(force = false): Promise<Map<string, string>> {
  if (cachedKeys && Date.now() - cachedKeys.at < (force ? FORCED_REFRESH_INTERVAL_MS : 6 * 60 * 60 * 1000)) {
    return cachedKeys.keys
  }
  const res = await fetch(KEYS_URL, { signal: AbortSignal.timeout(5_000) })
  const data = (await res.json()) as { keys?: Array<{ keyId?: number | string; pem?: string }> }
  const keys = new Map<string, string>()
  for (const key of data.keys ?? []) {
    if (key.keyId !== undefined && key.pem) keys.set(String(key.keyId), key.pem)
  }
  cachedKeys = { at: Date.now(), keys }
  return keys
}

/** 署名を確かめる。確かめる文は「signature= の手前まで」の問い合わせ文字列 */
async function verified(rawQuery: string, params: URLSearchParams): Promise<boolean> {
  const signature = params.get('signature')
  const keyId = params.get('key_id')
  const at = rawQuery.indexOf('&signature=')
  if (!signature || !keyId || at < 0) return false
  const message = rawQuery.slice(0, at)
  // Google が鍵を入れ替えた直後は、覚えている一覧に無い番号が来る。そのときだけ一覧を1回読み直す
  // （前は6時間読み直さず、その間の正しい知らせを捨てていた。2026-11-12 の点検）
  let pem = (await verifierKeys()).get(keyId)
  if (!pem) pem = (await verifierKeys(true)).get(keyId)
  if (!pem) return false
  try {
    return verify(
      'sha256',
      Buffer.from(message, 'utf8'),
      { key: createPublicKey(pem), dsaEncoding: 'der' },
      Buffer.from(signature, 'base64url')
    )
  } catch {
    return false
  }
}

/**
 * 報酬を足してよい広告の枠か。環境変数 GIROKU_ADMOB_REWARD_AD_UNITS（カンマ区切り。
 * 「ca-app-pub-…/2161799838」の形でも「2161799838」だけでもよい）が設定されていれば照らし合わせる。
 * 設定が無ければ今までどおり枠は見ない（2026-11-12 の点検）。
 * 同じ AdMob のアカウントの別のアプリ・別の枠の報酬で、Giroku の回数が増えないようにするため。
 */
function allowedAdUnit(adUnit: string | null): boolean {
  const configured = (process.env.GIROKU_ADMOB_REWARD_AD_UNITS ?? '')
    .split(',')
    .map((v) => v.trim().split('/').pop() ?? '')
    .filter(Boolean)
  if (configured.length === 0) return true
  const unit = (adUnit ?? '').trim().split('/').pop() ?? ''
  return unit !== '' && configured.includes(unit)
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  const rawQuery = url.search.replace(/^\?/, '')
  const params = url.searchParams

  // AdMob の画面で送り先を登録したときの確かめの問い合わせ（user_id が無い）には、そのまま 200 を返す
  if (!(await verified(rawQuery, params))) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const deviceId = params.get('user_id') ?? ''
  const transactionId = params.get('transaction_id') ?? ''
  if (!isValidAnonymousDeviceId(deviceId) || !transactionId) {
    return NextResponse.json({ ok: true })
  }
  // 署名は本物でも、Giroku の報酬の枠でなければ足さない（200 を返し、AdMob に送り直させない）
  if (!allowedAdUnit(params.get('ad_unit'))) {
    return NextResponse.json({ ok: true })
  }

  // 同じ知らせが2回届いても、足すのは1回だけ（7日覚えておく）
  const first = await redisPipeline([['SET', `giroku:reward-tx:${transactionId}`, '1', 'NX', 'EX', 7 * 24 * 60 * 60]])
  if (!first) return NextResponse.json({ ok: false }, { status: 503 })
  if (first[0] !== 'OK') return NextResponse.json({ ok: true })

  // 足した回数は、その月のうちに使う前提で40日で消える
  await redisPipeline([
    ['INCRBY', rewardKey(deviceId), 1],
    ['EXPIRE', rewardKey(deviceId), 40 * 24 * 60 * 60]
  ])
  return NextResponse.json({ ok: true })
}
