import { NextRequest, NextResponse } from 'next/server'
import { isPaidLicense } from '../../lib/license'

export const runtime = 'nodejs'
export const maxDuration = 30

function transcribePrompt(lang: 'ja' | 'en' | 'auto' | undefined): string {
  const langLine =
    lang === 'en'
      ? 'Transcribe in English.'
      : lang === 'auto'
        ? '話されている言語（日本語または英語）で文字起こしする。'
        : '日本語で文字起こしする。'
  return `この音声を正確に文字起こししてください。
- ${langLine}
- 発話された内容のみを出力（話者ラベル・注釈・前置き・要約は不要）
- 自然な句読点を付ける
- 聞き取れない/無音の場合は空文字を返す`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 })
  }

  let body: { licenseKey?: string; audioBase64?: string; lang?: 'ja' | 'en' | 'auto' }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  const paid = await isPaidLicense(body.licenseKey)
  if (!paid) {
    return NextResponse.json({ error: '有料プランの認証に失敗しました' }, { status: 403 })
  }
  if (!body.audioBase64) {
    return NextResponse.json({ error: '音声データがありません' }, { status: 400 })
  }

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: transcribePrompt(body.lang) },
                { inlineData: { mimeType: 'audio/wav', data: body.audioBase64 } }
              ]
            }
          ]
        })
      }
    )
    if (!res.ok) {
      return NextResponse.json({ error: `文字起こしに失敗しました (${res.status})` }, { status: 502 })
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
