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

// AI議事録の下のチャット欄用：ユーザーの自由入力が「書き直し依頼」か「質問」かを
// AI自身に判定させ、判定結果に応じて出力の種類を切り替える（1回の呼び出しで完結）。
const CHAT_PROMPT_JA = `あなたは議事録編集・質問応答アシスタントです。
以下は会話の文字起こしと、そこから作成した議事録、そしてユーザーからのメッセージです。

まずユーザーのメッセージの意図を判定してください。
- 議事録の書き直し・修正（例:「もっと詳しく」「短くして」「ToDoを増やして」）→ REVISE
- 内容についての質問・コメント（例:「何時に終わった？」「誰が反対してた？」）→ ANSWER

判定結果に応じて、次の形式で出力してください（1行目はREVISEかANSWERのどちらか、2行目は---のみ）。

REVISEの場合:
REVISE
---
（書き直した議事録の本文全体。見出し構成（## 項目）はできるだけ維持し、
ユーザーの依頼に沿って内容を調整する。文字起こしに無い情報は創作しない）

ANSWERの場合:
ANSWER
---
（ユーザーへの回答。文字起こし・議事録に基づいて答え、分からない場合は
「文字起こしからは分かりません」のように正直に答える。他のアプリに
そのまま貼り付けても読みやすいよう、Markdown記法（箇条書き・太字など）
を必要に応じて使って整形する）

出力言語: {LANG}`

const CHAT_PROMPT_EN = `You are a meeting notes editing and Q&A assistant.
Below is a transcript, the meeting notes generated from it, and a message from the user.

First decide the user's intent:
- A request to rewrite/revise the notes (e.g. "make it more detailed", "shorter please", "add more action items") → REVISE
- A question or comment about the content (e.g. "when did it end?", "who disagreed?") → ANSWER

Output in this exact format (line 1 is REVISE or ANSWER, line 2 is just ---):

If REVISE:
REVISE
---
(the full rewritten notes body. Keep the same heading structure (## sections) as much as
possible, adjusting the content per the user's request. Do not invent information not in the transcript)

If ANSWER:
ANSWER
---
(an answer to the user, grounded in the transcript/notes. If you don't know, say so honestly,
e.g. "The transcript doesn't show that." Use Markdown formatting (bullets, bold, etc.) where
it helps readability, so the answer pastes cleanly into other apps.)`

const TITLE_OUTPUT_JA = `

出力の先頭に、会話全体を表すタイトルを次の形式で必ず付けてください。
TITLE: （15〜25文字程度の具体的なタイトル）
---
（この下に指定されたMarkdown本文）

タイトルは冒頭の最初の話題だけで決めず、会話の後半まで見て、最終的に決まったこと・最も長く議論した中心テーマを優先してください。「〜の」「〜について」など助詞で終わる未完成な表現は禁止です。`

const TITLE_OUTPUT_EN = `

Start the output with a concise, specific title for the entire conversation in this exact format:
TITLE: (a 5-10 word title)
---
(the requested Markdown body below)

Do not choose a title from only the opening topic. Prefer the final decision or the central topic discussed across the conversation.`

function validGeneratedTitle(title: string): boolean {
  if (title.length < 4 || title.length > 40) return false
  return !/(?:の|について|に関する|における|ための)$/.test(title)
}

function formatTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${s.speaker === 'self' ? 'マイク' : 'パソコンの音'}] ${s.text}`)
    .join('\n')
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

  let body: {
    licenseKey?: string
    segments?: TranscriptSegment[]
    lang?: 'ja' | 'en' | 'auto'
    template?: SummaryTemplate
    instruction?: string
    previousSummary?: string
  }
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
    (body.lang !== undefined && !['ja', 'en', 'auto'].includes(body.lang)) ||
    (body.template !== undefined &&
      !['auto', 'meeting', 'lecture', 'oneOnOne', 'interview'].includes(body.template)) ||
    (body.instruction !== undefined && typeof body.instruction !== 'string') ||
    (body.previousSummary !== undefined && typeof body.previousSummary !== 'string')
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
  if ((body.instruction?.length ?? 0) > 2000 || (body.previousSummary?.length ?? 0) > 100_000) {
    return NextResponse.json({ error: '編集依頼または議事録が長すぎます' }, { status: 400 })
  }
  if (segments.length === 0) {
    return NextResponse.json({ error: '文字起こしがありません' }, { status: 400 })
  }

  const langLabel =
    body.lang === 'en' ? 'English' : body.lang === 'auto' ? '文字起こしと同じ言語' : '日本語'
  const isChat = Boolean(body.instruction && body.previousSummary)

  let userContent: string
  if (isChat) {
    const prompt =
      body.lang === 'en' ? CHAT_PROMPT_EN : CHAT_PROMPT_JA.replace('{LANG}', langLabel)
    userContent = `${prompt}\n\n---文字起こし---\n${formatTranscript(segments)}\n\n---現在の議事録---\n${body.previousSummary}\n\n---ユーザーのメッセージ---\n${body.instruction}`
  } else {
    const template = body.template ?? 'auto'
    const prompt =
      template === 'auto'
        ? body.lang === 'en'
          ? SUMMARY_PROMPT_EN
          : SUMMARY_PROMPT_JA.replace('{LANG}', langLabel)
        : TEMPLATE_PROMPTS_JA[template].replace('{LANG}', langLabel)
    const titleInstruction = body.lang === 'en' ? TITLE_OUTPUT_EN : TITLE_OUTPUT_JA
    userContent = `${prompt}${titleInstruction}\n\n---文字起こし---\n${formatTranscript(segments)}`
  }

  try {
    const res = await fetchWithRetry(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userContent }] }],
          generationConfig: {
            // 2.5 Flashの動的thinkingは長い会話で待ち時間が大きく振れるため上限を固定する。
            // 要約・質問に必要な推論余地は残しつつ、数万thinking tokenへ膨らむのを防ぐ。
            thinkingConfig: { thinkingBudget: 1024 },
            maxOutputTokens: isChat ? 8192 : 4096
          }
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

    if (isChat) {
      const match = text.match(/^(REVISE|ANSWER)\s*\n-{2,}\s*\n([\s\S]*)$/)
      const type = match?.[1] === 'REVISE' ? 'revise' : 'answer'
      const content = (match?.[2] ?? text).trim()
      return NextResponse.json({ type, content })
    }
    const match = text.match(/^TITLE[:：]\s*(.+?)\s*\n-{3,}\s*\n([\s\S]+)$/i)
    const generatedTitle = match?.[1]?.trim() ?? ''
    const summary = (match?.[2] ?? text).trim()
    return NextResponse.json({
      summary,
      title: validGeneratedTitle(generatedTitle) ? generatedTitle : null
    })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
