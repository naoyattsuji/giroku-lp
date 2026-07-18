import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giroku（議録）— 相手に気づかれない議事録アプリ",
  description: "会議に何も追加しないから、相手に気づかれず録音。オンライン会議も対面も講義も、パソコンの中だけで録音・文字起こし・AI議事録。1か月120分まで無料。",
  metadataBase: new URL("https://giroku-lp.vercel.app"),
  alternates: { canonical: "/" },
  keywords: ["議事録", "AI議事録", "文字起こし", "録音", "会議", "オンライン会議", "講義", "無料"],
  openGraph: {
    title: "Giroku — 相手に気づかれない議事録アプリ",
    description: "会議に何も追加せず、相手に気づかれず録音。パソコンの中だけで録音・文字起こし・AI議事録。1か月120分まで無料。",
    url: "https://giroku-lp.vercel.app",
    siteName: "Giroku",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giroku — 相手に気づかれない議事録アプリ",
    description: "会議に何も追加せず、相手に気づかれず録音。パソコンの中だけで録音・文字起こし・AI議事録。1か月120分まで無料。",
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
