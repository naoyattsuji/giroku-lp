import { NextRequest, NextResponse } from 'next/server';

// 環境変数が無いときに '1.0.0' を返していたのをやめた（2026-11-12 の点検）。
// 実際の最新版と違う数字を返すと、アプリが古い版を「最新」と取り違える。分からないときは null を返し、アプリは知らせを出さない

export function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get('platform');
  if (platform !== 'ios' && platform !== 'android') {
    return NextResponse.json({ error: 'platform must be ios or android' }, { status: 400 });
  }

  const latestVersion = (platform === 'ios'
    ? process.env.MOBILE_IOS_LATEST_VERSION?.trim()
    : process.env.MOBILE_ANDROID_LATEST_VERSION?.trim()) || null;
  const updateUrl = platform === 'ios'
    ? (process.env.IOS_APP_STORE_URL || (process.env.IOS_APP_STORE_ID
      ? `https://apps.apple.com/app/id${process.env.IOS_APP_STORE_ID}`
      : null))
    : (process.env.ANDROID_PLAY_STORE_URL
      || `https://play.google.com/store/apps/details?id=${process.env.ANDROID_PLAY_PACKAGE || 'app.giroku.mobile'}`);

  return NextResponse.json(
    { platform, latestVersion, updateUrl },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } },
  );
}
