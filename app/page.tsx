"use client";

import Link from "next/link";
import {
  HeroDiagram,
  SceneOnline,
  SceneMeeting,
  SceneLecture,
  IconStealth,
  IconBothVoices,
  IconOffline,
} from "./components/Illustrations";

const scenes = [
  {
    Illust: SceneOnline,
    tag: "オンライン会議",
    benefit: "オンライン会議を、そのまま記録。",
    detail: "会議に何も追加しないので、いつも通りに話せます。",
  },
  {
    Illust: SceneMeeting,
    tag: "対面の打ち合わせ・1対1",
    benefit: "パソコンを置くだけで記録。",
    detail: "メモを取らなくても、あとで全部読み返せます。",
  },
  {
    Illust: SceneLecture,
    tag: "大学の講義・授業",
    benefit: "講義を録って、あとで見返す。",
    detail: "黒板と話に集中。聞き逃しがなくなります。",
  },
];

const pillars = [
  {
    Icon: IconStealth,
    no: "01",
    title: "相手に気づかれない",
    desc: "会議に何も追加しないから、録音していることが相手に伝わりません。",
  },
  {
    Icon: IconBothVoices,
    no: "02",
    title: "自分の声も、相手の声も",
    desc: "マイクの音も、パソコンが鳴らす通話や動画の音も。どちらもまとめて録れます。",
  },
  {
    Icon: IconOffline,
    no: "03",
    title: "ネットがなくても使える",
    desc: "あなたのパソコンの中だけで動くから、電波のない場所でも安心です。",
  },
];

const btnDark = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "14px 34px",
  background: "var(--text-1)",
  color: "var(--bg)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  whiteSpace: "nowrap" as const,
  transition: "opacity 0.12s",
};

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <header className="nav-sticky" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="lp-inner" style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.25em", color: "var(--text-1)" }}>GIROKU</span>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <a href="#scenes" style={{ fontSize: 13, color: "var(--text-2)", letterSpacing: "0.06em" }}>使い方</a>
            <a href="#pricing" style={{ fontSize: 13, color: "var(--text-2)", letterSpacing: "0.06em" }}>料金</a>
            <a href="#download" style={{ fontSize: 13, color: "var(--bg)", background: "var(--text-1)", padding: "9px 18px", fontWeight: 700, letterSpacing: "0.06em" }}>ダウンロード</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div
          className="lp-inner hero-grid"
          style={{ paddingTop: 96, paddingBottom: 84, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}
        >
          <div>
            <p style={{ fontSize: 12, letterSpacing: "0.18em", color: "var(--red)", marginBottom: 24, fontWeight: 700 }}>
              録音 · 文字起こし · AI議事録
            </p>
            <h1 style={{ fontSize: "clamp(32px, 4.6vw, 50px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: 24 }}>
              相手に気づかれず、<br />会話をまるごと記録。
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.85, maxWidth: 450, marginBottom: 36 }}>
              自分の声も、相手の声も。ネットがなくても、あなたのパソコンだけで。
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <a href="#download" style={btnDark}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                無料でダウンロード
              </a>
              <a href="#scenes" style={{ fontSize: 13, color: "var(--text-3)", letterSpacing: "0.03em" }}>使い方を見る →</a>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>1か月120分まで無料 · 登録不要ですぐ使える</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HeroDiagram />
          </div>
        </div>
      </section>

      {/* 3つのコアコンピタンス（インフォグラフィック） */}
      <section style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="lp-inner" style={{ paddingTop: 72, paddingBottom: 20 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--red)", fontWeight: 700 }}>Girokuだけの3つ</p>
        </div>
        <div className="lp-inner cards-3" style={{ paddingBottom: 72, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {pillars.map((p) => (
            <div key={p.title} className="pillar-col" style={{ padding: "8px 32px" }}>
              <div style={{ marginBottom: 20 }}><p.Icon /></div>
              <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-3)", marginBottom: 8 }}>{p.no}</p>
              <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.35, marginBottom: 12 }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.75 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scenes（利用シーン＋ベネフィット） */}
      <section id="scenes" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="lp-inner" style={{ paddingTop: 84, paddingBottom: 36 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--red)", marginBottom: 20, fontWeight: 700 }}>こんな場面で</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, maxWidth: 620 }}>
            話すだけで、<br />そのまま議事録になる。
          </h2>
        </div>
        <div className="lp-inner cards-3" style={{ paddingBottom: 88, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {scenes.map(({ Illust, tag, benefit, detail }) => (
            <div key={tag} style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "var(--surface)", padding: "22px 22px 8px", borderBottom: "1px solid var(--border)" }}>
                <Illust />
              </div>
              <div style={{ padding: "20px 22px 24px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--red)", fontWeight: 700, marginBottom: 10 }}>{tag}</p>
                <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, letterSpacing: "-0.01em", marginBottom: 8 }}>{benefit}</p>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="lp-inner" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--red)", marginBottom: 48, fontWeight: 700 }}>料金</p>
          <div className="pricing-grid">
            <div className="pricing-col" style={{ paddingRight: 56 }}>
              <p style={{ fontSize: 12, letterSpacing: "0.06em", color: "var(--text-3)", marginBottom: 24, fontWeight: 700 }}>無料</p>
              <p style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>¥0</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 36 }}>1か月あたり120分まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
                {["録音", "文字起こし", "だれの発言か自動で分ける", "記録の保存とコピー"].map((item) => (
                  <p key={item} style={{ fontSize: 13, color: "var(--text-2)" }}>— {item}</p>
                ))}
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>— AIで議事録を作成</p>
              </div>
              <a href="#download" style={{ display: "block", padding: "12px 0", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textAlign: "center" }}>
                無料で始める
              </a>
            </div>
            <div className="pricing-divider" style={{ background: "var(--border)" }} />
            <div className="pricing-col" style={{ paddingLeft: 56 }}>
              <p style={{ fontSize: 12, letterSpacing: "0.06em", color: "var(--red)", marginBottom: 24, fontWeight: 700 }}>有料</p>
              <p style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>¥980</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 36 }}>1年間ずっと · 3台まで使える</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
                {["録音（時間の制限なし）", "文字起こし（時間の制限なし）", "だれの発言か自動で分ける", "AIで議事録を作成"].map((item) => (
                  <p key={item} style={{ fontSize: 13, color: "var(--text-1)" }}>— {item}</p>
                ))}
              </div>
              <a href="https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747"
                style={{ display: "block", padding: "12px 0", background: "var(--text-1)", color: "var(--bg)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textAlign: "center", transition: "opacity 0.12s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                ¥980 で購入
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download">
        <div className="lp-inner" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 28 }}>
            今すぐ始める
          </h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
            <a href="https://github.com/naoyattsuji/giroku-releases/releases/latest" style={btnDark}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              macOS 用ダウンロード
            </a>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "14px 32px", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: 12, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              Windows版 — 準備中
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.7 }}>1か月あたり120分まで無料。はじめて使うときに、必要なデータ（約1.5GB）を自動でダウンロードします。</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div className="lp-inner" style={{ paddingTop: 20, paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>© {new Date().getFullYear()} Naoya Tsuji</span>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>プライバシー</Link>
            <Link href="/terms" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>利用規約</Link>
            <a href="mailto:naoyatttsuji@gmail.com" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>サポート</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
