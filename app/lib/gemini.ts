import { fetchWithRetry } from './license'

/**
 * Gemini のモデル選びと、提供終了への備え。
 *
 * gemini-2.5 系は Gemini API の提供終了予定（2026-10-16）が出ており、新規プロジェクトでは
 * 2.5 Flash-Lite がすでに404になっていた（実測）。モデルが見つからない・使えないときは
 * 次の候補へ自動で切り替え、AI機能がまとめて止まらないようにする。
 *
 * - quality: Pro の議事録・質問。3.5 Flash-Lite（2.5 Flash は 2026-12-01 に提供終了。後継として Google が示すもの。
 *   値段は 2.5 Flash と同じ）
 * - polish: Pro の文章の仕上げ。誤字や読点を直すだけで返す文字が多いので、安い 3.1 Flash-Lite（2026-11-11 本人の判断）
 * - economy: 無料（広告で運営）。原価の安い 3.1 Flash-Lite
 * 3.1 Flash-Lite の提供終了は早くて 2027-05-07（後継は 3.5 Flash-Lite）。
 */
export type GeminiTier = 'quality' | 'polish' | 'economy'

const CANDIDATES: Record<GeminiTier, string[]> = {
  // 後ろの候補は、前のモデルが見つからない（404）ときの受け皿
  quality: ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'],
  polish: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
  economy: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite']
}

// 404 になったモデルは、このサーバーが動いている間は試さない（毎回の無駄な往復を避ける）
const unavailable = new Set<string>()

interface GenerationOptions {
  /** 2.5 系の thinkingBudget（0 なら推論なし） */
  thinkingBudget: number
}

function thinkingConfigFor(model: string, opts: GenerationOptions): Record<string, unknown> | null {
  if (model.startsWith('gemini-2.5')) return { thinkingBudget: opts.thinkingBudget }
  // 3 系は thinkingBudget ではなく thinkingLevel で指定する。推論を抑えて原価と待ち時間を減らす
  return { thinkingLevel: 'low' }
}

export async function generateContent(
  tier: GeminiTier,
  apiKey: string,
  body: { generationConfig?: Record<string, unknown> } & Record<string, unknown>,
  opts: GenerationOptions
): Promise<{ res: Response; model: string }> {
  const models = CANDIDATES[tier].filter((m) => !unavailable.has(m))
  let last: { res: Response; model: string } | null = null
  for (const model of models.length > 0 ? models : CANDIDATES[tier]) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
    const thinking = thinkingConfigFor(model, opts)
    const attempts = thinking ? [thinking, null] : [null]
    for (const thinkingConfig of attempts) {
      const generationConfig = { ...(body.generationConfig ?? {}) }
      delete generationConfig.thinkingConfig
      if (thinkingConfig) generationConfig.thinkingConfig = thinkingConfig
      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ ...body, generationConfig })
      })
      last = { res, model }
      if (res.ok) return last
      if (res.status === 404) {
        unavailable.add(model)
        break
      }
      // 推論の指定方法が合わないモデルでは、指定を外してもう一度だけ試す
      if (res.status === 400 && thinkingConfig) continue
      return last
    }
  }
  return last as { res: Response; model: string }
}

/** 応答から本文だけを取り出す（3 系では推論の部分や署名が別のパートに入ることがある） */
export function responseText(data: {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>
}): string {
  const parts = data.candidates?.[0]?.content?.parts ?? []
  return parts
    .filter((part) => !part.thought && typeof part.text === 'string')
    .map((part) => part.text)
    .join('')
}
