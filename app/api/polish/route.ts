import { NextRequest, NextResponse } from 'next/server'
import { isPaidLicense, fetchWithRetry } from '../../lib/license'

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
  return `以下は会話の文字起こしです。会話全体の内容から、一目で分かる短いタイトルを1つ作ってください（15文字程度、体言止め、絵文字や記号は使わない）。

- ${langLine}
- タイトルの文字列だけを出力し、説明や引用符は付けないこと`
}

// 発話数が多い録音では入力テキスト量に比例して要約が長くなるが、
// タイトルは冒頭〜末尾の流れが分かれば十分なため、長すぎる場合は
// 先頭・末尾を中心に抜粋して軽量化する（応答トークン超過による失敗を避ける）。
function digestForTitle(texts: string[]): string {
  const joined = texts.join('\n')
  const LIMIT = 6000
  if (joined.length <= LIMIT) return joined
  const head = texts.slice(0, 40).join('\n')
  const tail = texts.slice(-20).join('\n')
  return `${head}\n…(中略)…\n${tail}`.slice(0, LIMIT)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const paid = await isPaidLicense(body.licenseKey)
  if (!paid) {
    return NextResponse.json({ error: '有料プランの認証に失敗しました' }, { status: 403 })
  }

  const segments = body.segments ?? []
  if (segments.length === 0) {
    return NextResponse.json({ segments: [], title: null })
  }

  const texts = segments.map((s) => s.text)
  const GEMINI_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

  // タイトルは発話数が多い録音でも軽量な入力で必ず生成できるよう、
  // 本文の一括補正とは独立した呼び出しにする（片方が失敗しても他方に影響させない）。
  let title: string | null = null
  try {
    const res = await fetchWithRetry(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${titlePrompt(body.lang)}\n\n${digestForTitle(texts)}` }] }
        ],
        generationConfig: { maxOutputTokens: 60 }
      })
    })
    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const raw = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim()
      const cleaned = raw.replace(/^["「『]|["」』]$/g, '').trim()
      if (cleaned) title = cleaned
    }
  } catch {
    // タイトル生成の失敗は無視（保存側でデフォルトタイトルにフォールバックする）
  }

  // 本文の読点・誤字補正（件数が一致しない/失敗した場合は原文をそのまま返す＝安全側フォールバック）
  let polishedSegments = segments.map((s) => ({ speaker: s.speaker, text: s.text }))
  try {
    const res = await fetchWithRetry(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${polishPrompt(body.lang)}\n\n${JSON.stringify(texts)}` }]
          }
        ],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 65536 }
      })
    })
    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const parsed = JSON.parse(raw) as { texts?: unknown }
      const polished = Array.isArray(parsed.texts) ? parsed.texts.map((t) => String(t)) : []
      if (polished.length === segments.length) {
        polishedSegments = segments.map((s, i) => ({
          speaker: s.speaker,
          text: polished[i]?.trim() || s.text
        }))
      }
    }
  } catch {
    // 補正の失敗は無視し、原文のまま返す
  }

  return NextResponse.json({ segments: polishedSegments, title })
}
