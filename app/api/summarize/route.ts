import { NextRequest, NextResponse } from 'next/server'
import { isPaidLicense, fetchWithRetry } from '../../lib/license'

export const runtime = 'nodejs'
export const maxDuration = 60

interface TranscriptSegment {
  speaker: 'self' | 'other'
  text: string
}

const SUMMARY_PROMPT_JA = `あなたは議事録作成アシスタントです。
以下の会話の文字起こしから、簡潔で構造化された議事録を作成してください。

出力フォーマット（Markdown）:
## 概要
（1〜2文で会議全体の要点）

## 決定事項
- （箇条書き。なければ「特になし」）

## ToDo / ネクストアクション
- （担当が分かれば「担当: 」を付記。なければ「特になし」）

## 議論の要点
- （重要な論点を箇条書き）

注意:
- 文字起こしに無い情報を創作しないこと
- 話者は [マイク] / [パソコンの音] で示されています
- 出力言語: {LANG}`

const SUMMARY_PROMPT_EN = `You are a meeting-minutes assistant.
From the transcript below, produce concise, structured minutes.

Output format (Markdown):
## Summary
(1-2 sentences of the overall gist)

## Decisions
- (bullets; "None" if there are none)

## Action items / Next steps
- (add "Owner: " if known; "None" if there are none)

## Key discussion points
- (bullet the important points)

Notes:
- Do not invent information not in the transcript
- Speakers are marked [mic] / [computer audio]
- Write the output in English`

function formatTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${s.speaker === 'self' ? 'マイク' : 'パソコンの音'}] ${s.text}`)
    .join('\n')
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
    return NextResponse.json({ error: '文字起こしがありません' }, { status: 400 })
  }

  const prompt =
    body.lang === 'en'
      ? SUMMARY_PROMPT_EN
      : SUMMARY_PROMPT_JA.replace('{LANG}', body.lang === 'auto' ? '文字起こしと同じ言語' : '日本語')

  try {
    const res = await fetchWithRetry(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${prompt}\n\n---\n\n${formatTranscript(segments)}` }] }
          ]
        })
      }
    )
    if (!res.ok) {
      return NextResponse.json({ error: `要約に失敗しました (${res.status})` }, { status: 502 })
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    if (!text) {
      return NextResponse.json({ error: '要約の生成に失敗しました（空の応答）' }, { status: 502 })
    }
    return NextResponse.json({ summary: text })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
