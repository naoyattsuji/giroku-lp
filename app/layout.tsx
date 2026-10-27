import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// 訪問者の数（Google アナリティクス。naoya-tsuji.com と同じ測定ID。管理画面 ads.naoya-tsuji.com でホスト名ごとに分けて見る）
const GA_ID = "G-DQZVBGF3LS";

export const metadata: Metadata = {
  title: "Giroku（議録）— 相手に気づかれない議事録アプリ",
  description: "会議に何も追加しないから、相手に気づかれず録音。オンライン会議も対面も講義も、パソコンの中だけで録音・文字起こし・AI議事録。全機能無料。",
  metadataBase: new URL("https://giroku.naoya-tsuji.com"),
  alternates: { canonical: "/" },
  keywords: ["議事録", "AI議事録", "文字起こし", "録音", "会議", "オンライン会議", "講義", "無料"],
  openGraph: {
    title: "Giroku — 相手に気づかれない議事録アプリ",
    description: "会議に何も追加せず、相手に気づかれず録音。パソコンの中だけで録音・文字起こし・AI議事録。全機能無料。",
    url: "https://giroku.naoya-tsuji.com",
    siteName: "Giroku",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giroku — 相手に気づかれない議事録アプリ",
    description: "会議に何も追加せず、相手に気づかれず録音。パソコンの中だけで録音・文字起こし・AI議事録。全機能無料。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
