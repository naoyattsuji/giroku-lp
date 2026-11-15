/**
 * 議事録の日付の点検（2026-11-15）。
 * 安いモデルは、月の無い日付（「24日の火曜」）に、別の話題で出た月（「2月」）を付けてしまうことがある。
 * 議事録の「○月○日」が、文字起こしの中で月と日の組として出てくるかを調べ、出てこないものを返す。
 * ここでは何も書き換えない。怪しい日付があれば、呼んだ側が上のモデルで作り直す（正しい月を消さないため）。
 */
const KANJI: Record<string, number> = { 〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }

function kanjiNumber(text: string): number {
  let total = 0
  let digit = 0
  for (const ch of text) {
    if (ch === '十') {
      total += (digit || 1) * 10
      digit = 0
    } else {
      digit = KANJI[ch] ?? 0
    }
  }
  return total + digit
}

/** 全角の数字と、月・日の前の漢数字を半角の数字にし、空白を除く */
export function normalizeDates(text: string): string {
  return text
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[〇一二三四五六七八九十]+(?=[月日])/g, (m) => String(kanjiNumber(m)))
    .replace(/\s+/g, '')
}

/** 月と日の間に挟まってよい字数（「11月の、えーと、そうですね10日」が収まる長さ） */
const PAIR_WINDOW = 25

export function suspiciousDates(summary: string, transcript: string): string[] {
  const spoken = normalizeDates(transcript)
  const found = new Set<string>()
  for (const match of normalizeDates(summary).matchAll(/(\d{1,2})月(\d{1,2})日/g)) {
    const [month, day] = [match[1], match[2]]
    const pair = new RegExp(
      `(?<!\\d)${month}月.{0,${PAIR_WINDOW}}?(?<!\\d)${day}(?!\\d)|(?<!\\d)${month}/${day}(?!\\d)`
    )
    if (!pair.test(spoken)) found.add(`${month}月${day}日`)
  }
  return [...found]
}
