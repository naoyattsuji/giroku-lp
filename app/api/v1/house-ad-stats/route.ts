import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { jstDay, redisPipeline } from '../../../lib/redis';

/*
 * 管理画面（ads.naoya-tsuji.com）に、PC の自社の案内の日ごとの数を返す読むだけの窓口（2026-11-13）。
 * 合言葉は管理画面の環境変数 STATS_TOKEN（KOMARO と同じ）。ここには指紋（sha256）だけを置く。
 * 返すのは日ごとの「種類:操作」の数だけ（端末 ID などは元から記録していない）。
 */
const TOKEN_SHA256 = '33c046986bf8110ca128e019aa375df7b11e3fb7433ba8cd24fceb44ea39cd29';

export const dynamic = 'force-dynamic';

function allowed(req: Request): boolean {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const got = createHash('sha256').update(auth.slice(7)).digest();
  return timingSafeEqual(got, Buffer.from(TOKEN_SHA256, 'hex'));
}

const FIELDS = ['iphone:shown', 'iphone:pro', 'iphone:close', 'pro:shown', 'pro:pro', 'pro:close'] as const;

export async function GET(req: Request) {
  if (!allowed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const days = Array.from({ length: 30 }, (_, i) => jstDay(Date.now() - i * 86400000));
  const result = await redisPipeline(days.map((d) => ['HMGET', `houseAd:${d}`, ...FIELDS]));
  if (!result) return NextResponse.json({ error: '数の置き場所に届きませんでした' }, { status: 503 });
  const rows = days.map((day, i) => {
    const values = (result[i] as Array<string | null>) ?? [];
    const counts: Record<string, number> = {};
    FIELDS.forEach((f, j) => (counts[f] = Number(values[j] ?? 0) || 0));
    return { day, ...counts };
  });
  return NextResponse.json({ days: rows });
}
