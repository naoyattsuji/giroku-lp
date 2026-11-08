import Link from "next/link";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import "../home.css";
import "./legal.css";

/**
 * 利用規約・プライバシーポリシーの共通の形（2026-11-08 紹介ページと同じ見た目に作り直し）。
 * 読むためのページなので動きは付けない。上に目次、各条は見出し＋本文。暗い表示にも合わせる。
 */
export type LegalBlock =
  | { p: ReactNode }
  | { h3: string }
  | { list: ReactNode[]; ordered?: boolean }
  | { note: ReactNode };

export type LegalSection = { id: string; label: string; title: string; blocks: LegalBlock[] };

function Block({ block }: { block: LegalBlock }): ReactElement {
  if ("p" in block) return <p>{block.p}</p>;
  if ("h3" in block) return <h3>{block.h3}</h3>;
  if ("note" in block) return <p className="lg-note">{block.note}</p>;
  const items = block.list.map((item, i) => <li key={i}>{item}</li>);
  return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: ReactNode;
  sections: LegalSection[];
}): ReactElement {
  return (
    <div className="h-page">
      <header className="h-nav">
        <div className="h-nav-inner">
          <Link href="/" className="h-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={24} height={24} />
            <span>Giroku</span>
          </Link>
          <nav className="h-nav-links" aria-label="ほかのページ">
            <Link href="/terms">利用規約</Link>
            <Link href="/privacy">プライバシー</Link>
          </nav>
          <Link href="/#download" className="h-button h-button-small">ダウンロード</Link>
        </div>
      </header>

      <main className="lg">
        <div className="lg-head">
          <h1>{title}</h1>
          <p className="lg-updated">最終更新日：{updated}</p>
          {intro ? <p className="lg-intro">{intro}</p> : null}
        </div>

        {/* 目次の番号の幅：一番長い番号に合わせる（「第10条」と「8」で幅が違うため） */}
        <nav
          className="lg-toc"
          aria-label="目次"
          style={{ "--lg-label-w": `${Math.max(...sections.map((s) => s.label.length)) * 0.9 + 0.4}em` } as CSSProperties}
        >
          <p className="lg-toc-title">目次</p>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span>{s.label}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((s) => (
          <section key={s.id} id={s.id} className="lg-section">
            <h2>
              <span className="lg-label">{s.label}</span>
              {s.title}
            </h2>
            {s.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
