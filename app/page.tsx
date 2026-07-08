"use client";

import Link from "next/link";
import {
  HeroDiagram,
  SceneOnline,
  SceneMeeting,
  SceneLecture,
  IconNoBot,
  IconLocal,
  IconSpeaker,
} from "./components/Illustrations";

const scenes = [
  {
    Illust: SceneOnline,
    tag: "オンライン会議",
    benefit: "Zoom・Meet・Teams の音声をそのまま議事録に。",
    detail: "ボットを参加させないので、会議の空気を壊さない。",
  },
  {
    Illust: SceneMeeting,
    tag: "対面のワーク・1on1",
    benefit: "端末を置くだけで、対面の打ち合わせも記録。",
    detail: "メモを取らずに会話へ集中。あとで全文を見返せる。",
  },
  {
    Illust: SceneLecture,
    tag: "大学の講義",
    benefit: "講義を録って、復習用ノートに。",
    detail: "板書と話に集中。聞き逃しをゼロに。",
  },
];

const features = [
  { Icon: IconNoBot, title: "録音ボット不要", desc: "会議にボットを入れず、デバイス内だけで記録。" },
  { Icon: IconLocal, title: "ローカル完結", desc: "音声は外部サーバーに送信されない。" },
  { Icon: IconSpeaker, title: "話者分離", desc: "自分と相手の声を自動で分けて文字起こし。" },
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
        <div className="lp-inner" style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "var(--text-1)" }}>GIROKU</span>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="#scenes" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" }}>使い方</a>
            <a href="#pricing" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" }}>料金</a>
            <a href="#download" style={{ fontSize: 11, color: "var(--text-1)", fontWeight: 700, letterSpacing: "0.08em" }}>ダウンロード</a>
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
            <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "var(--red)", marginBottom: 28, fontWeight: 700 }}>
              STEALTH MEETING RECORDER
            </p>
            <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 24 }}>
              会議の記録を、<br />相手に知られず。
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.8, maxWidth: 420, marginBottom: 36 }}>
              録音ボットなし。あなたのデバイス内だけで、会話を文字起こし。
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
            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>月 120 分まで無料 · クレジットカード不要</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HeroDiagram />
          </div>
        </div>
      </section>

      {/* Features（アイコン3枚・少文字） */}
      <section style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="lp-inner cards-3" style={{ paddingTop: 56, paddingBottom: 56, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
          {features.map((f) => (
            <div key={f.title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <f.Icon />
              <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scenes（利用シーン＋ベネフィット） */}
      <section id="scenes" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="lp-inner" style={{ paddingTop: 84, paddingBottom: 36 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.35em", color: "var(--text-3)", marginBottom: 20 }}>USE CASES</p>
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
          <p style={{ fontSize: 10, letterSpacing: "0.35em", color: "var(--text-3)", marginBottom: 56 }}>PRICING</p>
          <div className="pricing-grid">
            <div className="pricing-col" style={{ paddingRight: 56 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 28 }}>FREE</p>
              <p style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>¥0</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 36 }}>月 120 分まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
                {["録音・文字起こし", "話者分離（自分/相手）", "履歴・全文コピー"].map((item) => (
                  <p key={item} style={{ fontSize: 13, color: "var(--text-2)" }}>— {item}</p>
                ))}
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>— AI 要約</p>
              </div>
              <a href="#download" style={{ display: "block", padding: "12px 0", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textAlign: "center" }}>
                無料で始める
              </a>
            </div>
            <div className="pricing-divider" style={{ background: "var(--border)" }} />
            <div className="pricing-col" style={{ paddingLeft: 56 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--red)", marginBottom: 28 }}>PAID</p>
              <p style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>¥980</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 36 }}>1 年間 · 3 台まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
                {["録音・文字起こし（無制限）", "話者分離（自分/相手）", "履歴・全文コピー", "AI 要約（Gemini）"].map((item) => (
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
              Windows — 準備中
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)" }}>月 120 分まで無料 · 初回起動時に文字起こしモデル（約 1.5 GB）を自動ダウンロード</p>
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
