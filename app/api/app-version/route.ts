import { NextRequest, NextResponse } from 'next/server';

const CURRENT_MOBILE_VERSION = '1.0.0';

export function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get('platform');
  if (platform !== 'ios' && platform !== 'android') {
    return NextResponse.json({ error: 'platform must be ios or android' }, { status: 400 });
  }

  const latestVersion = platform === 'ios'
    ? (process.env.MOBILE_IOS_LATEST_VERSION || CURRENT_MOBILE_VERSION)
    : (process.env.MOBILE_ANDROID_LATEST_VERSION || CURRENT_MOBILE_VERSION);
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
