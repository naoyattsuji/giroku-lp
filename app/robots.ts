import type { MetadataRoute } from "next";

// 検索エンジンへの案内。サーバーの入口（/api）とダウンロードの転送（/download）は載せない。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/download/"] },
    sitemap: "https://giroku.naoya-tsuji.com/sitemap.xml",
  };
}
