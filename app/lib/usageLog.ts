import { jstDay, redisPipeline } from './redis'

/**
 * AI に送った量・返ってきた量を、日ごとに Upstash へ足していく（2026-11-11 本人の判断）。
 * 見積もりではなく本当の費用で、上限の数や値段を決めるため。
 * 文字起こしの中身・端末の ID は記録しない。数だけ。
 *
 * 鍵：giroku:usage:YYYYMMDD（日本時間）。欄：「モデル|用途|プラン|項目」。90日で消える。
 */
export type UsageKind = 'summary' | 'chat' | 'polish'

interface UsageMetadata {
  promptTokenCount?: number
  candidatesTokenCount?: number
  thoughtsTokenCount?: number
  cachedContentTokenCount?: number
}

export async function recordUsage(
  model: string,
  kind: UsageKind,
  paid: boolean,
  usage: UsageMetadata | undefined
): Promise<void> {
  if (!usage) return
  const key = `giroku:usage:${jstDay()}`
  const prefix = `${model}|${kind}|${paid ? 'pro' : 'free'}`
  const fields: Array<[string, number]> = [
    ['calls', 1],
    ['in', usage.promptTokenCount ?? 0],
    ['cached', usage.cachedContentTokenCount ?? 0],
    ['out', usage.candidatesTokenCount ?? 0],
    ['thoughts', usage.thoughtsTokenCount ?? 0]
  ]
  await redisPipeline([
    ...fields.map(([name, value]) => ['HINCRBY', key, `${prefix}|${name}`, value]),
    ['EXPIRE', key, 90 * 24 * 60 * 60]
  ])
}
