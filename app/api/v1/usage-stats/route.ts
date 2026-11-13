import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { jstDay, redisPipeline } from '../../../lib/redis';

/*
 * AI に送った量・返ってきた量の日ごとの合計を返す、読むだけの窓口（2026-11-14）。
 * 収支の試算を本当の数で見直すために使う。合言葉は house-ad-stats と同じ（ここには指紋だけを置く）。
 * 記録は「モデル|種類|無料かPro|項目」ごとの合計だけで、誰が使ったかは元から記録していない（app/lib/usageLog.ts）。
 */
const TOKEN_SHA256 = '33c046986bf8110ca128e019aa375df7b11e3fb7433ba8cd24fceb44ea39cd29';

export const dynamic = 'force-dynamic';

function allowed(req: Request): boolean {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const got = createHash('sha256').update(auth.slice(7)).digest();
  return timingSafeEqual(got, Buffer.from(TOKEN_SHA256, 'hex'));
}

export async function GET(req: Request) {
  if (!allowed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const days = Array.from({ length: 60 }, (_, i) => jstDay(Date.now() - i * 86400000));
  const result = await redisPipeline(days.map((d) => ['HGETALL', `giroku:usage:${d}`]));
  if (!result) return NextResponse.json({ error: '数の置き場所に届きませんでした' }, { status: 503 });
  const rows = days.map((day, i) => {
    const flat = (result[i] as string[] | null) ?? [];
    const counts: Record<string, number> = {};
    for (let k = 0; k + 1 < flat.length; k += 2) counts[flat[k]] = Number(flat[k + 1]) || 0;
    return { day, counts };
  });
  return NextResponse.json({ days: rows.filter((r) => Object.keys(r.counts).length > 0) });
}
