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
function polishPrompt(lang: 'ja' | 'en' | 'auto' | undefined): string {
  const langLine =
    lang === 'en'
      ? 'The text is in English.'
      : lang === 'auto'
        ? 'テキストは日本語または英語です。'
        : 'テキストは日本語です。'
  return `以下はローカルの音声認識が生成した文字起こしの配列です。
1. 各要素を、意味を変えずに読点・句点・誤字・不自然な言い回しだけを補正してください

- ${langLine}
- 各要素は独立した発話です。要約したり、内容を追加/削除したりしないこと
- 入力と同じ要素数の配列を、同じ順序で返すこと
- 補正の必要がない要素はそのまま返すこと
- 出力は次のJSON形式のみ: {"texts": ["補正後1", "補正後2", ...]}`
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

  // タイトルと本文補正は互いに依存しない。同じモデル・プロンプト・出力条件のまま
  // 並列に実行し、2回分のGemini待ち時間が直列に積み上がらないようにする。
  const titlePromise = (async (): Promise<string | null> => {
    try {
      const res = await fetchWithRetry(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${titlePrompt(body.lang)}\n\n${digestForTitle(texts)}` }]
            }
          ],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 100 }
        })
      })
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
        }
        const raw = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim()
        const parsed = JSON.parse(raw) as { title?: unknown }
        const cleaned = typeof parsed.title === 'string' ? parsed.title.trim() : ''
        return validGeneratedTitle(cleaned) ? cleaned : null
      }
      return null
    } catch {
      // タイトル生成の失敗は無視（保存側でデフォルトタイトルにフォールバックする）
      return null
    }
  })()

  // 本文の読点・誤字補正（件数が一致しない/失敗した場合は原文をそのまま返す＝安全側フォールバック）
  const polishPromise = (async (): Promise<{
    segments: TranscriptSegment[]
    complete: boolean
  }> => {
    const original = segments.map((s) => ({ speaker: s.speaker, text: s.text }))
    const batches: Array<{ start: number; texts: string[] }> = []
    const MAX_BATCH_CHARACTERS = 35_000
    const MAX_BATCH_SEGMENTS = 60
    let start = 0
    let batch: string[] = []
    let characters = 0
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i] ?? ''
      if (
        batch.length > 0 &&
        (characters + text.length > MAX_BATCH_CHARACTERS || batch.length >= MAX_BATCH_SEGMENTS)
      ) {
        batches.push({ start, texts: batch })
        start = i
        batch = []
        characters = 0
      }
      batch.push(text)
      characters += text.length
    }
    if (batch.length > 0) batches.push({ start, texts: batch })

    const output = [...original]
    let complete = true
    let nextBatch = 0
    const worker = async (): Promise<void> => {
      for (;;) {
        const index = nextBatch++
        const current = batches[index]
        if (!current) return
        try {
          const res = await fetchWithRetry(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${polishPrompt(body.lang)}\n\n${JSON.stringify(current.texts)}`
                    }
                  ]
                }
              ],
              generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 65536 }
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
          const parsed = JSON.parse(raw) as { texts?: unknown }
          const polished = Array.isArray(parsed.texts) ? parsed.texts.map((t) => String(t)) : []
          if (polished.length !== current.texts.length) {
            complete = false
            console.warn(
              `[polish] batch ${index + 1}/${batches.length}: item count ${polished.length}/${current.texts.length}`
            )
            continue
          }
          for (let offset = 0; offset < polished.length; offset++) {
            const originalSegment = segments[current.start + offset]
            if (!originalSegment) continue
            output[current.start + offset] = {
              speaker: originalSegment.speaker,
              text: polished[offset]?.trim() || originalSegment.text
            }
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
    // 長文は最大2バッチだけ並列にし、待ち時間を縮めつつ瞬間的なAPI負荷を抑える。
    await Promise.all(Array.from({ length: Math.min(2, batches.length) }, () => worker()))
    return { segments: output, complete }
  })()

  const [title, polishedResult] = await Promise.all([titlePromise, polishPromise])
  return NextResponse.json({
    segments: polishedResult.segments,
    title,
    polished: polishedResult.complete
  })
}
