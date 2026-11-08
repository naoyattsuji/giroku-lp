import Link from "next/link";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { SiteFooter } from "./components/SiteFooter";
import "./home.css";
import "./components/legal.css";

/* ページが見つからないとき（2026-11-08 紹介ページと同じ見た目に。以前は Next.js の初期の黒い画面だった） */
export const metadata: Metadata = { title: "ページが見つかりません — Giroku" };

export default function NotFound(): ReactElement {
  return (
    <div className="h-page" style={{ display: "flex", flexDirection: "column" }}>
      <header className="h-nav">
        <div className="h-nav-inner">
          <Link href="/" className="h-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={24} height={24} />
            <span>Giroku</span>
          </Link>
          <Link href="/#download" className="h-button h-button-small" style={{ marginLeft: "auto" }}>ダウンロード</Link>
        </div>
      </header>
      <main className="lg" style={{ textAlign: "center", flex: 1, width: "100%" }}>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>ページが見つかりません</h1>
        <p style={{ marginTop: 16, color: "var(--h-ink-2)" }}>アドレスが変わったか、ページがなくなった可能性があります。</p>
        <p style={{ marginTop: 32 }}>
          <Link href="/" className="h-button">トップへ戻る</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
