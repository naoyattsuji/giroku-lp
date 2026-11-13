import type { MetadataRoute } from "next";

const BASE = "https://giroku.naoya-tsuji.com";

// 検索に載せたいページの一覧。
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/legal`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
