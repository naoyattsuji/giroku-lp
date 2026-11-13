import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { compactTranscriptLines } from '../../../lib/compactTranscript';
import { generateContent } from '../../../lib/gemini';

/*
 * 議事録の指示文を試すための、本人だけが使う一時的な入口（2026-11-13。試験が終わったら消す）。
 * 渡した指示文と文字起こしで AI に議事録を作らせ、そのまま返す。回数の上限には数えない。
 * 合言葉は管理画面と同じ STATS_TOKEN。ここには指紋（sha256）だけを置く。
 */
const TOKEN_SHA256 = '33c046986bf8110ca128e019aa375df7b11e3fb7433ba8cd24fceb44ea39cd29';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function allowed(req: Request): boolean {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const got = createHash('sha256').update(auth.slice(7)).digest();
  return timingSafeEqual(got, Buffer.from(TOKEN_SHA256, 'hex'));
}

export async function POST(req: NextRequest) {
  if (!allowed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'no key' }, { status: 503 });
  const body = (await req.json()) as { system: string; lines: string[]; tier?: 'quality' | 'economy'; thinking?: number };
  if (typeof body.system !== 'string' || !Array.isArray(body.lines)) return NextResponse.json({ error: 'bad' }, { status: 400 });
  const tier = body.tier === 'quality' ? 'quality' : 'economy';
  const user = `---文字起こし---\n${compactTranscriptLines(body.lines.map(String)).join('\n')}`;
  const started = Date.now();
  const { res, model } = await generateContent(
    tier,
    apiKey,
    {
      systemInstruction: { parts: [{ text: body.system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 16384 }
    },
    { thinkingBudget: typeof body.thinking === 'number' ? body.thinking : tier === 'quality' ? 1024 : 0 }
  );
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
    usageMetadata?: Record<string, number>;
  };
  const text = (data.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? '').join('');
  return NextResponse.json({ ok: res.ok, status: res.status, model, ms: Date.now() - started, usage: data.usageMetadata ?? null, text });
}
