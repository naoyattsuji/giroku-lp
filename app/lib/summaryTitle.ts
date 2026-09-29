/**
 * AIの出力の先頭にある「TITLE: …」行をタイトルとして取り出し、残りを本文として返す。
 *
 * 以前は「TITLE行 → 区切り線（---）→ 本文」の形のときだけ取り出していたが、AIが区切り線を省くと
 * 取り出しに失敗し、本文の先頭に「TITLE: …」が残ったうえタイトルも付かなかった
 * （保存済みの議事録23件中13件で発生していた）。区切り線の有無や前後の空行・コードブロックの
 * 囲み・太字の飾りに左右されないようにする。
 */
export function splitTitle(text: string): { title: string; body: string } {
  const unfenced = text.replace(/^\s*```[a-zA-Z]*\s*\n/, '').replace(/\n\s*```\s*$/, '')
  const match = unfenced.match(/^\s*\**\s*TITLE\s*[:：]\s*(.*?)\s*\**\s*(?:\n|$)/i)
  if (!match) return { title: '', body: unfenced.trim() }
  const body = unfenced
    .slice(match[0].length)
    .replace(/^\s*(?:-{3,}|ー{3,}|—{2,}|={3,}|\*{3,}|_{3,})\s*(?:\n|$)/, '')
    .trim()
  return { title: match[1].trim(), body }
}

/**
 * チャット欄の応答の1行目（REVISE / ANSWER）を読み取り、種類と本文に分ける。
 * タイトルと同じく、区切り線（---）が省かれても読み取れるようにする。以前は区切り線が無いと
 * 書き直し（REVISE）が回答扱いになり、本文の先頭に「REVISE」が残っていた。
 */
export function splitChatReply(text: string): { type: 'revise' | 'answer'; body: string } {
  const unfenced = text.replace(/^\s*```[a-zA-Z]*\s*\n/, '').replace(/\n\s*```\s*$/, '')
  const match = unfenced.match(/^\s*\**\s*(REVISE|ANSWER)\s*\**\s*(?:\n|$)/i)
  if (!match) return { type: 'answer', body: unfenced.trim() }
  const body = unfenced
    .slice(match[0].length)
    .replace(/^\s*(?:-{2,}|ー{3,}|—{2,}|={3,}|\*{3,}|_{3,})\s*(?:\n|$)/, '')
    .trim()
  return { type: match[1].toUpperCase() === 'REVISE' ? 'revise' : 'answer', body }
}
