import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// 訪問者の数（Google アナリティクス。naoya-tsuji.com と同じ測定ID。管理画面 ads.naoya-tsuji.com でホスト名ごとに分けて見る）
const GA_ID = "G-DQZVBGF3LS";

export const metadata: Metadata = {
  title: "Giroku（ギロク）— 相手に気づかれない議事録アプリ",
  description: "会議に Bot を入れず、録音するだけ。会議も講義も、端末の中で文字起こしし、AI が議事録にまとめます。iPhone・Mac・Windows。基本は無料。",
  // iPhone の Safari では、ページの上に App Store の「入手」の帯が出る
  itunes: { appId: "6826128219" },
  metadataBase: new URL("https://giroku.naoya-tsuji.com"),
  alternates: { canonical: "/" },
  keywords: ["議事録", "AI議事録", "文字起こし", "録音", "会議", "オンライン会議", "講義", "無料"],
  openGraph: {
    title: "Giroku — 相手に気づかれない議事録アプリ",
    description: "会議に Bot を入れず、録音するだけ。端末の中で文字起こしし、AI が議事録に。iPhone・Mac・Windows。基本は無料。",
    url: "https://giroku.naoya-tsuji.com",
    siteName: "Giroku",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giroku — 相手に気づかれない議事録アプリ",
    description: "会議に Bot を入れず、録音するだけ。端末の中で文字起こしし、AI が議事録に。iPhone・Mac・Windows。基本は無料。",
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
