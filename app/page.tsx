"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import {
  SceneOnline,
  SceneMeeting,
  SceneLecture,
  SceneImage,
  LogoMark,
} from "./components/Illustrations";
import { AppMock } from "./components/AppMock";
import { Reveal } from "./components/Reveal";

const scenes = [
  {
    Illust: SceneOnline,
    photo: "/scenes/online-meeting.jpg",
    tag: "オンライン会議",
    benefit: "そのまま記録。",
    desc: "Zoom・Meet・Teams、いつもの画面のまま。参加者に何かを追加してもらう必要はありません。",
  },
  {
    Illust: SceneMeeting,
    photo: "/scenes/in-person.jpg",
    tag: "対面・1対1",
    benefit: "置くだけで記録。",
    desc: "机の上にパソコンを置いておくだけ。自分の声も、向かいの相手の声も両方拾います。",
  },
  {
    Illust: SceneLecture,
    photo: "/scenes/lecture.jpg",
    tag: "講義・授業",
    benefit: "録って、見返す。",
    desc: "聞き逃したところも、あとから文字で確認。板書を写す手も止めずに済みます。",
  },
];

type CompareCell = { text: string } | { cross: true };

const compareRows: { label: string; zoom: CompareCell; other: CompareCell }[] = [
  { label: "相手に気づかれない", zoom: { text: "録画中と表示される" }, other: { text: "Botが会議に参加" } },
  { label: "自分の声も相手の声も", zoom: { text: "別途設定が必要" }, other: { text: "片方だけの場合も" } },
  { label: "ネットがなくても使える", zoom: { cross: true }, other: { cross: true } },
];

function CheckIcon(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3.5 9.5l3.5 3.5 7.5-8" stroke="#1a9d4b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CompareCellContent({ cell }: { cell: CompareCell }): ReactElement {
  if ("cross" in cell) {
    return <CrossIcon />;
  }
  return <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{cell.text}</span>;
}

const btnDark = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "14px 30px",
  background: "var(--text-1)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 999,
  whiteSpace: "nowrap" as const,
  transition: "opacity 0.15s, transform 0.15s",
};

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <header className="nav-sticky">
        <div className="lp-inner" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={26} height={26} style={{ display: "block" }} />
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--text-1)" }}>Giroku</span>
          </span>
          <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
            <a href="#scenes" className="nav-secondary-link" style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500, whiteSpace: "nowrap" }}>使い方</a>
            <a href="#pricing" className="nav-secondary-link" style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500, whiteSpace: "nowrap" }}>料金</a>
            <a
              href="#download"
              style={{ fontSize: 13, color: "#fff", background: "var(--red)", padding: "8px 18px", borderRadius: 999, fontWeight: 700, whiteSpace: "nowrap" }}
            >
              ダウンロード
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div
          className="lp-inner hero-grid"
          style={{ paddingTop: 76, paddingBottom: 90, display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 48, alignItems: "center" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <span className="hero-spirit">
                <LogoMark size={34} />
              </span>
              <p style={{ display: "inline-flex", fontSize: 12, letterSpacing: "0.02em", color: "var(--red)", fontWeight: 700, background: "rgba(232,25,44,0.08)", padding: "5px 12px", borderRadius: 999 }}>
                録音 · 文字起こし · AI議事録
              </p>
            </div>
            <h1 style={{ fontSize: "clamp(32px, 3.6vw, 44px)", fontWeight: 800, lineHeight: 1.28, letterSpacing: "-0.03em", marginBottom: 22, color: "var(--text-1)" }}>
              相手に<br className="br-narrow" />気づかれず、<br />会話をまるごと<br className="br-narrow" />記録。
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.75, maxWidth: 440, marginBottom: 34 }}>
              自分の声も、相手の声も。ネットがなくても、あなたのパソコンだけで議事録に。
            </p>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <a
                href="#download"
                style={btnDark}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                無料でダウンロード
              </a>
              <a href="#scenes" style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500 }}>使い方を見る →</a>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-3)" }}>1か月120分まで無料 · 登録不要ですぐ使える</p>
          </div>
          <Reveal delay={120}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AppMock />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 他の方法との比較 */}
      <section style={{ background: "var(--surface-2)" }}>
        <div className="lp-inner" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <Reveal>
            <p style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--red)", fontWeight: 700, marginBottom: 12 }}>Girokuだけの3つ</p>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 14, color: "var(--text-1)" }}>
              他の方法だと、<br className="br-narrow" />ここで詰まる。
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8, maxWidth: 480, marginBottom: 36 }}>
              Zoom・Meetの録音機能や他の文字起こしアプリと並べると、Girokuだけができることがはっきりします。
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="lp-card compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col" className="compare-corner"></th>
                    <th scope="col" className="compare-th-giroku">Giroku</th>
                    <th scope="col">Zoom・Meetの<br />標準録音</th>
                    <th scope="col">他の文字起こし<br />アプリ</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="compare-row-label">{row.label}</th>
                      <td className="compare-cell-giroku"><CheckIcon /></td>
                      <td><CompareCellContent cell={row.zoom} /></td>
                      <td><CompareCellContent cell={row.other} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Scenes */}
      <section id="scenes" style={{ background: "var(--bg)" }}>
        <div className="lp-inner" style={{ paddingTop: 88, paddingBottom: 56 }}>
          <Reveal>
            <p style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--red)", marginBottom: 12, fontWeight: 700 }}>こんな場面で</p>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25, maxWidth: 620, color: "var(--text-1)" }}>
              話すだけで、そのまま議事録になる。
            </h2>
          </Reveal>
        </div>
        <div className="lp-inner" style={{ paddingBottom: 100, display: "flex", flexDirection: "column", gap: 88 }}>
          {scenes.map(({ Illust, photo, tag, benefit, desc }, i) => (
            <Reveal key={tag}>
              <div className="feature-row">
                <div style={{ order: i % 2 === 0 ? 0 : 1, background: "var(--surface)", borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "4 / 3", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -16px rgba(0,0,0,0.12)" }}>
                  <SceneImage src={photo} alt={tag} fallback={<Illust />} />
                </div>
                <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 700 }}>{tag}</span>
                  <h3 style={{ fontSize: "clamp(22px, 2.6vw, 28px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "8px 0 14px", color: "var(--text-1)" }}>
                    {benefit}
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8, maxWidth: 420 }}>{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: "var(--surface-2)" }}>
        <div className="lp-inner" style={{ paddingTop: 88, paddingBottom: 92 }}>
          <Reveal>
            <p style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--red)", marginBottom: 12, fontWeight: 700 }}>料金</p>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 44, color: "var(--text-1)" }}>
              シンプルな2プラン。
            </h2>
          </Reveal>
          <Reveal delay={80}>
          <div className="pricing-grid">
            <div className="lp-card" style={{ padding: "34px 32px" }}>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 18, fontWeight: 700 }}>無料プラン</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                <p style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--text-1)" }}>¥0</p>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 30 }}>ずっと無料 · 1か月120分まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {["録音", "文字起こし", "だれの発言か自動で分ける", "記録の保存とコピー"].map((item) => (
                  <p key={item} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.5 }}>
                    <CheckIcon />{item}
                  </p>
                ))}
                <p style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: "var(--text-3)", lineHeight: 1.5 }}>
                  <CrossIcon />AIで議事録を作成（有料プランのみ）
                </p>
              </div>
              <a href="#download" style={{ display: "block", padding: "13px 0", background: "var(--surface-2)", color: "var(--text-1)", fontSize: 14, fontWeight: 700, borderRadius: 999, textAlign: "center" }}>
                無料で始める
              </a>
            </div>
            <div className="lp-card" style={{ padding: "34px 32px", border: "2px solid var(--red)" }}>
              <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 18, fontWeight: 700 }}>有料プラン</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                <p style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--text-1)" }}>¥980</p>
                <p style={{ fontSize: 15, color: "var(--text-3)", fontWeight: 700 }}>/ 年</p>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 30 }}>買い切り（1年間有効）· 3台まで使える</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {["録音（時間の制限なし）", "文字起こし（時間の制限なし）", "だれの発言か自動で分ける", "AIで議事録を作成"].map((item) => (
                  <p key={item} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: "var(--text-1)", lineHeight: 1.5 }}>
                    <CheckIcon />{item}
                  </p>
                ))}
              </div>
              <a
                href="https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747"
                style={{ display: "block", padding: "13px 0", background: "var(--red)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 999, textAlign: "center", transition: "opacity 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                ¥980 で購入
              </a>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Download */}
      <section id="download" style={{ background: "var(--bg)" }}>
        <div className="lp-inner" style={{ paddingTop: 92, paddingBottom: 92, textAlign: "center" }}>
          <Reveal>
            <span className="hero-spirit" style={{ display: "inline-flex", marginBottom: 18 }}>
              <LogoMark size={40} />
            </span>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 28, color: "var(--text-1)" }}>
              今すぐ始める
            </h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, justifyContent: "center" }}>
              <a
                href="https://github.com/naoyattsuji/giroku-releases/releases/latest"
                style={btnDark}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                macOS 用ダウンロード
              </a>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "14px 30px", background: "var(--surface-2)", color: "var(--text-3)", fontSize: 14, borderRadius: 999, whiteSpace: "nowrap" }}>
                Windows版 — 準備中
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-3)" }}>1か月120分まで無料 · 登録不要</p>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "auto", background: "var(--surface-2)" }}>
        <div className="lp-inner" style={{ paddingTop: 22, paddingBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>© {new Date().getFullYear()} Naoya Tsuji</span>
          <div style={{ display: "flex", gap: 22 }}>
            <Link href="/privacy" style={{ fontSize: 12.5, color: "var(--text-3)" }}>プライバシー</Link>
            <Link href="/terms" style={{ fontSize: 12.5, color: "var(--text-3)" }}>利用規約</Link>
            <a href="mailto:naoyatttsuji@gmail.com" style={{ fontSize: 12.5, color: "var(--text-3)" }}>サポート</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
