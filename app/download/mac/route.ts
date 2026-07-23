import { NextResponse } from "next/server";

const RELEASES_API_URL =
  "https://api.github.com/repos/naoyattsuji/giroku-releases/releases/latest";
const RELEASES_PAGE_URL =
  "https://github.com/naoyattsuji/giroku-releases/releases/latest";

// 最新リリースのDMG資産URLをGitHub APIから毎回取得する。ファイル名にバージョン
// 番号が入っているため、固定URLだとリリースのたびにここを更新し忘れて壊れる
// （実際に giroku-0.1.5.dmg のまま放置され404していた）。API呼び出しに失敗した
// 場合だけ、常に有効なリリース一覧ページへ逃がす。
export async function GET() {
  try {
    const res = await fetch(RELEASES_API_URL, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        assets?: { name: string; browser_download_url: string }[];
      };
      const dmgAsset = data.assets?.find((asset) => asset.name.endsWith(".dmg"));
      if (dmgAsset?.browser_download_url) {
        return NextResponse.redirect(dmgAsset.browser_download_url, 307);
      }
    }
  } catch {
    // フォールバックへ
  }
  return NextResponse.redirect(RELEASES_PAGE_URL, 307);
}
