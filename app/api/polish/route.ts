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
// 文章量に応じた安価なテキストトークン課金のみで「読点・誤字の補正」を提供する。
function polishPrompt(lang: 'ja' | 'en' | 'auto' | undefined): string {
  const langLine =
    lang === 'en'
      ? 'The text is in English.'
      : lang === 'auto'
        ? 'テキストは日本語または英語です。'
        : 'テキストは日本語です。'
  return `以下はローカルの音声認識が生成した文字起こしの配列です。各要素を、意味を変えずに読点・句点・誤字・不自然な言い回しだけを補正してください。
- ${langLine}
- 各要素は独立した発話です。要約したり、内容を追加/削除したりしないこと
- 入力と同じ要素数の配列を、同じ順序で返すこと
- 補正の必要がない要素はそのまま返すこと
- 出力は次のJSON形式のみ: {"texts": ["補正後1", "補正後2", ...]}`
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
    return NextResponse.json({ segments: [] })
  }

  const texts = segments.map((s) => s.text)

  try {
    const res = await fetchWithRetry(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${polishPrompt(body.lang)}\n\n${JSON.stringify(texts)}` }]
            }
          ],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    )
    if (!res.ok) {
      return NextResponse.json({ error: `補正に失敗しました (${res.status})` }, { status: 502 })
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    let polished: string[] = []
    try {
      const parsed = JSON.parse(raw) as { texts?: unknown }
      if (Array.isArray(parsed.texts)) polished = parsed.texts.map((t) => String(t))
    } catch {
      polished = []
    }

    // 件数が一致しない/失敗した場合は原文をそのまま返す（安全側フォールバック）
    if (polished.length !== segments.length) {
      return NextResponse.json({
        segments: segments.map((s) => ({ speaker: s.speaker, text: s.text }))
      })
    }

    return NextResponse.json({
      segments: segments.map((s, i) => ({ speaker: s.speaker, text: polished[i]?.trim() || s.text }))
    })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
