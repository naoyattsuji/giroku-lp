/**
 * 長い会議の文字起こしを、約 size 字ごとのまとまりに分ける（行の途中では切らない）。
 * 議事録を区切って作るときに使う（app/api/summarize/route.ts。2026-11-14）。
 */
export function splitTranscriptLines(lines: string[], size = 8000): string[][] {
  const chunks: string[][] = []
  let current: string[] = []
  let length = 0
  for (const line of lines) {
    current.push(line)
    length += line.length
    if (length >= size) {
      chunks.push(current)
      current = []
      length = 0
    }
  }
  if (current.length) chunks.push(current)
  return chunks
}
