import { createHash } from 'node:crypto'
import { jstDay, jstMonth, redisPipeline } from './redis'

/**
 * AI の回数の上限（2026-11-11 本人の判断。利益率50%を保つため）。
 *
 * - 質問は iPhone も Mac も Windows もすべてここ（クラウドの AI）で答えて数える。端末の中の AI で答える仕組みは
 *   2026-11-12 にやめた（端末の AI は答えの1割ほどが誤っていたため。点検で今の仕様に直した）
 * - 「議事録を作る」「質問（書き直しを含む）」「文章を整える（Pro）」は別々に数える
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
/**
 * 英語は1文字が短い（単語と空白で数える）ので、1時間で約5万5千文字になる。日本語の目安のままだと、
 * 1時間の英語の会議を3回分と数えていた（2026-11-12 の点検）。
 * 'auto'（日本語か英語か分からない）は、費用で損をしないよう日本語の目安で数える。
 */
const CHARACTERS_PER_UNIT_EN = 55_000

export function quotaUnits(kind: QuotaKind, characters: number, lang?: 'ja' | 'en' | 'auto'): number {
  if (kind === 'chat') return 1
  const perUnit = lang === 'en' ? CHARACTERS_PER_UNIT_EN : CHARACTERS_PER_UNIT
  return Math.max(1, Math.ceil(characters / perUnit))
}

/**
 * どの端末からの依頼か。今のアプリは端末を名乗らないので、送り方の違いで見分ける。
 * iPhone は Apple の通信の部品（CFNetwork）を通るので、その名前が User-Agent に入る。
 * PC 版は Electron の裏側（Node.js）から送るので入らない。
 * 偽ることはできるが、偽っても iPhone の上限になるだけ。
 * iPhone の無料版の上限は PC より緩い（議事録 1日10回・質問 月30回）ので、偽れば少し多く使えるが、
 * 月の議事録の回数（5回）は同じで、増える費用は小さい。アプリが端末を名乗る仕組みを入れるまでは
 * これを受け入れる（2026-11-12 の点検・本人の判断。直さない）。
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
async function spendReward(deviceId: string, units: number): Promise<boolean> {
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
  /** 今回、今月の回数から引いた数（送り直し・上限で止めたときは0。返したあとの残りを出すため。2026-11-12 の点検） */
  charged?: number
}

/** アプリが任意で送る、1回の依頼の番号（送り直しでも同じ番号）。36字までの文字列（UUID など。空白や日本語は受け付けず、無い扱い） */
export function validRequestId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 36 && /^[\x21-\x7e]+$/.test(value)
}

/** 同じ番号の送り直しを数えずに通すのは2回まで（同じ番号を使い回して、ただで AI を使い続けられないように） */
const MAX_FREE_RETRIES = 2
const REQUEST_ID_TTL = 2 * 60

/** 回数を1つ（長い会議は何回分か）使う。上限を超えていれば使わずに allowed: false */
export async function takeQuota(options: {
  subject: string
  plan: QuotaPlan
  platform: ClientPlatform
  kind: QuotaKind
  units: number
  deviceId?: string
  /** 送り直しを見分ける番号（無い古いアプリは今までどおり毎回数える） */
  requestId?: string
}): Promise<QuotaResult> {
  const limit = QUOTA_LIMITS[options.plan][options.platform][options.kind]
  const noop = async (): Promise<void> => {}
  if (!limit) return { allowed: true, limit: { month: Infinity, day: Infinity }, remainingMonth: Infinity, refund: noop }
  const id = subjectId(options.subject)
  const monthKey = { key: `giroku:q:${jstMonth()}:${options.plan}:${options.kind}:${id}`, ttl: 40 * 24 * 60 * 60 }
  const dayKey = { key: `giroku:q:${jstDay()}:${options.plan}:${options.kind}:${id}`, ttl: 2 * 24 * 60 * 60 }

  // 送り直し（通信が切れてアプリがもう一度送った）は数えない（2026-11-12 の点検）。
  // 前は1回の依頼が2回分に数えられていた。番号は2分覚えておき（SET NX）、2回目からは AI に答えさせるが回数は減らさない
  let requestKey: string | null = null
  if (options.requestId && validRequestId(options.requestId)) {
    const key = `giroku:req:${options.kind}:${id}:${options.requestId}`
    const first = await redisPipeline([['SET', key, '1', 'NX', 'EX', REQUEST_ID_TTL]])
    if (first?.[0] === 'OK') {
      requestKey = key
    } else if (first && first[0] === null) {
      const dup = await redisPipeline([
        ['INCR', `${key}:dup`],
        ['EXPIRE', `${key}:dup`, REQUEST_ID_TTL],
        ['GET', monthKey.key]
      ])
      const dupCount = Number(dup?.[0])
      if (dup && Number.isFinite(dupCount) && dupCount <= MAX_FREE_RETRIES) {
        const used = Math.max(0, Number(dup[2] ?? 0) || 0)
        return { allowed: true, limit, remainingMonth: Math.max(0, limit.month - used), refund: noop }
      }
      // 送り直しが多すぎる → 新しい依頼として数える
    }
    // Upstash が答えないとき（first が null）は、今までどおり数える
  }
  // 数えなかった・回数を返したときは番号も忘れる（次の送り直しは新しい依頼として数える）
  const forgetRequest = async (): Promise<void> => {
    if (requestKey) await redisPipeline([['DEL', requestKey]])
  }

  const [month, day] = await incrementBy([monthKey, dayKey], options.units)
  const rollback = async (): Promise<number[]> => {
    await forgetRequest()
    return incrementBy([monthKey, dayKey], -options.units)
  }
  const remainingMonth = Math.max(0, limit.month - month)

  if (day > limit.day) {
    await rollback()
    return { allowed: false, reason: 'day', limit, remainingMonth, refund: noop }
  }
  if (month > limit.month) {
    const rewardable = options.plan === 'free' && options.platform === 'iphone' && options.kind === 'summary'
    // 広告1本で、会議の長さに関係なく議事録を1つ作れる（「広告を見ると、もう1回作れます」の案内どおり）。
    // 前は会議の長さの分（2時間なら2回）を引こうとして足りず、広告を見ても作れなかった（2026-11-12 の点検・本人の判断）
    if (rewardable && options.deviceId && (await spendReward(options.deviceId, 1))) {
      const deviceId = options.deviceId
      return {
        allowed: true,
        limit,
        remainingMonth: 0,
        refund: async () => {
          await rollback()
          await redisPipeline([['INCRBY', rewardKey(deviceId), 1]])
        }
      }
    }
    await rollback()
    return { allowed: false, reason: 'month', canReward: rewardable, limit, remainingMonth: 0, refund: noop }
  }
  return { allowed: true, limit, remainingMonth, charged: options.units, refund: async () => { await rollback() } }
}

/** 「2026-12-01」→「12月1日」（PC 版の app/src/shared/quota.ts の resetDateLabel と同じ） */
export function resetDateLabel(resetsOn: string): string {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(resetsOn)
  if (!m) return '来月1日'
  return `${Number(m[1])}月${Number(m[2])}日`
}

/** 上限に届いたときの案内 */
export function quotaMessage(kind: QuotaKind, plan: QuotaPlan, result: QuotaResult, now = Date.now()): string {
  // 「文章の仕上げ」は、アプリの画面の呼び方「文章を整える」にそろえた（2026-11-12 の点検）
  const what = kind === 'summary' ? 'AI 議事録の作成' : kind === 'chat' ? 'AI への質問' : '「文章を整える」'
  // 「AI」で始まる言葉の前だけ空ける（「今月の AI 議事録」「今月の「文章を整える」」）
  const sp = what.startsWith('AI') ? ' ' : ''
  // 「来月1日にまた使えます」を、PC 版と同じ「12月1日にもとの回数に戻ります」の形にそろえた（2026-11-12 の点検）
  const reset = `${resetDateLabel(nextResetDate(now))}にもとの回数に戻ります。`
  if (result.reason === 'day') {
    return `今日の${sp}${what}の上限（${result.limit.day}回）に届きました。日本時間の0時にまた使えます。`
  }
  if (plan === 'pro') {
    return `今月の${sp}${what}の上限（${result.limit.month}回）に届きました。${reset}`
  }
  // Pro の回数は種類ごとに違う（質問は月300回）。100回と固定していたため、質問でも「月100回」と出ていた（2026-11-12）
  const proMonth = QUOTA_LIMITS.pro.pc[kind]?.month ?? 100
  if (result.canReward) {
    return `今月の無料の${sp}${what}（${result.limit.month}回）を使い切りました。広告を見ると、もう1回作れます。Pro なら月${proMonth}回まで使えます。`
  }
  return `今月の無料の${sp}${what}（${result.limit.month}回）を使い切りました。${reset}Pro なら月${proMonth}回まで使えます。`
}

export interface QuotaStatus {
  kind: QuotaKind
  monthLimit: number
  monthUsed: number
  remaining: number
  dayLimit: number
  dayUsed: number
}

/** 回数を減らさずに、今月と今日の使った数を返す（アプリが残りのバーを出すため） */
export async function peekQuota(subject: string, plan: QuotaPlan, platform: ClientPlatform): Promise<QuotaStatus[]> {
  const id = subjectId(subject)
  const kinds = (Object.keys(QUOTA_LIMITS[plan][platform]) as QuotaKind[])
  const keys = kinds.flatMap((kind) => [
    `giroku:q:${jstMonth()}:${plan}:${kind}:${id}`,
    `giroku:q:${jstDay()}:${plan}:${kind}:${id}`
  ])
  const result = await redisPipeline([['MGET', ...keys]])
  const values = Array.isArray(result?.[0]) ? (result![0] as unknown[]) : keys.map((key) => memory.get(key) ?? 0)
  return kinds.map((kind, i) => {
    const limit = QUOTA_LIMITS[plan][platform][kind]!
    const monthUsed = Math.max(0, Number(values[i * 2] ?? 0) || 0)
    const dayUsed = Math.max(0, Number(values[i * 2 + 1] ?? 0) || 0)
    return {
      kind,
      monthLimit: limit.month,
      monthUsed,
      remaining: Math.max(0, limit.month - monthUsed),
      dayLimit: limit.day,
      dayUsed
    }
  })
}

/** リワード広告で足されて、まだ使っていない回数 */
export async function rewardCredits(deviceId: string): Promise<number> {
  const result = await redisPipeline([['GET', rewardKey(deviceId)]])
  return Math.max(0, Number(result?.[0] ?? 0) || 0)
}

/** 来月1日（日本時間）を「2026-12-01」の形で */
export function nextResetDate(now = Date.now()): string {
  const jst = new Date(now + 9 * 60 * 60 * 1000)
  const next = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth() + 1, 1))
  return next.toISOString().slice(0, 10)
}
