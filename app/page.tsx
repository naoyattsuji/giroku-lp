import Link from "next/link";

const pillars = [
  {
    tag: "STEALTH",
    title: "相手に通知されない",
    desc: "録音ボットを会議に参加させません。Zoom・Meet・Teams は、あなたが録音していることを知りません。",
  },
  {
    tag: "PRIVATE",
    title: "完全オフライン処理",
    desc: "音声データは外部サーバーに送信されません。Whisper による文字起こしも、すべてデバイス内で完結します。",
  },
  {
    tag: "JAPANESE",
    title: "日本語特化・話者分離",
    desc: "OpenAI Whisper の日本語モデルをオンデバイス実行。自分の声と相手の声を自動で分けて記録します。",
  },
];

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <header className="nav-sticky" style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em" }}>GIROKU</span>
          <a
            href="#download"
            className="btn-primary"
            style={{ display: "inline-block", padding: "8px 20px", background: "var(--text-1)", color: "var(--bg)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}
          >
            ダウンロード →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className="mobile-hero"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 40px 88px", width: "100%", boxSizing: "border-box" }}
      >
        <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "var(--red)", marginBottom: 36, fontWeight: 600, textTransform: "uppercase" }}>
          Stealth Meeting Recorder
        </p>
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 88px)",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: 36,
          }}
        >
          会議の記録を、<br />静かに。
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 1.5vw, 17px)",
            color: "var(--text-2)",
            lineHeight: 1.85,
            maxWidth: 440,
            marginBottom: 52,
          }}
        >
          Zoom・Meet・Teams を、相手に気づかれずに録音・文字起こし。
          音声データはすべてデバイス内で処理されます。
        </p>
        <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          <a
            href="#download"
            className="btn-primary"
            style={{ display: "inline-block", padding: "14px 36px", background: "var(--text-1)", color: "var(--bg)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}
          >
            無料でダウンロード
          </a>
          <a
            href="#pricing"
            className="btn-ghost"
            style={{ fontSize: 13, color: "var(--text-2)", letterSpacing: "0.03em" }}
          >
            料金を見る →
          </a>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 24, letterSpacing: "0.05em" }}>
          月120分まで無料 · macOS 対応 · クレジットカード不要
        </p>
      </section>

      {/* Three Pillars */}
      <section style={{ borderTop: "1px solid var(--border)" }}>
        <div className="cols-3" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {pillars.map((p, i) => (
            <div
              key={p.tag}
              className={i > 0 ? "col-border-left" : ""}
              style={{ padding: "52px 40px", borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}
            >
              <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "var(--red)", marginBottom: 24, fontWeight: 600 }}>{p.tag}</p>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.4 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="mobile-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 40px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: 52 }}>PRICING</p>
          <div
            className="cols-2"
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 680, gap: "1px", background: "var(--border)" }}
          >
            {/* Free */}
            <div style={{ padding: "48px 40px", background: "var(--surface)" }}>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: 28 }}>FREE</p>
              <p style={{ fontSize: 52, fontWeight: 700, fontFamily: "monospace", lineHeight: 1, marginBottom: 8 }}>¥0</p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 40 }}>月 120 分まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 48 }}>
                {["録音・文字起こし", "話者分離（自分 / 相手）", "履歴・全文コピー"].map((item) => (
                  <p key={item} style={{ fontSize: 13, color: "var(--text-2)" }}>— {item}</p>
                ))}
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>— AI 要約</p>
              </div>
              <a
                href="#download"
                style={{ display: "block", padding: "12px 0", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textAlign: "center" }}
              >
                無料で始める
              </a>
            </div>
            {/* Paid */}
            <div style={{ padding: "48px 40px", background: "var(--surface)" }}>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "var(--red)", marginBottom: 28 }}>PAID</p>
              <p style={{ fontSize: 52, fontWeight: 700, fontFamily: "monospace", lineHeight: 1, marginBottom: 8 }}>¥980</p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 40 }}>1 年間 · 3 台まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 48 }}>
                {["録音・文字起こし（無制限）", "話者分離（自分 / 相手）", "履歴・全文コピー", "AI 要約（Gemini）"].map((item) => (
                  <p key={item} style={{ fontSize: 13 }}>— {item}</p>
                ))}
              </div>
              <a
                href="https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747"
                className="btn-primary"
                style={{ display: "block", padding: "12px 0", background: "var(--text-1)", color: "var(--bg)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textAlign: "center" }}
              >
                ¥980 で購入
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download">
        <div className="mobile-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 40px" }}>
          <h2
            style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            今すぐ始める
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 52, lineHeight: 1.7 }}>
            月120分まで無料。クレジットカード不要。
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <a
              href="https://github.com/naoyatsuji/giroku-releases/releases/latest"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", background: "var(--text-1)", color: "var(--bg)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap" }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}></span>
              macOS 用ダウンロード
            </a>
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: 12, letterSpacing: "0.08em", whiteSpace: "nowrap" }}
            >
              <span style={{ fontFamily: "monospace" }}>⊞</span>
              Windows — 準備中
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)" }}>
            初回起動時に Whisper モデル（約 1.5 GB）を自動ダウンロードします
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div
          style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}
        >
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
