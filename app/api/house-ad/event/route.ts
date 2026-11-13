import { NextRequest, NextResponse } from 'next/server';
import { allowApiRequest } from '../../../lib/license';
import { jstDay, redisPipeline } from '../../../lib/redis';

/*
 * 自社の案内の「出た・押した・閉じた」を、日ごとの数だけ数える（2026-11-13 本人の決定）。
 * 受け取るのは案内の種類と、何をしたかだけ。端末 ID・録音の中身・名前は受け取らない。
 * 数は Upstash の houseAd:YYYYMMDD に「iphone:shown」などの形で足し、400日で消える。
 */
const KINDS = new Set(['iphone', 'pro']);
const ACTIONS = new Set(['shown', 'pro', 'close']);

export async function POST(req: NextRequest) {
  if (!allowApiRequest(req, 20)) return NextResponse.json({ ok: false }, { status: 429 });
  let body: { kind?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const kind = typeof body.kind === 'string' && KINDS.has(body.kind) ? body.kind : null;
  const action = typeof body.action === 'string' && ACTIONS.has(body.action) ? body.action : null;
  if (!kind || !action) return NextResponse.json({ ok: false }, { status: 400 });
  const key = `houseAd:${jstDay()}`;
  await redisPipeline([
    ['HINCRBY', key, `${kind}:${action}`, 1],
    ['EXPIRE', key, 400 * 24 * 60 * 60],
  ]);
  return NextResponse.json({ ok: true });
}
