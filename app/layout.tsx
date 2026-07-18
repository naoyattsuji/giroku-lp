import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giroku — 会議は、そのまま。記録だけ、残る。",
  description: "通話にボットを追加せず、マイクとパソコンの音をリアルタイムで文字起こし。録音・AI議事録まで、ひとつのアプリで。月120分まで無料・登録不要。",
  metadataBase: new URL("https://giroku-lp.vercel.app"),
  alternates: { canonical: "/" },
  keywords: ["議事録", "AI議事録", "文字起こし", "録音", "会議", "オンライン会議", "講義", "無料"],
  openGraph: {
    title: "Giroku — 会議は、そのまま。記録だけ、残る。",
    description: "通話にボットを追加せず、マイクとパソコンの音をリアルタイムで文字起こし。録音・AI議事録まで、ひとつのアプリで。",
    url: "https://giroku-lp.vercel.app",
    siteName: "Giroku",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giroku — 会議は、そのまま。記録だけ、残る。",
    description: "通話にボットを追加せず、マイクとパソコンの音をリアルタイムで文字起こし。録音・AI議事録まで、ひとつのアプリで。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
