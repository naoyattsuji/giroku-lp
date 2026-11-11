import { createHash } from 'node:crypto'
import { jstDay, redisPipeline } from './redis'

/**
 * 無料版の1日の上限（2026-11-11 本人の判断）。
 *
 * 数えるのはクラウドに来た分だけ（iPhone・Mac の対応機種で、端末の中の AI が答えた質問はここに来ない）。
 * 「議事録を作る」と「質問（書き直しを含む）」は別々に数える。議事録は全部の端末で必ずクラウドを使い、
 * 質問は端末によってクラウドに来る量が大きく違うため。
 *
 * - iPhone：広告が出て、質問も多くは端末の中で済むので、普通に使えば届かない数にする
 * - Mac・Windows：広告が無く、AI の費用だけがかかる
 *
 * 数は Upstash（Vercel から足した Redis）に置き、日本時間の0時に0へ戻る。
 * Upstash がつながっていない・答えないときは、このサーバーの一時的な記憶で数える
 * （サーバーが入れ替わると0に戻るので、上限より多く使える日がある。止めるより使えるほうを選ぶ）。
 */
export type DailyKind = 'summary' | 'chat'
export type ClientPlatform = 'iphone' | 'pc'

export const DAILY_LIMITS: Record<ClientPlatform, Record<DailyKind, number>> = {
  iphone: { summary: 50, chat: 100 },
  pc: { summary: 10, chat: 30 }
}

/**
 * どの端末からの依頼か。今のアプリは端末を名乗らないので、送り方の違いで見分ける。
 * iPhone は Apple の通信の部品（CFNetwork）を通るので、その名前が User-Agent に入る。
 * PC 版は Electron の裏側（Node.js）から送るので入らない。
 * 偽ることはできるが、偽っても iPhone の上限になるだけ。
 */
export function clientPlatform(userAgent: string | null): ClientPlatform {
  return /CFNetwork|Darwin|iPhone|iOS/i.test(userAgent ?? '') ? 'iphone' : 'pc'
}

/** 1つ数えて、今日の合計を返す。数えられなければ null */
async function incrementInRedis(key: string): Promise<number | null> {
  // 2日で消える（日付が鍵に入っているので、前の日の数は使われない）
  const result = await redisPipeline([
    ['INCR', key],
    ['EXPIRE', key, 172_800]
  ])
  const count = Number(result?.[0])
  return result && Number.isFinite(count) ? count : null
}

const memory = new Map<string, number>()

function incrementInMemory(key: string): number {
  if (memory.size > 20_000) memory.clear()
  const count = (memory.get(key) ?? 0) + 1
  memory.set(key, count)
  return count
}

export interface DailyResult {
  allowed: boolean
  limit: number
  count: number
}

/** 無料版の1日の上限を1つ使う。上限を超えていれば allowed: false */
export async function takeDaily(deviceId: string, kind: DailyKind, platform: ClientPlatform): Promise<DailyResult> {
  const limit = DAILY_LIMITS[platform][kind]
  const id = createHash('sha256').update(deviceId).digest('hex').slice(0, 32)
  const key = `giroku:daily:${jstDay()}:${kind}:${id}`
  const count = (await incrementInRedis(key)) ?? incrementInMemory(key)
  return { allowed: count <= limit, limit, count }
}

/** 上限に届いたときの案内 */
export function dailyLimitMessage(kind: DailyKind, limit: number): string {
  const what = kind === 'summary' ? 'AI 議事録の作成' : 'AI への質問'
  return `今日の${what}の回数（${limit}回）を使い切りました。日本時間の0時にまた使えます。Pro なら回数を気にせず使えます。`
}
