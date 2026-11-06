/**
 * AI に送る前に、文字起こしから意味のない部分を削って原価（入力トークン）を減らす。
 * 議事録の中身は変えない：言いよどみ（えー・えっと・あのー）、言い直しの繰り返し、
 * 相づちだけの行（はい・うん・なるほど）を消すだけ。2026-11-07、AI の費用を抑えるため（A 案）。
 * アプリ側の表示や保存されている文字起こしは変えない（送る分だけ）。
 */
const FILLERS = /(えーっと|えーと|えっと|えー+|あのー+|あのう|うーん|んー+|ええと)[、,\s]*/g
// 後ろがひらがな・カタカナ・読点・文の終わりの「あの」「まあ」は言いよどみ（「あの本」のような漢字の前は残す）
const SOFT_FILLERS = /(^|[、。\s])(あの|まあ|ま(?=、))[、\s]*(?=[ぁ-んァ-ヶー、。]|$)/g
const MAA = /(?<![また])まあ(?!まあ)[、\s]*(?=[ぁ-んァ-ヶー、。]|$)/g
// 同じ言葉の言い直し（「機能機能を」）。ひらがなは「そもそも」「まだまだ」を壊すので漢字・カタカナだけ
const DOUBLED = /([一-龥ァ-ヶー]{2,8})\1+/g
// 相づちだけの行
const BACKCHANNEL = /^(はい|うん|ええ|そうですね|そうです|なるほど|なるほどね|ありがとうございます|すみません|あー|へー|ふーん|おー)+[。、！!？?\s]*$/

export function compactText(text: string): string {
  return text
    .replace(FILLERS, '')
    .replace(SOFT_FILLERS, '$1')
    .replace(MAA, '')
    .replace(DOUBLED, '$1')
    .replace(/、{2,}/g, '、')
    .replace(/^[、。\s]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function bigrams(text: string): string[] {
  const t = text.replace(/[\s、。，．,.!?！？「」]/g, '')
  const out: string[] = []
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2))
  return out
}

/** a の言葉のうち b にも出てくる割合 */
function overlap(a: string, b: string): number {
  const ga = bigrams(a)
  if (!ga.length) return 0
  const pool = new Map<string, number>()
  for (const g of bigrams(b)) pool.set(g, (pool.get(g) ?? 0) + 1)
  let hit = 0
  for (const g of ga) {
    const n = pool.get(g) ?? 0
    if (n > 0) {
      hit++
      pool.set(g, n - 1)
    }
  }
  return hit / ga.length
}

export function compactTranscriptLines(texts: string[]): string[] {
  const out: string[] = []
  for (const raw of texts) {
    const t = compactText(raw)
    if (!t || BACKCHANNEL.test(t)) continue
    // 直前とほぼ同じ行（マイクがスピーカーの声も拾って2回入った古い録音）は1つにする
    const prev = out[out.length - 1]
    if (prev && t.length > 15 && overlap(t, prev) >= 0.8) continue
    out.push(t)
  }
  return out
}
