import { NextRequest, NextResponse } from 'next/server'
import {
  allowApiRequest,
  allowLicenseRequest,
  fetchWithRetry,
  isPaidLicense,
  requestBodyIsTooLarge,
  validTranscriptSegments
} from '../../lib/license'

export const runtime = 'nodejs'
export const maxDuration = 60

interface TranscriptSegment {
  speaker: 'self' | 'other'
  text: string
}

// ローカル(whisper.cpp)で確定済みの文字起こしを、音声を送らずテキストだけで磨く。
// 録音1本につき1回だけ呼ぶ（ライブ中は呼ばない）。音声トークン課金を避け、
// 文章量に応じた安価なテキストトークン課金のみで「読点・誤字の補正」と「短いタイトル」を提供する。
function polishPrompt(lang: 'ja' | 'en' | 'auto' | undefined, includeTitle: boolean): string {
  const langLine =
    lang === 'en'
      ? 'The text is in English.'
      : lang === 'auto'
        ? 'テキストは日本語または英語です。'
        : 'テキストは日本語です。'
  return `以下はローカルの音声認識が生成した文字起こしです。
各要素を、意味を変えずに読点・句点・誤字・不自然な言い回しだけを補正してください。

- ${langLine}
- 各要素は独立した発話です。要約したり、内容を追加/削除したりしないこと
- 入力された全てのidを、同じidのまま1回ずつ返すこと
- 補正の必要がない要素はそのまま返すこと
- 出力は次のJSON形式のみ: {"items":[{"id":0,"text":"補正後"}]${includeTitle ? ',"title":"会話全体のタイトル"' : ''}}
${includeTitle ? `- titleは15〜25文字程度。冒頭だけで判断せず、後述のタイトル用抜粋から最終決定・中心テーマを優先する
- 「〜の」「〜について」など助詞で終わる未完成なtitleは禁止` : ''}`
}

function titlePrompt(lang: 'ja' | 'en' | 'auto' | undefined): string {
  const langLine =
    lang === 'en'
      ? 'The text is in English.'
      : lang === 'auto'
        ? 'テキストは日本語または英語です。'
        : 'テキストは日本語です。'
  return `以下は会話全体から均等に抜粋した文字起こしです。一目で内容が分かる具体的なタイトルを1つ作ってください（15〜25文字程度）。

- ${langLine}
- 冒頭に出た最初の話題だけで判断せず、会話の後半まで読み、最終的に決まったこと・最も長く議論した中心テーマを優先する
- 「〜の」「〜について」など助詞で終わる未完成なタイトルは禁止
- 「会議」「打ち合わせ」だけの抽象的な表現ではなく、対象と目的を含める
- 出力は次のJSON形式のみ: {"title":"タイトル"}`
}

function validGeneratedTitle(title: string): boolean {
  if (title.length < 4 || title.length > 40) return false
  return !/(?:の|について|に関する|における|ための)$/.test(title)
}

// 発話数が多い録音では入力テキスト量に比例して要約が長くなるが、
// タイトルは冒頭〜末尾の流れが分かれば十分なため、長すぎる場合は
// 先頭・末尾を中心に抜粋して軽量化する（応答トークン超過による失敗を避ける）。
function digestForTitle(texts: string[]): string {
  const joined = texts.join('\n')
  const LIMIT = 6000
  if (joined.length <= LIMIT) return joined
  // 冒頭・末尾だけでは、途中で比較検討して最終決定した主題を取り逃がす。
  // 全発話から等間隔に抜き、会話全体の論点と結論をタイトル生成へ渡す。
  const SAMPLE_COUNT = Math.min(100, texts.length)
  const sampled = Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const sourceIndex = Math.round((index * (texts.length - 1)) / Math.max(1, SAMPLE_COUNT - 1))
    return texts[sourceIndex] ?? ''
  })
  return sampled.join('\n').slice(0, LIMIT)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!allowApiRequest(req)) {
    return NextResponse.json({ error: 'リクエストが多すぎます。1分後にお試しください。' }, { status: 429 })
  }
  if (requestBodyIsTooLarge(req)) {
    return NextResponse.json({ error: '文字起こしが長すぎます' }, { status: 413 })
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 })
  }

  let body: { licenseKey?: string; segments?: TranscriptSegment[]; lang?: 'ja' | 'en' | 'auto' }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  if (
    typeof body.licenseKey !== 'string' ||
    body.licenseKey.trim().length === 0 ||
    body.licenseKey.length > 256 ||
    !Array.isArray(body.segments) ||
    (body.lang !== undefined && !['ja', 'en', 'auto'].includes(body.lang))
  ) {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
  }

  if (!allowLicenseRequest(body.licenseKey)) {
    return NextResponse.json({ error: 'AI機能の利用回数が上限に達しました。時間をおいてお試しください。' }, { status: 429 })
  }

  const paid = await isPaidLicense(body.licenseKey)
  if (!paid) {
    return NextResponse.json({ error: '有料プランの認証に失敗しました' }, { status: 403 })
  }

  const segments = body.segments
  if (!validTranscriptSegments(segments)) {
    return NextResponse.json({ error: '文字起こしの形式または長さが不正です' }, { status: 400 })
  }
  if (segments.length === 0) {
    return NextResponse.json({ segments: [], title: null })
  }

  const texts = segments.map((s) => s.text)
  const GEMINI_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

  // 通常の録音は1リクエストで本文補正とタイトル生成を完了する。長文だけ分割する。
  // 発話IDで対応付けるため、モデルが順序を変えても別の発話へ文章を上書きしない。
  const polishResult = await (async (): Promise<{
    segments: TranscriptSegment[]
    title: string | null
    complete: boolean
  }> => {
    const original = segments.map((s) => ({ speaker: s.speaker, text: s.text }))
    const batches: Array<{ items: Array<{ id: number; text: string }> }> = []
    const MAX_BATCH_CHARACTERS = 35_000
    const MAX_BATCH_SEGMENTS = 300
    let batch: Array<{ id: number; text: string }> = []
    let characters = 0
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i] ?? ''
      if (
        batch.length > 0 &&
        (characters + text.length > MAX_BATCH_CHARACTERS || batch.length >= MAX_BATCH_SEGMENTS)
      ) {
        batches.push({ items: batch })
        batch = []
        characters = 0
      }
      batch.push({ id: i, text })
      characters += text.length
    }
    if (batch.length > 0) batches.push({ items: batch })

    const output = [...original]
    let complete = true
    let generatedTitle: string | null = null
    let nextBatch = 0
    const worker = async (): Promise<void> => {
      for (;;) {
        const index = nextBatch++
        const current = batches[index]
        if (!current) return
        try {
          const includeTitle = index === 0
          const titleContext =
            includeTitle && batches.length > 1
              ? `\n\n${titlePrompt(body.lang)}\n\n${digestForTitle(texts)}`
              : ''
          const res = await fetchWithRetry(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${polishPrompt(body.lang, includeTitle)}\n\n${JSON.stringify(current.items)}${titleContext}`
                    }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                maxOutputTokens: 65536,
                thinkingConfig: { thinkingBudget: 512 }
              }
            })
          })
          if (!res.ok) {
            complete = false
            console.warn(`[polish] batch ${index + 1}/${batches.length}: Gemini ${res.status}`)
            continue
          }
          const data = (await res.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
          }
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
          const parsed = JSON.parse(raw) as { items?: unknown; title?: unknown }
          const returned = Array.isArray(parsed.items) ? parsed.items : []
          const expectedIds = new Set(current.items.map((item) => item.id))
          const seenIds = new Set<number>()
          for (const value of returned) {
            if (!value || typeof value !== 'object') continue
            const item = value as { id?: unknown; text?: unknown }
            if (
              typeof item.id !== 'number' ||
              !Number.isInteger(item.id) ||
              !expectedIds.has(item.id) ||
              seenIds.has(item.id) ||
              typeof item.text !== 'string'
            ) {
              continue
            }
            seenIds.add(item.id)
            const originalSegment = segments[item.id]
            if (!originalSegment) continue
            output[item.id] = {
              speaker: originalSegment.speaker,
              text: item.text.trim() || originalSegment.text
            }
          }
          if (seenIds.size !== expectedIds.size) {
            complete = false
            console.warn(
              `[polish] batch ${index + 1}/${batches.length}: item count ${seenIds.size}/${expectedIds.size}`
            )
          }
          if (includeTitle && typeof parsed.title === 'string') {
            const cleaned = parsed.title.trim()
            generatedTitle = validGeneratedTitle(cleaned) ? cleaned : null
          }
        } catch (error) {
          complete = false
          console.warn(
            `[polish] batch ${index + 1}/${batches.length}: ${error instanceof Error ? error.name : 'unknown error'}`
          )
          // 失敗したバッチだけ原文を維持し、他の区間は処理を続ける。
        }
      }
    }
    // 300発話/35,000文字を超える長文だけ最大2並列にする。通常録音は1回で完了する。
    await Promise.all(Array.from({ length: Math.min(2, batches.length) }, () => worker()))
    return { segments: output, title: generatedTitle, complete }
  })()

  return NextResponse.json({
    segments: polishResult.segments,
    title: polishResult.title,
    polished: polishResult.complete
  })
}
