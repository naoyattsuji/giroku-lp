import { NextRequest, NextResponse } from 'next/server'
import { compactTranscriptLines } from '../../lib/compactTranscript'
import {
  allowApiRequest,
  allowLicenseRequest,
  allowAnonymousRequest,
  allowMobilePaidRequest,
  isValidAnonymousDeviceId,
  isPaidLicense,
  isPaidPortableInstance,
  isPaidMobileAccount,
  isPaidMobileDevice,
  requestBodyIsTooLarge,
  validTranscriptSegments
} from '../../lib/license'
import { removePlaceholderOwners, splitChatReply, splitTitle } from '../../lib/summaryTitle'
import { generateContent, responseText } from '../../lib/gemini'
import { isPaidAppleTransaction } from '../../lib/apple-plus'
import { clientPlatform, quotaMessage, quotaUnits, takeQuota } from '../../lib/dailyLimit'
import { recordUsage } from '../../lib/usageLog'

export const runtime = 'nodejs'
export const maxDuration = 60

interface TranscriptSegment {
  speaker: 'self' | 'other'
  text: string
}

// 詳しさ・正確さのための追加ルール。全テンプレート・チャット（REVISE）に共通で
// 適用する。「重要そうな2〜3点だけ拾って終わり」「数字を言い換えて微妙にずれる」
// 「誰の発言かを推測で決めつける」の3つが実際の精度不満の主因になりやすいため、
// ここで明示的に禁止する。
//
// 以前は文字起こしに [マイク] / [パソコンの音] の印を付けて話者を区別させていたが、
// 対面の会議ではその場の全員の声が [マイク] になり、オンラインでも [パソコンの音] に
// 複数人が混ざるため、印は発言者を表していなかった。名前が分からない担当者を
// 「相手」「参加者」で埋めた議事録が実際に出ていた（担当者欄が全て「参加者」など）。
// そのため印は渡さない。
// さらに、名前が発言された場合だけ書かせていた「佐藤：見積書を送る」「田中さんが〜と述べた」も、
// 文字起こしの人名は聞き間違いが多く、議事録に誤った名前が残るため、人名自体を書かせないことにした
// （辻直哉の判断。「誰々が、という書き方は名前が間違うことが多いから無くしたい」）。
const ACCURACY_RULES_JA = `詳しさ・正確さのルール:
- 決定事項・やること・数字（日付/金額/数量）・固有名詞（会社名・製品名・地名など）は、重要度が低そうに見えても漏らさずすべて拾うこと。要点を絞りすぎないこと
- 日付・金額・数量・固有名詞は文字起こしの表記のまま正確に書き写すこと（言い換えたり丸めたりしない）
- 話し合いの要点は、話題名だけでなく「何が問題になり、どう結論に至ったか」が分かるように書くこと
- 人の名前は一切書かないこと。誰が言ったか・誰がやるかは書かず、内容だけを書く（例:「佐藤さんが予算増を提案」「参加者から予算増の提案」ではなく「予算増の提案があった」）。文字起こしの人名は聞き間違いが多いため。「自分」「相手」「参加者」「話者」「担当者」などの言葉で人を置き換えることもしない
- 各項目を書く前に、文字起こしの中に根拠となる発言が実際にあるか確認すること。推測や一般論で埋めないこと`

// 対応事項（やること）の書き方。以前は見本を「担当者：対応内容（期限 ○月○日）」としていたため、
// 名前が分からないと「相手」「参加者」で埋めたり、「担当者：」をそのまま写したりしていた（実測）。
// 人名を書かない方針に合わせ、担当者は付けずにやることだけを書かせる。
// 「今週の金曜まで」を、安いモデル（3.1 Flash-Lite）が「10月25日」のような誤った日付に直していた（2026-11-11 実測）。
const ACTION_ITEM_RULES_JA = `対応事項の書き方:
- やることだけを書く。担当する人の名前も「担当者」「参加者」「相手」「自分」などの言葉も付けない（例: 「1. 見積書を送る」）
- 期限が発言されている場合だけ、行末に「（期限 10月3日）」「（期限 今週の金曜日）」のように付ける。発言が無ければ付けない
- 期限は発言どおりに書く。「今週の金曜」「来週中」「来週の水曜日」のような言い方を、日付（○月○日）に直さない。録音した日が分からないので、日付に直すと誤った日になる`

const ACTION_ITEM_RULES_EN = `How to write action items:
- Write only the task. Never add a person's name or words like "owner", "participant", "the other party", or "me" (e.g. "1. Send the quote")
- Add "(due Oct 3)" at the end only when a due date was stated`

const ACCURACY_RULES_EN = `Detail and accuracy rules:
- Capture every decision, action item, number (date/amount/quantity), and proper noun (company, product, place, etc.), even if it seems minor. Do not over-condense
- Copy dates, amounts, quantities, and proper nouns exactly as stated in the transcript. Do not paraphrase or round them
- For key discussion points, explain what was at issue and how it was resolved, not just a topic label
- Never write people's names. Do not say who said something or who will do something; write only the content (e.g. "A budget increase was proposed", not "Sato proposed a budget increase" or "A participant proposed a budget increase"). Names in transcripts are often misheard. Never substitute words like "me", "the other party", "participant", "speaker", or "owner" for a person either
- Before writing each item, confirm there is an actual statement in the transcript backing it. Do not fill gaps with guesses or generic assumptions`

// 話の中身はテーマ（話題）ごとに見出しを立てて書かせる。以前は「討議内容」「要点」の1つの見出しに
// 論点を並べていたため、複数の話題を扱った回では何の話か追いにくかった（辻直哉の要望）。
const THEME_RULES_JA = `テーマごとの書き方:
- 話の中身は、話題（テーマ）ごとに「■ テーマ名」の見出しを立てて書く。テーマ名は中身が分かる短い言葉にする（20文字以内。例:「■ 会場選び」「■ 来期の予算」）
- テーマは話された順に並べる。各テーマの中は「・」で要点を書く
- 「討議内容」「要点」「その他」のような、中身の分からないテーマ名を付けない
- 本題と関係のない雑談や挨拶はテーマにしない`

const THEME_RULES_EN = `How to write topics:
- Write the body of the discussion under one "■ Topic name" heading per topic. Make each topic name short and specific (under 6 words, e.g. "■ Choosing the venue", "■ Next year's budget")
- List topics in the order they were discussed. Under each topic, write points starting with "・"
- Never use vague topic names like "Discussion", "Key points", or "Other"
- Do not make small talk or greetings into a topic`

// 全テンプレート共通の書き方ルール。議事録は最終的にLINEやメールへ
// コピー＆ペーストして共有されるため、次の2点を最優先で守らせる。
// (1) 貼り先の端末を問わず文字化けしないこと。絵文字と機種依存文字（丸数字・
//     ローマ数字・㈱№℡など）はJIS第1・第2水準の外にあり、環境によって
//     豆腐や別の文字に化けるため全面的に禁止し、見出しは「■ 」で統一する。
// (2) 議事録として通用するフォーマルさを保ちつつ冗長にならないこと。常体に
//     固定し、一文を短く、同じ内容を繰り返さないよう明示する。
// アプリ側はMarkdownを描画しないため、記法はそのまま画面に出てしまう点も変わらない。
const PLAIN_STYLE_RULES_JA = `書き方のルール:
- Markdownは使わないこと。「#」「##」「**」「*」「-」は一切使わない
- 絵文字と機種依存文字を使わないこと（例: 絵文字全般、丸数字①②③、ローマ数字ⅠⅡⅢ、㈱№℡㎡）。貼り付け先の環境で文字化けする
- 見出しは必ず「■ 」で始める行にする。【】や記号の飾りを付けない
- 決定事項・対応事項は「1. 」「2. 」と番号を振る。それ以外の箇条書きは行頭に「・」を使う
- 箇条書きを入れ子にしないこと。行頭に空白やインデントを入れない
- 常体（である調・体言止め）で書くこと。ですます調は使わない
- 一文を短くし、同じ内容を繰り返さないこと。「〜だと思われます」「〜という話がありました」のような冗長な言い回しは避ける
- 簡潔にするために項目を省略しないこと。書式は短く、内容は網羅的にすること
- LINE・メール・チャットへそのまま貼り付けられる書式にすること`

const PLAIN_STYLE_RULES_EN = `Formatting rules:
- Do not use Markdown. Never use "#", "##", "**", "*", or "-"
- Do not use emoji or platform-dependent characters (circled numbers, Roman numerals, etc.). They break when pasted elsewhere
- Start every heading line with "■ ". Do not wrap headings in brackets or add decorative symbols
- Number decisions and action items as "1. ", "2. ". Start any other list line with "・"
- Never nest lists. Never indent a line
- Keep sentences short and do not repeat the same content. Avoid padding like "it seems that" or "there was a discussion about"
- Being concise must not mean dropping items. Keep the formatting terse and the content complete
- The result must paste cleanly into chat, email, and messaging apps`

// 内容を「講義・説明会型（一方向の情報伝達）」か「議論・会議型（決定事項がある対話）」に
// まず自分で判定させ、適したフォーマットで出力させる（1回のAPI呼び出し内で完結・追加コストなし）。
// 判定基準があいまいだと、報告にフィードバックをもらって次の作業が決まるような回で、作るたびに
// 形式が入れ替わった（同じ録音で会議型と講義型が交互に出た。実測）。決定事項や作業が1つでも
// あれば会議型とし、迷ったら会議型に倒す。
const SUMMARY_PROMPT_JA = `あなたは議事録・ノート作成アシスタントです。
以下の会話の文字起こしを読み、まず内容が次のどちらに近いか判定してください。
- A: 講義・説明会型（先生・講師・説明者が一方的に説明し続け、その場で決まったことも、誰かがやることになった作業も無い。質疑応答は含んでよい）
- B: 議論・会議型（複数人が対話している。または、決まったことや誰かがやることになった作業が1つでもある）
迷った場合はBを選ぶこと。

判定した種類に応じて、次のどちらかの形式で出力してください。

Aの場合:
■ 概要
（1〜2文でこの回の要点）

■ （テーマ名）
・（このテーマで話された内容。何が問題になり、どう結論に至ったか）
（話題の数だけ、テーマごとに見出しを立てて繰り返す）

■ 確認事項
・（聞き手が持ち帰って確認・復習すべきこと。なければ「特になし」）

Bの場合:
■ 概要
（1〜2文で会議全体の要点）

■ 決定事項
1. （決まったことをひとつずつ。なければ「特になし」）

■ 対応事項
1. （やることをひとつずつ。書き方は下の「対応事項の書き方」に従う。何も無ければ「特になし」）

■ （テーマ名）
・（このテーマで話された内容。何が問題になり、どう結論に至ったか）
（話題の数だけ、テーマごとに見出しを立てて繰り返す）

${THEME_RULES_JA}

${PLAIN_STYLE_RULES_JA}

${ACCURACY_RULES_JA}

${ACTION_ITEM_RULES_JA}

注意:
- 文字起こしに無い情報を創作しないこと
- A/Bの判定結果や説明は出力せず、選んだ形式の本文だけを出力すること
- 出力言語: {LANG}`

const SUMMARY_PROMPT_EN = `You are a meeting/lecture notes assistant.
Read the transcript below and first decide which it is closer to:
- A: Lecture/briefing (one person keeps explaining, and nothing is decided and no one takes on a task; may include Q&A)
- B: Discussion/meeting (multiple people converse, or at least one decision or task for someone emerges)
If unsure, choose B.

Then output using the matching format only:

If A:
■ Summary
(1-2 sentences of the gist)

■ (topic name)
・(what was discussed on this topic: what was at issue and how it was resolved)
(repeat with one heading per topic)

■ Follow-up
・(what the listener should review or confirm; "None" if none)

If B:
■ Summary
(1-2 sentences of the overall gist)

■ Decisions
1. (one decision per line; "None" if there are none)

■ Action items
1. (one task per line, written as described in "How to write action items" below; "None" if there are none)

■ (topic name)
・(what was discussed on this topic: what was at issue and how it was resolved)
(repeat with one heading per topic)

${THEME_RULES_EN}

${PLAIN_STYLE_RULES_EN}

${ACCURACY_RULES_EN}

${ACTION_ITEM_RULES_EN}

Notes:
- Do not invent information not in the transcript
- Do not output which format (A/B) you chose or any explanation — output only the chosen format's body
- Write the output in English`

type SummaryTemplate = 'auto' | 'meeting' | 'lecture' | 'oneOnOne' | 'interview'

const MEETING_PROMPT_JA = `あなたは議事録作成アシスタントです。以下の会議の文字起こしを読み、次の形式で出力してください。

■ 概要
（1〜2文で会議全体の要点）

■ 決定事項
1. （決まったことをひとつずつ。なければ「特になし」）

■ 対応事項
1. （やることをひとつずつ。書き方は下の「対応事項の書き方」に従う。何も無ければ「特になし」）

■ （テーマ名）
・（このテーマで話された内容。何が問題になり、どう結論に至ったか）
（話題の数だけ、テーマごとに見出しを立てて繰り返す）

${THEME_RULES_JA}
${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
${ACTION_ITEM_RULES_JA}
注意:
- 文字起こしに無い情報を創作しないこと
- 出力言語: {LANG}`

const LECTURE_PROMPT_JA = `あなたはノート作成アシスタントです。以下の講義・説明会の文字起こしを読み、次の形式で出力してください。

■ 概要
（1〜2文でこの回の要点）

■ （テーマ名）
・（このテーマで話された内容。何が問題になり、どう結論に至ったか）
（話題の数だけ、テーマごとに見出しを立てて繰り返す）

■ 確認事項
・（聞き手が持ち帰って確認・復習すべきこと。なければ「特になし」）

${THEME_RULES_JA}
${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
注意:
- 文字起こしに無い情報を創作しないこと
- 出力言語: {LANG}`

const ONE_ON_ONE_PROMPT_JA = `あなたは1on1ミーティングのメモ作成アシスタントです。以下の会話の文字起こしを読み、次の形式で出力してください。

■ 概要
（1〜2文で今回の1on1の要点）

■ 共有事項
・（近況や進捗など共有された内容をひとつずつ）

■ 課題
・（本人が挙げた悩みや課題。なければ「特になし」）

■ 対応事項
1. （やることをひとつずつ。書き方は下の「対応事項の書き方」に従う。何も無ければ「特になし」）

■ フィードバック
・（伝えられたフィードバックや気づき。なければ「特になし」）

${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
${ACTION_ITEM_RULES_JA}
注意:
- 文字起こしに無い情報を創作しないこと
- 出力言語: {LANG}`

const INTERVIEW_PROMPT_JA = `あなたは面接メモ作成アシスタントです。以下の面接の文字起こしを読み、次の形式で出力してください。

■ 概要
（対象者・ポジションなど分かる範囲で1〜2文）

■ 経歴・スキル
・（語られた経歴・経験・スキルをひとつずつ）

■ 質疑応答
・（やり取りの中で重要だった質問と回答）

■ 確認事項
・（気になった点や追加で確認すべきこと。なければ「特になし」）

■ 所感
（面接官の視点でのメモ。決めつけず事実ベースで簡潔に）

${PLAIN_STYLE_RULES_JA}
${ACCURACY_RULES_JA}
注意:
- 文字起こしに無い情報を創作しないこと。評価や合否の断定はしないこと
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
- 内容についての質問・コメント（例:「何時に終わった？」「予算はいくらと言っていた？」）→ ANSWER

判定結果に応じて、次の形式で出力してください（1行目はREVISEかANSWERのどちらか、2行目は---のみ）。

REVISEの場合:
REVISE
---
（書き直した議事録の本文全体。「■ 」で始まる見出し構成はできるだけ維持し、
ユーザーの依頼に沿って内容を調整する。文字起こしに無い情報は創作しない）

ANSWERの場合:
ANSWER
---
（ユーザーへの回答。文字起こし・議事録に基づいて答え、分からない場合は
「文字起こしからは分かりません」のように正直に答える）

REVISE・ANSWERの両方に適用するルール:
- Markdownは使わないこと。「#」「##」「**」「*」「-」は一切使わない
- 絵文字と機種依存文字を使わないこと（例: 絵文字全般、丸数字①②③、ローマ数字ⅠⅡⅢ、㈱№℡㎡）。貼り付け先の環境で文字化けする
- 強調のために記号を足さないこと。大事なことは前に書き、短く言い切る

会話の続きについて:
- これまでのやりとり（ユーザーの質問とあなたの答え）が渡されたときは、それを踏まえて答える。「それ」「さっきの」「もっと詳しく」「なぜ？」などは、直前の質問と答えを指す
- 前の答えと食い違うことを言わない。前の答えが間違っていたと分かったら、そう言ってから正す
- 前の答えをそのままくり返さない。深掘りの質問には、前の答えより一段詳しく、文字起こしの具体的な発言をもとに答える

答え方の指定について（いちばん優先する）:
- ユーザーが答え方を指定したら（例: 箇条書きで、番号を付けて、3つに、一言で、100文字以内で、表で、時系列で、です・ますなしで）、必ずその通りにする。この下の決まりより優先する
- 箇条書きは行頭に「・」、番号は「1.」「2.」を使う（Markdownの記号の代わり）
- 表を頼まれたら、1行に1件ずつ「項目：内容」の形で並べる（「項目：内容」という見出しの行は付けない）
- 数や文字数の指定（3つ、100文字以内など）は必ず守る
- 一度指定された答え方は、ユーザーが変えるまで次の答えでも続ける

ANSWERのときだけ適用するルール:
- 答え方の指定がなく、短い質問のときは、見出しも箇条書きも付けずに普通の文章で答えること
- 質問が人の名前（誰が・担当は誰か など）を聞いているときは、文字起こしに出てくる名前で答える（担当者の名前を付けない決まりは、議事録の本文を書き直すときだけ）
- 回答は議事録本文と違い、ですます調で構わない

REVISEで書き直すときは、次のルールも適用する:
${PLAIN_STYLE_RULES_JA}

${ACCURACY_RULES_JA}

${ACTION_ITEM_RULES_JA}

出力言語: {LANG}`

const CHAT_PROMPT_EN = `You are a meeting notes editing and Q&A assistant.
Below is a transcript, the meeting notes generated from it, and a message from the user.

First decide the user's intent:
- A request to rewrite/revise the notes (e.g. "make it more detailed", "shorter please", "add more action items") → REVISE
- A question or comment about the content (e.g. "when did it end?", "what budget was mentioned?") → ANSWER

Output in this exact format (line 1 is REVISE or ANSWER, line 2 is just ---):

If REVISE:
REVISE
---
(the full rewritten notes body. Keep the same "■ " heading structure as much as
possible, adjusting the content per the user's request. Do not invent information not in the transcript)

If ANSWER:
ANSWER
---
(an answer to the user, grounded in the transcript/notes. If you don't know, say so honestly,
e.g. "The transcript doesn't show that.")

Rules for both REVISE and ANSWER:
- Do not use Markdown. Never use "#", "##", "**", "*", or "-"
- Do not use emoji or platform-dependent characters. They break when pasted elsewhere
- Do not add symbols for emphasis. Put what matters first and state it plainly

About the ongoing conversation:
- When earlier turns (the user's questions and your answers) are given, answer with them in mind. "That", "the one before", "more detail", "why?" refer to the previous question and answer
- Do not contradict your earlier answers. If an earlier answer was wrong, say so and correct it
- Do not repeat the previous answer. For follow-up questions, go one level deeper using specific statements from the transcript

About the requested answer format (highest priority):
- If the user specifies a format (e.g. bullet points, numbered, three items, one word, within 100 characters, a table, chronological), always follow it. This overrides the rules below
- Use "・" for bullets and "1." "2." for numbering (instead of Markdown symbols)
- For a table, put one item per line as "Item: content" (no header row)
- Always respect counts and length limits
- Keep using a requested format in later answers until the user changes it

Rules for ANSWER only:
- If no format is requested and the question is short, answer in plain sentences with no headings or lists at all
- If the question asks for a person (who, who is in charge), answer with the name as it appears in the transcript (the no-names rule applies only when rewriting the notes)

When rewriting for REVISE, also apply these rules:
${PLAIN_STYLE_RULES_EN}

${ACCURACY_RULES_EN}

${ACTION_ITEM_RULES_EN}`

const TITLE_OUTPUT_JA = `

出力の先頭に、会話全体を表すタイトルを次の形式で必ず付けてください。
TITLE: （15〜25文字程度の具体的なタイトル）
---
（この下に指定された形式の本文）

タイトルは冒頭の最初の話題だけで決めず、会話の後半まで見て、最終的に決まったこと・最も長く議論した中心テーマを優先してください。「〜の」「〜について」など助詞で終わる未完成な表現は禁止です。人の名前はタイトルにも入れないでください。`

const TITLE_OUTPUT_EN = `

Start the output with a concise, specific title for the entire conversation in this exact format:
TITLE: (a 5-10 word title)
---
(the requested body below, in the specified format)

Do not choose a title from only the opening topic. Prefer the final decision or the central topic discussed across the conversation. Do not put people's names in the title.`

/** 見出しとして扱ってよい文字数の上限。実際の見出しは「経歴・スキル」程度が最長。
 *  これを超える行は、たとえ見出し記号で始まっていても本文とみなす（対応事項を
 *  チェックボックス付きで書いた「☐ 〇〇を修正する」を見出しへ誤変換しない）。 */
const MAX_HEADING_LENGTH = 24

/** 見出しの飾りとしてモデルが使いがちな記号。多くは機種依存で貼り先が文字化けするため、
 *  「■ 」か「・」へ均して必ず取り除く。⚠などは異体字セレクタを伴うことがある。 */
const DECORATIVE_MARK = /^[\s　]*(?:[▶▷►◆◇●○□☐✅💬💡📋📌🔷]|[⚠❗❓]️?)[\s　]*(.+?)[\s　]*$/

/**
 * プロンプトで禁止していてもモデルがMarkdown記法や絵文字の見出しを出すことが
 * あるため、返す直前に保険として素のテキストへ均す。議事録はLINEやメールへ
 * コピーして共有されるので、機種依存の絵文字が残ると貼り先で文字化けする。
 * アプリ側もMarkdownを描画しておらず記号がそのまま画面に出るため、
 * 見出しは「■ 」に統一し、Markdownの装飾記号は落とす。
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

    // 見出し: 「## 決定事項」→「■ 決定事項」
    const heading = s.match(/^\s*#{1,6}\s+(.*?)\s*$/)
    if (heading) {
      const body = heading[1].replace(/\*\*/g, '').replace(/^【|】$/g, '').trim()
      return body ? `■ ${body}` : ''
    }

    // 見出し: 「【決定事項】」→「■ 決定事項」（旧フォーマットの名残）
    const bracketed = s.match(/^[\s　]*【(.+?)】[\s　]*$/)
    if (bracketed) return `■ ${bracketed[1].trim()}`

    // 「■決定事項」→「■ 決定事項」。■は自前の見出し記号なので長さを問わず見出しのまま扱う
    const ownHeading = s.match(/^[\s　]*■[\s　]*(.+?)[\s　]*$/)
    if (ownHeading) return `■ ${ownHeading[1]}`

    // 「✅ 決定事項」など飾り記号付きの行。見出しらしい短さなら見出しへ、
    // 長ければ本文（チェックボックス付きの対応事項など）とみなし箇条書きへ均す。
    // どちらに転んでも機種依存の記号は残さない
    const decorated = s.match(DECORATIVE_MARK)
    if (decorated) {
      const text = decorated[1]
      return text.length <= MAX_HEADING_LENGTH ? `■ ${text}` : `・${text}`
    }

    // 箇条書き: 行頭の «-» «*» «+» «・» を「・」へ揃える。インデントは
    // いったん字下げ量として保持し、後段で平らにする。
    s = s.replace(/^(\s*)[-*+]\s+/, '$1・')
    // 番号付きの行: 「1.  見積書」のように空白が重なることがあるため1つに揃える
    s = s.replace(/^(\s*\d+\.)[ \t　]{2,}/, '$1 ')
    // 「1. 特になし」は番号を付けない（該当なしの行に番号が付くと項目が1件あるように見える）
    if (/^\s*\d+\.\s*特になし。?\s*$/.test(s)) return '特になし'

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
      // ただし見出しの直後は空けない（見出しとまとめ名が離れて見える）
      const prev = out[out.length - 1]
      const prevIsHeading = prev !== undefined && /^■\s/.test(prev.trim())
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

// 話者の印（[マイク] / [パソコンの音]）は付けない。印が発言者を表しておらず、
// AIが担当者を「相手」「参加者」で埋める原因になっていたため（冒頭のコメント参照）。
// 言いよどみ・相づちだけの行・重なった行を除いてから送る（入力トークン＝原価を減らす。lib/compactTranscript.ts）
function formatTranscript(segments: TranscriptSegment[]): string {
  return compactTranscriptLines(segments.map((s) => s.text)).join('\n')
}

/**
 * これまでの質問と答えを、AI に渡す会話の形にそろえる（2026-11-11）。
 * 前は毎回「今回の質問」だけを渡していて、深掘りの質問（「それはなぜ？」など）で話が通じなかった。
 * 古い順に、ユーザー→AI の組だけを残す。長すぎる会話は直近の5往復まで、1つの発言は1,500文字まで
 * （書き直しの答えは議事録の全文なので長い。中身は「現在の議事録」に入っているので短く切ってよい）。
 */
function chatHistory(raw: unknown): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(raw)) return []
  const turns: Array<{ role: 'user' | 'model'; text: string }> = []
  for (const item of raw.slice(-40)) {
    if (!item || typeof item !== 'object') continue
    const { role, text } = item as { role?: unknown; text?: unknown }
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string' || !text.trim()) continue
    const r = role === 'user' ? 'user' : 'model'
    const t = text.trim().slice(0, 1500)
    const last = turns[turns.length - 1]
    if (last && last.role === r) last.text = t // 同じ側が続いたら新しい方だけ残す
    else turns.push({ role: r, text: t })
  }
  while (turns.length && turns[0].role !== 'user') turns.shift()
  if (turns.length && turns[turns.length - 1].role !== 'model') turns.pop()
  return turns.slice(-10).map((t) => ({ role: t.role, parts: [{ text: t.text }] }))
}

/** 議事録だけで答えられないときの答え（このときは文字起こしの全文で答え直す） */
const NOT_IN_MINUTES = /分かりません|わかりません|書かれていません|記載がありません|記載はありません|含まれていません|触れられていません|言及されていません|don't know|doesn't (?:show|mention|say)|not (?:mentioned|in the)/i

/** 議事録を、文字起こしの形（1行ずつの発言）にする。議事録だけで答えさせるときに使う */
function minutesAsSegments(minutes: string): TranscriptSegment[] {
  return minutes.split('\n').map((line) => line.trim()).filter(Boolean).map((text) => ({ speaker: 'self' as const, text }))
}

function isChatRequest(body: { instruction?: string; previousSummary?: string }): boolean {
  return Boolean(body.instruction && body.previousSummary)
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
    /** iPhone のアプリ内課金の Pro の署名つき購入記録（StoreKit 2 の JWS） */
    appleSignedTransaction?: string
    segments?: TranscriptSegment[]
    lang?: 'ja' | 'en' | 'auto'
    template?: SummaryTemplate
    instruction?: string
    previousSummary?: string
    /** これまでの質問と答え（古い順。2026-11-11 から。無ければ1問だけの質問として扱う） */
    history?: unknown
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
  // iPhone のアプリ内課金の Pro（署名つきの購入記録を Apple の証明書で確かめる）
  const mobilePaid = anonymous
    ? (await isPaidAppleTransaction(body.appleSignedTransaction)) ||
      (await isPaidMobileAccount(req, body.deviceId!)) ||
      (await isPaidMobileDevice(body.deviceId!))
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

  // 回数の上限（月・1日。議事録は会議の長さで数える。app/lib/dailyLimit.ts）
  const kind = isChatRequest(body) ? 'chat' : 'summary'
  const plan = paid ? 'pro' : 'free'
  const quota = await takeQuota({
    subject: body.licenseKey || body.deviceId!,
    plan,
    platform: clientPlatform(req.headers.get('user-agent')),
    kind,
    units: quotaUnits(kind, segments.reduce((sum, s) => sum + s.text.length, 0)),
    deviceId: body.deviceId
  })
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quotaMessage(kind, plan, quota), quota: { kind, reason: quota.reason, canReward: quota.canReward === true, limit: quota.limit } },
      { status: 429 }
    )
  }

  const langLabel =
    body.lang === 'en' ? 'English' : body.lang === 'auto' ? '文字起こしと同じ言語' : '日本語'
  // アプリが「今月あと何回」を出せるように、成功した返事に添える（上限が無いときは null）
  const quotaInfo = {
    kind,
    remaining: Number.isFinite(quota.remainingMonth) ? quota.remainingMonth : null,
    limit: Number.isFinite(quota.limit.month) ? quota.limit.month : null
  }
  const isChat = isChatRequest(body)

  // 指示文（書式・正確さのルール）はsystemInstructionへ切り出し、userのcontentsには
  // データ（文字起こし・現在の議事録・ユーザーの依頼）だけを渡す。長いuser発話の中に
  // 指示を埋め込むより、モデルが指示に従いやすくなる。
  let systemInstructionText: string
  let userContent: string
  if (isChat) {
    systemInstructionText =
      body.lang === 'en' ? CHAT_PROMPT_EN : CHAT_PROMPT_JA.replace('{LANG}', langLabel)
    // 文字起こしと議事録を先頭に置き、これまでのやりとり、今回の質問の順に会話として渡す。
    // 先頭が毎回同じなので、2回目からは Google の割引（キャッシュ）が効く
    userContent = `---文字起こし---\n${formatTranscript(segments)}\n\n---現在の議事録---\n${body.previousSummary}`
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

  // 無料の利用（広告で運営）は 3.1 Flash-Lite、有料は 3.5 Flash-Lite（app/lib/gemini.ts）
  try {
    // AI に1回聞く。content は先頭に置く本文（文字起こし＋議事録、または議事録だけ）
    const ask = (content: string) =>
      generateContent(
        paid ? 'quality' : 'economy',
        apiKey,
        {
          systemInstruction: { parts: [{ text: systemInstructionText }] },
          contents: isChat
            ? [
                { role: 'user', parts: [{ text: content }] },
                { role: 'model', parts: [{ text: body.lang === 'en' ? 'I have read the transcript and the notes.' : '文字起こしと議事録を読みました。' }] },
                ...chatHistory(body.history),
                { role: 'user', parts: [{ text: `---ユーザーのメッセージ---\n${body.instruction}` }] }
              ]
            : [{ role: 'user', parts: [{ text: content }] }],
          generationConfig: {
            // 議事録は創作ではなく抽出タスクのため、温度を低く固定してハルシネーション
            // （文字起こしに無い内容を書いてしまうこと）を抑える。0にはせず少しだけ
            // 余地を残し、不自然に硬い言い回しの繰り返しを避ける。
            temperature: 0.2,
            maxOutputTokens: 16384
          }
        },
        { thinkingBudget: paid ? 1024 : 0 }
      )

    // 質問は、まず議事録だけを送って答えさせる（2026-11-12 本人の判断）。
    // 文字起こしの全文（1時間で約1万8千字）を毎回送るのが費用の大半だった。議事録（約1,000字）だけなら約3分の1。
    // 10の会議・125問で試すと、議事録だけで106問に正しく答え、間違いは0。残り19問は「分からない」と正しく判断した。
    // 「分からない」と答えたときと、書き直しの依頼（細かい中身が要る）のときだけ、全文で答え直す。回数は1回として数える
    if (isChat) {
      const lightContent = `---文字起こし---\n${formatTranscript(minutesAsSegments(body.previousSummary!))}\n\n---現在の議事録---\n${body.previousSummary}`
      const first = await ask(lightContent)
      if (first.res.ok) {
        const data = await first.res.json()
        await recordUsage(first.model, 'chat', paid, data?.usageMetadata)
        const text = responseText(data).trim()
        const { type, body: reply } = splitChatReply(text)
        if (text && type === 'answer' && !NOT_IN_MINUTES.test(reply)) {
          return NextResponse.json(
            { type, content: toPlainJapaneseNotes(reply), quota: quotaInfo },
            { headers: { 'x-giroku-model': first.model, 'x-giroku-chat': 'minutes' } }
          )
        }
      }
    }

    const { res, model } = await ask(userContent)
    if (!res.ok) {
      await quota.refund()
      return NextResponse.json({ error: `要約に失敗しました (${res.status})` }, { status: 502 })
    }
    const data = await res.json()
    // 本当の費用を記録（数だけ。app/lib/usageLog.ts）
    await recordUsage(model, isChat ? 'chat' : 'summary', paid, data?.usageMetadata)
    const text = responseText(data).trim()
    if (!text) {
      await quota.refund()
      return NextResponse.json({ error: '要約の生成に失敗しました（空の応答）' }, { status: 502 })
    }

    if (isChat) {
      const { type, body: reply } = splitChatReply(text)
      const content = type === 'revise' ? removePlaceholderOwners(toPlainJapaneseNotes(reply)) : toPlainJapaneseNotes(reply)
      return NextResponse.json({ type, content, quota: quotaInfo }, { headers: { 'x-giroku-model': model, 'x-giroku-chat': 'full' } })
    }
    const { title: generatedTitle, body: summaryText } = splitTitle(text)
    const summary = removePlaceholderOwners(toPlainJapaneseNotes(summaryText))
    return NextResponse.json(
      { summary, title: validGeneratedTitle(generatedTitle) ? generatedTitle : null, quota: quotaInfo },
      { headers: { 'x-giroku-model': model } }
    )
  } catch {
    await quota.refund()
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
