import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giroku（議録）— ローカル完結の議事録AI",
  description: "Zoom・Meet・Teams の音声を、録音ボットなしでデバイス内だけで録音・文字起こし。日本語ネイティブ精度。月120分まで無料。",
  metadataBase: new URL("https://giroku-lp.vercel.app"),
  alternates: { canonical: "/" },
  keywords: ["議事録", "AI", "文字起こし", "録音", "Zoom", "Meet", "Teams", "オンライン会議", "ローカル処理", "プライバシー"],
  openGraph: {
    title: "Giroku — ローカル完結の議事録AI",
    description: "録音ボットなしで、会議の音声をデバイス内だけで録音・文字起こし。日本語ネイティブ精度。月120分無料。",
    url: "https://giroku-lp.vercel.app",
    siteName: "Giroku",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giroku — ローカル完結の議事録AI",
    description: "録音ボットなしで、会議の音声をデバイス内だけで録音・文字起こし。月120分無料。",
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
