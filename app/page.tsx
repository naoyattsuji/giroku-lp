"use client";

import Link from "next/link";
import {
  SceneOnline,
  SceneMeeting,
  SceneLecture,
  IconStealth,
  IconBothVoices,
  IconOffline,
  LogoMark,
} from "./components/Illustrations";
import { AppMock } from "./components/AppMock";

const scenes = [
  { Illust: SceneOnline, tag: "オンライン会議", benefit: "そのまま記録。" },
  { Illust: SceneMeeting, tag: "対面・1対1", benefit: "置くだけで記録。" },
  { Illust: SceneLecture, tag: "講義・授業", benefit: "録って、見返す。" },
];

const pillars = [
  {
    Icon: IconStealth,
    title: "相手に気づかれない",
    desc: "あなたのパソコンの中だけで録るので、相手に通知は出ません。",
  },
  {
    Icon: IconBothVoices,
    title: "マイクもパソコンの音も",
    desc: "周りの声（マイク）と、通話・動画の音（パソコンの音）を両方録れます。",
  },
  {
    Icon: IconOffline,
    title: "ネットがなくても使える",
    desc: "インターネットにつながっていなくても使えます。",
  },
];

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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <LogoMark size={22} />
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
            <p style={{ display: "inline-flex", fontSize: 12, letterSpacing: "0.02em", color: "var(--red)", marginBottom: 22, fontWeight: 700, background: "rgba(232,25,44,0.08)", padding: "5px 12px", borderRadius: 999 }}>
              録音 · 文字起こし · AI議事録
            </p>
            <h1 style={{ fontSize: "clamp(32px, 3.6vw, 44px)", fontWeight: 800, lineHeight: 1.28, letterSpacing: "-0.03em", marginBottom: 22, color: "var(--text-1)" }}>
              相手に気づかれず、<br />会話をまるごと記録。
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
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AppMock />
          </div>
        </div>
      </section>

      {/* 3つのコアコンピタンス */}
      <section style={{ background: "var(--surface-2)" }}>
        <div className="lp-inner" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <p style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--red)", fontWeight: 700, marginBottom: 12 }}>Girokuだけの3つ</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 44, color: "var(--text-1)" }}>
            他にはない、3つの理由。
          </h2>
          <div className="cards-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {pillars.map((p) => (
              <div key={p.title} className="lp-card" style={{ padding: "30px 26px" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 22,
                  }}
                >
                  <p.Icon />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: 10, color: "var(--text-1)" }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenes */}
      <section id="scenes" style={{ background: "var(--bg)" }}>
        <div className="lp-inner" style={{ paddingTop: 88, paddingBottom: 36 }}>
          <p style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--red)", marginBottom: 12, fontWeight: 700 }}>こんな場面で</p>
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25, maxWidth: 620, color: "var(--text-1)" }}>
            話すだけで、そのまま議事録になる。
          </h2>
        </div>
        <div className="lp-inner cards-3" style={{ paddingBottom: 92, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {scenes.map(({ Illust, tag, benefit }) => (
            <div key={tag} className="lp-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "var(--surface-2)", padding: "26px 24px 12px" }}>
                <Illust />
              </div>
              <div style={{ padding: "18px 22px 22px", display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 700 }}>{tag}</span>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-1)" }}>{benefit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: "var(--surface-2)" }}>
        <div className="lp-inner" style={{ paddingTop: 88, paddingBottom: 92 }}>
          <p style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--red)", marginBottom: 44, fontWeight: 700 }}>料金</p>
          <div className="pricing-grid">
            <div className="lp-card" style={{ padding: "34px 32px" }}>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 18, fontWeight: 700 }}>無料</p>
              <p style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6, color: "var(--text-1)" }}>¥0</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 30 }}>1か月あたり120分まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 32 }}>
                {["録音", "文字起こし", "だれの発言か自動で分ける", "記録の保存とコピー"].map((item) => (
                  <p key={item} style={{ fontSize: 13.5, color: "var(--text-2)" }}>— {item}</p>
                ))}
                <p style={{ fontSize: 13.5, color: "var(--text-3)" }}>— AIで議事録を作成</p>
              </div>
              <a href="#download" style={{ display: "block", padding: "13px 0", background: "var(--surface-2)", color: "var(--text-1)", fontSize: 14, fontWeight: 700, borderRadius: 999, textAlign: "center" }}>
                無料で始める
              </a>
            </div>
            <div className="lp-card" style={{ padding: "34px 32px", border: "2px solid var(--red)" }}>
              <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 18, fontWeight: 700 }}>有料</p>
              <p style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6, color: "var(--text-1)" }}>¥980</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 30 }}>1年間ずっと · 3台まで使える</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 32 }}>
                {["録音（時間の制限なし）", "文字起こし（時間の制限なし）", "だれの発言か自動で分ける", "AIで議事録を作成"].map((item) => (
                  <p key={item} style={{ fontSize: 13.5, color: "var(--text-1)" }}>— {item}</p>
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
        </div>
      </section>

      {/* Download */}
      <section id="download" style={{ background: "var(--bg)" }}>
        <div className="lp-inner" style={{ paddingTop: 92, paddingBottom: 92, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 4.4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 28, color: "var(--text-1)" }}>
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
