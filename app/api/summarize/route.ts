import { NextRequest, NextResponse } from 'next/server'
import {
  allowApiRequest,
  allowLicenseRequest,
  allowAnonymousRequest,
  allowMobilePaidRequest,
  isValidAnonymousDeviceId,
  fetchWithRetry,
  isPaidLicense,
  isPaidPortableInstance,
  isPaidMobileAccount,
  isPaidMobileDevice,
  requestBodyIsTooLarge,
  validTranscriptSegments
} from '../../lib/license'

export const runtime = 'nodejs'
export const maxDuration = 60

interface TranscriptSegment {
  speaker: 'self' | 'other'
  text: string
}

// 詳しさ・正確さのための追加ルール。全テンプレート・チャット（REVISE）に共通で
// 適用する。「重要そうな2〜3点だけ拾って終わり」「数字を言い換えて微妙にずれる」
// 「[パソコンの音]の発言者を勝手に一人に断定する」の3つが実際の精度不満の
// 主因になりやすいため、ここで明示的に禁止する。
const ACCURACY_RULES_JA = `詳しさ・正確さのルール:
- 決定事項・やること・数字（日付/金額/数量）・固有名詞は、重要度が低そうに見えても漏らさずすべて拾うこと。要点を絞りすぎないこと
- 日付・金額・数量・固有名詞は文字起こしの表記のまま正確に書き写すこと（言い換えたり丸めたりしない）
- 話し合いの要点は、話題名だけでなく「何が問題になり、どう結論に至ったか」が分かるように書くこと
- [パソコンの音]は複数人の発言を含むことがある。発言者を一人に特定できない場合は誰かに断定せず、「相手」など曖昧さを保ったまま書くこと
- 各項目を書く前に、文字起こしの中に根拠となる発言が実際にあるか確認すること。推測や一般論で埋めないこと`

const ACCURACY_RULES_EN = `Detail and accuracy rules:
- Capture every decision, action item, number (date/amount/quantity), and proper noun, even if it seems minor. Do not over-condense
- Copy dates, amounts, quantities, and proper nouns exactly as stated in the transcript. Do not paraphrase or round them
- For key discussion points, explain what was at issue and how it was resolved, not just a topic label
- [computer audio] may contain multiple speakers. If you cannot identify who specifically said something, do not attribute it to one person by guessing — keep it appropriately vague
- Before writing each item, confirm there is an actual statement in the transcript backing it. Do not fill gaps with guesses or generic assumptions`

// 内容を「講義・説明会型（一方向の情報伝達）」か「議論・会議型（決定事項がある対話）」に
// まず自分で判定させ、適したフォーマットで出力させる（1回のAPI呼び出し内で完結・追加コストなし）。
const SUMMARY_PROMPT_JA = `あなたは議事録・ノート作成アシスタントです。
以下の会話の文字起こしを読み、まず内容が次のどちらに近いか判定してください。
- A: 講義・説明会型（先生・講師・説明者が一方的に話す。質疑応答も含む）
- B: 議論・会議型（複数人が対話し、決定事項やタスクが生まれる）

判定した種類に応じて、次のどちらかの形式で出力してください。

Aの場合:
【概要】
（1〜2文でこの回の要点）

【重要ポイント】
・（内容の要点をひとつずつ）

【復習・確認しておくこと】
（聞き手が持ち帰って確認・復習すべきこと。なければ「特になし」）

Bの場合:
【概要】
（1〜2文で会議全体の要点）

【決定事項】
・（決まったことをひとつずつ。なければ「特になし」）

【やること】
・担当者名　やること（期限）
（担当や期限が分からない場合はその部分を書かない。何も無ければ「特になし」）

【話し合いの要点】
・（重要な論点をひとつずつ）

書き方のルール:
- Markdownは使わないこと。「#」「##」「**」「*」「-」は一切使わない
- 見出しは必ず【】で囲む。箇条書きの行頭は必ず「・」を使う
- 箇条書きを入れ子にしないこと。「・」は1階層だけで、行頭に空白やインデントを入れない
- 項目をまとめたいときは、まとめ名だけの行（「・」を付けない短い1行）を置き、その下に「・」の行を続ける
- 担当者ごとに分けたいときは入れ子にせず、1行に収める（例:「・石渡さん　研究構想を深める（8/15まで）」）
- 強調のために記号を足さないこと。大事なことは前に書き、短く言い切る
- メールやチャットにそのまま貼れる、記号の少ないテキストにすること

${ACCURACY_RULES_JA}

注意:
- 文字起こしに無い情報を創作しないこと
- 話者は [マイク] / [パソコンの音] で示されています
- A/Bの判定結果や説明は出力せず、選んだ形式の本文だけを出力すること
- 出力言語: {LANG}`

const SUMMARY_PROMPT_EN = `You are a meeting/lecture notes assistant.
Read the transcript below and first decide which it is closer to:
- A: Lecture/briefing (one person mainly speaks; may include Q&A)
- B: Discussion/meeting (multiple people converse; decisions/tasks emerge)

Then output using the matching format only:

If A:
[Summary]
(1-2 sentences of the gist)

[Key points]
・(one important point per line)

[Things to review/follow up]
(what the listener should review or confirm; "None" if none)

If B:
[Summary]
(1-2 sentences of the overall gist)

[Decisions]
・(one decision per line; "None" if there are none)

[Action items]
・Owner name　what to do (due date)
(omit owner or due date if unknown; "None" if there are none)

[Key discussion points]
・(one point per line)

Formatting rules:
- Do not use Markdown. Never use "#", "##", "**", "*", or "-"
- Wrap headings in square brackets. Start every list line with "・"
- Never nest lists. Use a single level of "・" and never indent a line
- To group items, put a short label line with no "・", then the "・" lines under it
- To split by owner, keep it on one line instead of nesting (e.g. "・Ishiwata　Deepen the research plan (by Aug 15)")
- Do not add symbols for emphasis. Put what matters first and state it plainly
- The result must paste cleanly into email and chat as plain text

${ACCURACY_RULES_EN}

Notes:
- Do not invent information not in the transcript
- Speakers are marked [mic] / [computer audio]
- Do not output which format (A/B) you chose or any explanation — output only the chosen format's body
- Write the output in English`

type SummaryTemplate = 'auto' | 'meeting' | 'lecture' | 'oneOnOne' | 'interview'

// 各テンプレート共通の書き方ルール。Markdown記法はアプリ側で描画しておらず
// 記号がそのまま画面に出てしまうため、日本語の議事録として自然な
// 【見出し】＋「・」の形に統一する。コピーしてメール等へ貼る用途にも合う。
const PLAIN_STYLE_RULES_JA = `書き方のルール:
- Markdownは使わないこと。「#」「##」「**」「*」「-」は一切使わない
- 見出しは必ず【】で囲む。箇条書きの行頭は必ず「・」を使う
- 箇条書きを入れ子にしないこと。「・」は1階層だけで、行頭に空白やインデントを入れない
- 項目をまとめたいときは、まとめ名だけの行（「・」を付けない短い1行）を置き、その下に「・」の行を続ける
- 担当者ごとに分けたいときは入れ子にせず、1行に収める（例:「・石渡さん　研究構想を深める（8/15まで）」）
- 強調のために記号を足さないこと。大事なことは前に書き、短く言い切る
- メールやチャットにそのまま貼れる、記号の少ないテキストにすること`

const MEETING_PROMPT_JA = `あなたは議事録作成アシスタントです。以下の会議の文字起こしを読み、次の形式で出力してください。
【概要】
（1〜2文で会議全体の要点）
【決定事項】
・（決まったことをひとつずつ。なければ「特になし」）
【やること】
・担当者名　やること（期限）
（担当や期限が分からない場合はその部分を書かない。何も無ければ「特になし」）
【話し合いの要点】
・（重要な論点をひとつずつ）
${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
注意:
- 文字起こしに無い情報を創作しないこと
- 話者は [マイク] / [パソコンの音] で示されています
- 出力言語: {LANG}`

const LECTURE_PROMPT_JA = `あなたはノート作成アシスタントです。以下の講義・説明会の文字起こしを読み、次の形式で出力してください。
【概要】
（1〜2文でこの回の要点）
【重要ポイント】
・（内容の要点をひとつずつ）
【復習・確認しておくこと】
・（聞き手が持ち帰って確認・復習すべきこと。なければ「特になし」）
${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
注意:
- 文字起こしに無い情報を創作しないこと
- 話者は [マイク] / [パソコンの音] で示されています
- 出力言語: {LANG}`

const ONE_ON_ONE_PROMPT_JA = `あなたは1on1ミーティングのメモ作成アシスタントです。以下の会話の文字起こしを読み、次の形式で出力してください。
【概要】
（1〜2文で今回の1on1の要点）
【共有されたこと】
・（近況や進捗など共有された内容をひとつずつ）
【課題・気になっていること】
・（本人が挙げた悩みや課題。なければ「特になし」）
【次のアクション】
・担当者名　やること（期限）
（担当や期限が分からない場合はその部分を書かない。何も無ければ「特になし」）
【フィードバック・気づき】
・（伝えられたフィードバックや気づき。なければ「特になし」）
${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
注意:
- 文字起こしに無い情報を創作しないこと
- 話者は [マイク] / [パソコンの音] で示されています
- 出力言語: {LANG}`

const INTERVIEW_PROMPT_JA = `あなたは面接メモ作成アシスタントです。以下の面接の文字起こしを読み、次の形式で出力してください。
【概要】
（対象者・ポジションなど分かる範囲で1〜2文）
【経歴・スキルの要点】
・（語られた経歴・経験・スキルをひとつずつ）
【質疑応答のポイント】
・（やり取りの中で重要だった質問と回答）
【懸念点・確認したいこと】
・（気になった点や追加で確認すべきこと。なければ「特になし」）
【総合所感】
（面接官の視点でのメモ。決めつけず事実ベースで簡潔に）
${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
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
（書き直した議事録の本文全体。見出し構成（【項目】）はできるだけ維持し、
ユーザーの依頼に沿って内容を調整する。文字起こしに無い情報は創作しない）

ANSWERの場合:
ANSWER
---
（ユーザーへの回答。文字起こし・議事録に基づいて答え、分からない場合は
「文字起こしからは分かりません」のように正直に答える）

書き方のルール（REVISE・ANSWERの両方に適用）:
- Markdownは使わないこと。「#」「##」「**」「*」「-」は一切使わない
- 見出しが必要なときだけ【】で囲む。箇条書きの行頭は必ず「・」を使う
- 短い質問には、見出しも箇条書きも付けずに普通の文章で答えること
- 強調のために記号を足さないこと。大事なことは前に書き、短く言い切る
- メールやチャットにそのまま貼れる、記号の少ないテキストにすること

REVISEで書き直すときは、次のルールも適用する:
${ACCURACY_RULES_JA}

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
(the full rewritten notes body. Keep the same heading structure ([sections]) as much as
possible, adjusting the content per the user's request. Do not invent information not in the transcript)

If ANSWER:
ANSWER
---
(an answer to the user, grounded in the transcript/notes. If you don't know, say so honestly,
e.g. "The transcript doesn't show that.")

Formatting rules (apply to both REVISE and ANSWER):
- Do not use Markdown. Never use "#", "##", "**", "*", or "-"
- Wrap headings in square brackets only when a heading is needed. Start every list line with "・"
- Never nest lists. Use a single level of "・" and never indent a line
- To group items, put a short label line with no "・", then the "・" lines under it
- For a short question, answer in plain sentences with no headings or lists at all
- Do not add symbols for emphasis. Put what matters first and state it plainly
- The result must paste cleanly into email and chat as plain text

When rewriting for REVISE, also apply these rules:
${ACCURACY_RULES_EN}`

const TITLE_OUTPUT_JA = `

出力の先頭に、会話全体を表すタイトルを次の形式で必ず付けてください。
TITLE: （15〜25文字程度の具体的なタイトル）
---
（この下に指定された形式の本文）

タイトルは冒頭の最初の話題だけで決めず、会話の後半まで見て、最終的に決まったこと・最も長く議論した中心テーマを優先してください。「〜の」「〜について」など助詞で終わる未完成な表現は禁止です。`

const TITLE_OUTPUT_EN = `

Start the output with a concise, specific title for the entire conversation in this exact format:
TITLE: (a 5-10 word title)
---
(the requested body below, in the specified format)

Do not choose a title from only the opening topic. Prefer the final decision or the central topic discussed across the conversation.`

/**
 * プロンプトで禁止していてもモデルがMarkdown記法を出すことがあるため、
 * 返す直前に保険として素のテキストへ均す。アプリ側はMarkdownを描画して
 * おらず記号がそのまま画面に出てしまうため、ここで確実に落とす。
 * コードブロック内は変換対象にしない（本文にコードが含まれる場合を壊さない）。
 */
function toPlainJapaneseNotes(input: string): string {
  const lines = input.split('\n')
  let inFence = false
  const out = lines.map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      return line
    }
    if (inFence) return line

    let s = line

    // 見出し: 「## 決定事項」→「【決定事項】」（既に【】ならそのまま）
    const heading = s.match(/^\s*#{1,6}\s+(.*?)\s*$/)
    if (heading) {
      const body = heading[1].replace(/\*\*/g, '').replace(/^【|】$/g, '').trim()
      return body ? `【${body}】` : ''
    }

    // 箇条書き: 行頭の «-» «*» «+» «・» を「・」へ揃える。インデントは
    // いったん字下げ量として保持し、後段で平らにする。
    s = s.replace(/^(\s*)[-*+]\s+/, '$1・')

    // 強調記号を除去（**太字** / __太字__ / *斜体*）
    s = s.replace(/\*\*(.+?)\*\*/g, '$1')
    s = s.replace(/__(.+?)__/g, '$1')
    s = s.replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, '$1$2')

    return s
  })
  return flattenNestedBullets(out).join('\n').trim()
}

/**
 * 入れ子の箇条書きを1階層へ均す。長い日本語の行は入れ子にすると折り返しが
 * 崩れて非常に読みにくくなるため、字下げは全て取り除く。ただし単純に
 * 平らにすると親（「・石渡さん」など）が子と同列になり分類が消えるので、
 * 子を持つ親は「・」を外して「まとめ名だけの行」に変える。
 */
function flattenNestedBullets(lines: string[]): string[] {
  const indentOf = (l: string): number => (l.match(/^[\s　]*/)?.[0].length ?? 0)
  const isBullet = (l: string): boolean => /^[\s　]*・/.test(l)

  const out: string[] = []
  lines.forEach((line, i) => {
    if (!isBullet(line)) {
      out.push(line)
      return
    }
    const myIndent = indentOf(line)

    // 直後に続く、より深い字下げの箇条書き＝この行は子を持つ親
    let hasDeeperChild = false
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j]
      if (next.trim() === '') continue
      if (!isBullet(next)) break
      if (indentOf(next) > myIndent) hasDeeperChild = true
      break
    }

    const body = line.replace(/^[\s　]*・[\s　]*/, '')
    if (hasDeeperChild) {
      // まとめ名の行。直前が箇条書きだと詰まって見えるので1行空ける。
      // ただし【見出し】の直後は空けない（見出しとまとめ名が離れて見える）
      const prev = out[out.length - 1]
      const prevIsHeading = prev !== undefined && /^【.*】$/.test(prev.trim())
      if (prev !== undefined && prev.trim() !== '' && !prevIsHeading) out.push('')
      out.push(body)
    } else {
      out.push(`・${body}`)
    }
  })
  return out
}

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
    licenseInstanceId?: string
    deviceId?: string
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
    !(
      (typeof body.licenseKey === 'string' && body.licenseKey.trim().length > 0 && body.licenseKey.length <= 256) ||
      isValidAnonymousDeviceId(body.deviceId)
    ) ||
    !Array.isArray(body.segments) ||
    (body.lang !== undefined && !['ja', 'en', 'auto'].includes(body.lang)) ||
    (body.template !== undefined &&
      !['auto', 'meeting', 'lecture', 'oneOnOne', 'interview'].includes(body.template)) ||
    (body.instruction !== undefined && typeof body.instruction !== 'string') ||
    (body.previousSummary !== undefined && typeof body.previousSummary !== 'string')
    || (body.licenseInstanceId !== undefined && (typeof body.licenseInstanceId !== 'string' || body.licenseInstanceId.length > 100))
  ) {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
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

  const anonymous = !body.licenseKey && isValidAnonymousDeviceId(body.deviceId)
  const mobilePaid = anonymous
    ? (await isPaidMobileAccount(req, body.deviceId!)) || (await isPaidMobileDevice(body.deviceId!))
    : false
  if (
    (body.licenseKey && !allowLicenseRequest(body.licenseKey)) ||
    (anonymous && mobilePaid && !allowMobilePaidRequest(body.deviceId!)) ||
    (anonymous && !mobilePaid && !allowAnonymousRequest(body.deviceId!))
  ) {
    return NextResponse.json({ error: 'AI機能の利用回数が上限に達しました。時間をおいてお試しください。' }, { status: 429 })
  }
  const paid = (body.licenseKey
    ? body.licenseInstanceId
      ? await isPaidPortableInstance(body.licenseKey, body.licenseInstanceId)
      : await isPaidLicense(body.licenseKey)
    : false) || mobilePaid

  if (!paid && !anonymous) {
    return NextResponse.json({ error: 'AI機能の認証に失敗しました' }, { status: 403 })
  }

  const langLabel =
    body.lang === 'en' ? 'English' : body.lang === 'auto' ? '文字起こしと同じ言語' : '日本語'
  const isChat = Boolean(body.instruction && body.previousSummary)

  // 指示文（書式・正確さのルール）はsystemInstructionへ切り出し、userのcontentsには
  // データ（文字起こし・現在の議事録・ユーザーの依頼）だけを渡す。長いuser発話の中に
  // 指示を埋め込むより、モデルが指示に従いやすくなる。
  let systemInstructionText: string
  let userContent: string
  if (isChat) {
    systemInstructionText =
      body.lang === 'en' ? CHAT_PROMPT_EN : CHAT_PROMPT_JA.replace('{LANG}', langLabel)
    userContent = `---文字起こし---\n${formatTranscript(segments)}\n\n---現在の議事録---\n${body.previousSummary}\n\n---ユーザーのメッセージ---\n${body.instruction}`
  } else {
    const template = body.template ?? 'auto'
    const prompt =
      template === 'auto'
        ? body.lang === 'en'
          ? SUMMARY_PROMPT_EN
          : SUMMARY_PROMPT_JA.replace('{LANG}', langLabel)
        : TEMPLATE_PROMPTS_JA[template].replace('{LANG}', langLabel)
    const titleInstruction = body.lang === 'en' ? TITLE_OUTPUT_EN : TITLE_OUTPUT_JA
    systemInstructionText = `${prompt}${titleInstruction}`
    userContent = `---文字起こし---\n${formatTranscript(segments)}`
  }

  try {
    const res = await fetchWithRetry(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstructionText }] },
          contents: [{ role: 'user', parts: [{ text: userContent }] }],
          generationConfig: {
            // 議事録は創作ではなく抽出タスクのため、温度を低く固定してハルシネーション
            // （文字起こしに無い内容を書いてしまうこと）を抑える。0にはせず少しだけ
            // 余地を残し、不自然に硬い言い回しの繰り返しを避ける。
            temperature: 0.2,
            // 2.5 Flashの動的thinkingは長い会話で待ち時間が大きく振れるため上限を固定する。
            // 要約・質問に必要な推論余地は残しつつ、数万thinking tokenへ膨らむのを防ぐ。
            thinkingConfig: { thinkingBudget: 1024 },
            // 以前は初回生成だけ4096で、長い会議だと本文が途中で切れるリスクがあった。
            // チャット（書き直し）と同じ余裕を持たせて揃える。
            maxOutputTokens: 16384
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
      const content = toPlainJapaneseNotes((match?.[2] ?? text).trim())
      return NextResponse.json({ type, content })
    }
    const match = text.match(/^TITLE[:：]\s*(.+?)\s*\n-{3,}\s*\n([\s\S]+)$/i)
    const generatedTitle = match?.[1]?.trim() ?? ''
    const summary = toPlainJapaneseNotes((match?.[2] ?? text).trim())
    return NextResponse.json({
      summary,
      title: validGeneratedTitle(generatedTitle) ? generatedTitle : null
    })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
