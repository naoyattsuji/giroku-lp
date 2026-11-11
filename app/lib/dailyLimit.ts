import { createHash } from 'node:crypto'
import { jstDay, jstMonth, redisPipeline } from './redis'

/**
 * AI の回数の上限（2026-11-11 本人の判断。利益率50%を保つため）。
 *
 * - 数えるのはクラウドに来た分だけ（iPhone・Mac の対応機種で、端末の中の AI が答えた質問はここに来ない）
 * - 「議事録を作る」「質問（書き直しを含む）」「文章の仕上げ（Pro）」は別々に数える
 * - 議事録と仕上げは会議の長さで数える（1時間ごとに1回。長い会議ほど AI の費用が大きいため）
 * - 月の上限（費用を抑える）と、1日の上限（使いすぎを止める）の両方を見る
 * - iPhone の無料版は、月の上限を超えたら、リワード広告を1回見るごとに議事録を1回足せる（1日の上限まで）。
 *   見たことは AdMob からサーバーへ直接届く（app/api/admob-reward）。広告の収入で費用をまかなう
 *
 * 数は Upstash（Vercel から足した Redis）に置く。日本時間で数え、月は1日、日は0時に0へ戻る。
 * Upstash がつながっていない・答えないときは、このサーバーの一時的な記憶で数える
 * （サーバーが入れ替わると0に戻るので、上限より多く使える日がある。止めるより使えるほうを選ぶ）。
 */
export type QuotaKind = 'summary' | 'chat' | 'polish'
export type ClientPlatform = 'iphone' | 'pc'
export type QuotaPlan = 'free' | 'pro'

interface Limit {
  month: number
  day: number
}

export const QUOTA_LIMITS: Record<QuotaPlan, Record<ClientPlatform, Partial<Record<QuotaKind, Limit>>>> = {
  free: {
    iphone: { summary: { month: 5, day: 10 }, chat: { month: 30, day: 30 } },
    pc: { summary: { month: 5, day: 3 }, chat: { month: 10, day: 10 } }
  },
  pro: {
    iphone: { summary: { month: 100, day: 20 }, chat: { month: 300, day: 60 }, polish: { month: 100, day: 20 } },
    pc: { summary: { month: 100, day: 20 }, chat: { month: 300, day: 60 }, polish: { month: 100, day: 20 } }
  }
}

/** 1回 ＝ 1時間ぶんの文字起こし（日本語の会話は1時間で約1万8千文字） */
const CHARACTERS_PER_UNIT = 18_000

export function quotaUnits(kind: QuotaKind, characters: number): number {
  if (kind === 'chat') return 1
  return Math.max(1, Math.ceil(characters / CHARACTERS_PER_UNIT))
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

export function subjectId(raw: string): string {
  return createHash('sha256').update(raw).digest('hex').slice(0, 32)
}

export function rewardKey(deviceId: string): string {
  return `giroku:reward:${subjectId(deviceId)}`
}

// ---- 数える（Upstash、だめなら一時的な記憶） ----

const memory = new Map<string, number>()

async function incrementBy(keys: Array<{ key: string; ttl: number }>, by: number): Promise<number[]> {
  const result = await redisPipeline(
    keys.flatMap(({ key, ttl }) => [
      ['INCRBY', key, by],
      ['EXPIRE', key, ttl]
    ])
  )
  if (result) {
    const counts = keys.map((_, i) => Number(result[i * 2]))
    if (counts.every(Number.isFinite)) return counts
  }
  if (memory.size > 50_000) memory.clear()
  return keys.map(({ key }) => {
    const count = (memory.get(key) ?? 0) + by
    memory.set(key, count)
    return count
  })
}

/** リワード広告で足された回数を units だけ使う。足りなければ使わずに false */
async function useReward(deviceId: string, units: number): Promise<boolean> {
  const key = rewardKey(deviceId)
  const result = await redisPipeline([['DECRBY', key, units]])
  const left = Number(result?.[0])
  if (!result || !Number.isFinite(left)) return false
  if (left < 0) {
    await redisPipeline([['INCRBY', key, units]])
    return false
  }
  return true
}

export interface QuotaResult {
  allowed: boolean
  /** 止まった理由 */
  reason?: 'month' | 'day'
  /** iPhone の無料版で、広告を見ればもう1回使えるとき true */
  canReward?: boolean
  limit: Limit
  /** 今月の残り（足りなくなったら0） */
  remainingMonth: number
  /** AI が失敗したときに、使った回数を返す */
  refund: () => Promise<void>
}

/** 回数を1つ（長い会議は何回分か）使う。上限を超えていれば使わずに allowed: false */
export async function takeQuota(options: {
  subject: string
  plan: QuotaPlan
  platform: ClientPlatform
  kind: QuotaKind
  units: number
  deviceId?: string
}): Promise<QuotaResult> {
  const limit = QUOTA_LIMITS[options.plan][options.platform][options.kind]
  const noop = async (): Promise<void> => {}
  if (!limit) return { allowed: true, limit: { month: Infinity, day: Infinity }, remainingMonth: Infinity, refund: noop }
  const id = subjectId(options.subject)
  const monthKey = { key: `giroku:q:${jstMonth()}:${options.plan}:${options.kind}:${id}`, ttl: 40 * 24 * 60 * 60 }
  const dayKey = { key: `giroku:q:${jstDay()}:${options.plan}:${options.kind}:${id}`, ttl: 2 * 24 * 60 * 60 }
  const [month, day] = await incrementBy([monthKey, dayKey], options.units)
  const rollback = (): Promise<number[]> => incrementBy([monthKey, dayKey], -options.units)
  const remainingMonth = Math.max(0, limit.month - month)

  if (day > limit.day) {
    await rollback()
    return { allowed: false, reason: 'day', limit, remainingMonth, refund: noop }
  }
  if (month > limit.month) {
    const rewardable = options.plan === 'free' && options.platform === 'iphone' && options.kind === 'summary'
    if (rewardable && options.deviceId && (await useReward(options.deviceId, options.units))) {
      const deviceId = options.deviceId
      return {
        allowed: true,
        limit,
        remainingMonth: 0,
        refund: async () => {
          await rollback()
          await redisPipeline([['INCRBY', rewardKey(deviceId), options.units]])
        }
      }
    }
    await rollback()
    return { allowed: false, reason: 'month', canReward: rewardable, limit, remainingMonth: 0, refund: noop }
  }
  return { allowed: true, limit, remainingMonth, refund: async () => { await rollback() } }
}

/** 上限に届いたときの案内 */
export function quotaMessage(kind: QuotaKind, plan: QuotaPlan, result: QuotaResult): string {
  const what = kind === 'summary' ? 'AI 議事録の作成' : kind === 'chat' ? 'AI への質問' : '文章の仕上げ'
  if (result.reason === 'day') {
    return `今日の ${what}の上限（${result.limit.day}回）に届きました。日本時間の0時にまた使えます。`
  }
  if (plan === 'pro') {
    return `今月の ${what}の上限（${result.limit.month}回）に届きました。来月1日にまた使えます。`
  }
  if (result.canReward) {
    return `今月の無料の ${what}（${result.limit.month}回）を使い切りました。広告を見ると、もう1回作れます。Pro なら月100回まで使えます。`
  }
  return `今月の無料の ${what}（${result.limit.month}回）を使い切りました。来月1日にまた使えます。Pro なら月100回まで使えます。`
}
