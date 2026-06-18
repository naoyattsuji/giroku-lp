import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giroku（議録）— 相手に気づかれない議事録AI",
  description: "Zoom・Meet・Teams などのオンライン会議を、相手に一切通知せず録音・文字起こし。月120分まで無料。音声データはすべてデバイス内で処理。",
  metadataBase: new URL("https://giroku-lp.vercel.app"),
  alternates: { canonical: "/" },
  keywords: ["議事録", "AI", "文字起こし", "ステルス", "録音", "Zoom", "Meet", "Teams", "オンライン会議"],
  openGraph: {
    title: "Giroku — 相手に気づかれない議事録AI",
    description: "Zoom・Meet・Teams を相手に通知せず録音・文字起こし。月120分無料。音声はデバイス内処理。",
    url: "https://giroku-lp.vercel.app",
    siteName: "Giroku",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giroku — 相手に気づかれない議事録AI",
    description: "Zoom・Meet・Teams を相手に通知せず録音・文字起こし。月120分無料。",
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
