import { NextRequest, NextResponse } from 'next/server'
import { isPaidLicense, fetchWithRetry } from '../../lib/license'

export const runtime = 'nodejs'
export const maxDuration = 60

interface TranscriptSegment {
  speaker: 'self' | 'other'
  text: string
}

// 内容を「講義・説明会型（一方向の情報伝達）」か「議論・会議型（決定事項がある対話）」に
// まず自分で判定させ、適したフォーマットで出力させる（1回のAPI呼び出し内で完結・追加コストなし）。
const SUMMARY_PROMPT_JA = `あなたは議事録・ノート作成アシスタントです。
以下の会話の文字起こしを読み、まず内容が次のどちらに近いか判定してください。
- A: 講義・説明会型（先生・講師・説明者が一方的に話す。質疑応答も含む）
- B: 議論・会議型（複数人が対話し、決定事項やタスクが生まれる）

判定した種類に応じて、次のどちらかのフォーマット（Markdown）で出力してください。

【Aの場合】
## 概要
（1〜2文でこの回の要点）

## 重要ポイント
- （内容の要点を箇条書き）

## 復習・確認しておくこと
- （聞き手が持ち帰って確認・復習すべきこと。なければ「特になし」）

【Bの場合】
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
- A/Bの判定結果や説明は出力せず、選んだフォーマットの本文だけを出力すること
- 出力言語: {LANG}`

const SUMMARY_PROMPT_EN = `You are a meeting/lecture notes assistant.
Read the transcript below and first decide which it is closer to:
- A: Lecture/briefing (one person mainly speaks; may include Q&A)
- B: Discussion/meeting (multiple people converse; decisions/tasks emerge)

Then output using the matching format (Markdown) only:

[If A]
## Summary
(1-2 sentences of the gist)

## Key points
- (bullets of the important content)

## Things to review/follow up
- (what the listener should review or confirm; "None" if none)

[If B]
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
- Do not output which format (A/B) you chose or any explanation — output only the chosen format's body
- Write the output in English`

type SummaryTemplate = 'auto' | 'meeting' | 'lecture' | 'oneOnOne' | 'interview'
type SummaryAdjust = 'longer' | 'shorter'

const MEETING_PROMPT_JA = `あなたは議事録作成アシスタントです。以下の会議の文字起こしを読み、次のフォーマット（Markdown）で出力してください。
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

const LECTURE_PROMPT_JA = `あなたはノート作成アシスタントです。以下の講義・説明会の文字起こしを読み、次のフォーマット（Markdown）で出力してください。
## 概要
（1〜2文でこの回の要点）
## 重要ポイント
- （内容の要点を箇条書き）
## 復習・確認しておくこと
- （聞き手が持ち帰って確認・復習すべきこと。なければ「特になし」）
注意:
- 文字起こしに無い情報を創作しないこと
- 話者は [マイク] / [パソコンの音] で示されています
- 出力言語: {LANG}`

const ONE_ON_ONE_PROMPT_JA = `あなたは1on1ミーティングのメモ作成アシスタントです。以下の会話の文字起こしを読み、次のフォーマット（Markdown）で出力してください。
## 概要
（1〜2文で今回の1on1の要点）
## 現状・共有された内容
- （近況や進捗など共有された内容の箇条書き）
## 課題・気になっていること
- （本人が挙げた悩みや課題。なければ「特になし」）
## 次のアクション
- （担当（本人/上長など）が分かれば付記。なければ「特になし」）
## フィードバック・気づき
- （伝えられたフィードバックや気づき。なければ「特になし」）
注意:
- 文字起こしに無い情報を創作しないこと
- 話者は [マイク] / [パソコンの音] で示されています
- 出力言語: {LANG}`

const INTERVIEW_PROMPT_JA = `あなたは面接メモ作成アシスタントです。以下の面接の文字起こしを読み、次のフォーマット（Markdown）で出力してください。
## 概要
（対象者・ポジションなど分かる範囲で1〜2文）
## 経歴・スキルの要点
- （語られた経歴・経験・スキルの箇条書き）
## 質疑応答のポイント
- （やり取りの中で重要だった質問と回答）
## 懸念点・確認したいこと
- （気になった点や追加で確認すべきこと。なければ「特になし」）
## 総合所感
（面接官の視点でのメモ。決めつけず事実ベースで簡潔に）
注意:
- 文字起こしに無い情報を創作しないこと。評価や合否の断定はしないこと
- 話者は [マイク] / [パソコンの音] で示されています
- 出力言語: {LANG}`

const TEMPLATE_PROMPTS_JA: Record<Exclude<SummaryTemplate, 'auto'>, string> = {
  meeting: MEETING_PROMPT_JA,
  lecture: LECTURE_PROMPT_JA,
  oneOnOne: ONE_ON_ONE_PROMPT_JA,
  interview: INTERVIEW_PROMPT_JA
}

// 「長く／短く」ボタン用：文字起こし全文をふまえて既存の議事録を書き直す。
// 見出し構成は維持し、文字起こしに無い情報は追加しない。
const ADJUST_LONGER_JA = `あなたは議事録編集アシスタントです。
以下は会話の文字起こしと、そこから作成した議事録です。
議事録の見出し構成（##以下の項目）はそのまま保ち、各項目の内容をより詳細に書き直してください。
文字起こしにある具体的な発言・数字・固有名詞・やり取りの経緯を補い、簡潔すぎる箇所を掘り下げてください。
文字起こしに無い情報を創作しないこと。出力は書き直した議事録本文のみ（前置きや説明は不要）。
出力言語: {LANG}`

const ADJUST_SHORTER_JA = `あなたは議事録編集アシスタントです。
以下は会話の文字起こしと、そこから作成した議事録です。
議事録の見出し構成（##以下の項目）はそのまま保ち、各項目をより簡潔に書き直してください。
重要度の低い詳細や重複を削り、要点だけがパッと伝わるようにしてください。
出力は書き直した議事録本文のみ（前置きや説明は不要）。
出力言語: {LANG}`

const ADJUST_LONGER_EN = `You are a meeting notes editing assistant.
Below is a transcript and the meeting notes generated from it.
Keep the same heading structure (## sections) but rewrite each section in more detail.
Add specific statements, numbers, names, and context from the transcript where the current text is too brief.
Do not invent information not in the transcript. Output only the rewritten notes body (no preamble).`

const ADJUST_SHORTER_EN = `You are a meeting notes editing assistant.
Below is a transcript and the meeting notes generated from it.
Keep the same heading structure (## sections) but rewrite each section more concisely.
Cut lower-importance details and redundancy so the key points come across quickly.
Output only the rewritten notes body (no preamble).`

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

  let body: {
    licenseKey?: string
    segments?: TranscriptSegment[]
    lang?: 'ja' | 'en' | 'auto'
    template?: SummaryTemplate
    adjust?: SummaryAdjust
    previousSummary?: string
  }
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

  const langLabel =
    body.lang === 'en' ? 'English' : body.lang === 'auto' ? '文字起こしと同じ言語' : '日本語'

  let prompt: string
  let userContent: string
  if (body.adjust && body.previousSummary) {
    const isEn = body.lang === 'en'
    prompt = isEn
      ? body.adjust === 'longer'
        ? ADJUST_LONGER_EN
        : ADJUST_SHORTER_EN
      : (body.adjust === 'longer' ? ADJUST_LONGER_JA : ADJUST_SHORTER_JA).replace(
          '{LANG}',
          langLabel
        )
    userContent = `${prompt}\n\n---文字起こし---\n${formatTranscript(segments)}\n\n---現在の議事録---\n${body.previousSummary}`
  } else {
    const template = body.template ?? 'auto'
    prompt =
      template === 'auto'
        ? body.lang === 'en'
          ? SUMMARY_PROMPT_EN
          : SUMMARY_PROMPT_JA.replace('{LANG}', langLabel)
        : TEMPLATE_PROMPTS_JA[template].replace('{LANG}', langLabel)
    userContent = `${prompt}\n\n---\n\n${formatTranscript(segments)}`
  }

  try {
    const res = await fetchWithRetry(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userContent }] }]
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
