import { NextRequest, NextResponse } from 'next/server';

/*
 * iPhone の「新しい版があるか」の答え。
 * 前は環境変数の番号を返していたが、設定が無く '1.0.0' が返り続け、お客さんに新しい版の知らせが届いていなかった（2026-11-12 の点検）。
 * いま App Store に出ている版は、Apple の公開窓口（iTunes Search API の lookup）から読む。出すたびに設定し直さなくてよい。
 * 環境変数があればそちらを優先する（わざと知らせを止めたい・早めたいとき用）。読めなければ null（アプリは知らせを出さない）。
 */
const BUNDLE_ID = 'app.giroku.mobile';
const FALLBACK_IOS_URL = 'https://apps.apple.com/jp/app/giroku/id6826128219';

async function appStoreLatest(): Promise<{ version: string | null; url: string | null }> {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}&country=jp`, {
      signal: AbortSignal.timeout(4_000),
      next: { revalidate: 600 },
    });
    if (!res.ok) return { version: null, url: null };
    const data = (await res.json()) as { results?: Array<{ version?: unknown; trackViewUrl?: unknown }> };
    const app = data.results?.[0];
    const version = typeof app?.version === 'string' && /^\d+(\.\d+){0,3}$/.test(app.version) ? app.version : null;
    const url = typeof app?.trackViewUrl === 'string' ? app.trackViewUrl.replace(/\?.*$/, '') : null;
    return { version, url };
  } catch {
    return { version: null, url: null };
  }
}

export async function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get('platform');
  if (platform !== 'ios' && platform !== 'android') {
    return NextResponse.json({ error: 'platform must be ios or android' }, { status: 400 });
  }

  let latestVersion: string | null;
  let updateUrl: string | null;
  if (platform === 'ios') {
    const store = process.env.MOBILE_IOS_LATEST_VERSION?.trim() ? null : await appStoreLatest();
    latestVersion = process.env.MOBILE_IOS_LATEST_VERSION?.trim() || store?.version || null;
    updateUrl =
      process.env.IOS_APP_STORE_URL ||
      (process.env.IOS_APP_STORE_ID ? `https://apps.apple.com/app/id${process.env.IOS_APP_STORE_ID}` : null) ||
      store?.url ||
      FALLBACK_IOS_URL;
  } else {
    latestVersion = process.env.MOBILE_ANDROID_LATEST_VERSION?.trim() || null;
    updateUrl =
      process.env.ANDROID_PLAY_STORE_URL ||
      `https://play.google.com/store/apps/details?id=${process.env.ANDROID_PLAY_PACKAGE || BUNDLE_ID}`;
  }

  return NextResponse.json(
    { platform, latestVersion, updateUrl },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } },
  );
}
