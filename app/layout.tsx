import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giroku（議録）— 相手に気づかれない議事録AI",
  description: "オンライン会議を相手に通知せず録音・文字起こし。音声データはすべてデバイス内で処理されます。",
  openGraph: {
    title: "Giroku（議録）— 相手に気づかれない議事録AI",
    description: "オンライン会議を相手に通知せず録音・文字起こし。音声データはすべてデバイス内で処理されます。",
    url: "https://giroku-lp.vercel.app",
    siteName: "Giroku",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giroku（議録）— 相手に気づかれない議事録AI",
    description: "オンライン会議を相手に通知せず録音・文字起こし。",
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
