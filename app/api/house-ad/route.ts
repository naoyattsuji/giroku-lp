import { NextResponse } from 'next/server';

/*
 * PC 版の無料版に出す「自社の案内」（iPhone 版・Pro）を出すかどうかの設定（2026-11-13 本人の決定）。
 * アプリは1日1回これを読む。読めないときは案内を出さない。
 * アプリを更新せずに止められるよう、環境変数で切り替える：
 *   HOUSE_AD_OFF=1     … 全部止める
 *   HOUSE_AD_IPHONE=0  … iPhone 版の案内だけ止める（決めていなければ出す）
 *   HOUSE_AD_PRO=0     … Pro の案内だけ止める（決めていなければ出す。ただしアプリ側は PC の Pro が買えるようになるまで出さない）
 */
const on = (name: string, fallback: boolean): boolean => {
  const v = process.env[name]?.trim();
  if (!v) return fallback;
  return v === '1' || v.toLowerCase() === 'true';
};

export async function GET() {
  const off = on('HOUSE_AD_OFF', false);
  return NextResponse.json(
    { iphone: !off && on('HOUSE_AD_IPHONE', true), pro: !off && on('HOUSE_AD_PRO', true) },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } },
  );
}
