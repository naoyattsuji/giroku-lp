import Link from "next/link";

const features = [
  {
    num: "01",
    title: "相手に通知されない",
    desc: "録音ボットを会議に参加させません。Zoom・Meet・Teams はあなたが録音していることを知りません。",
  },
  {
    num: "02",
    title: "完全オフライン処理",
    desc: "音声データは外部サーバーに送信されません。Whisper による文字起こしもすべてデバイス内で完結します。",
  },
  {
    num: "03",
    title: "日本語特化・話者分離",
    desc: "OpenAI Whisper の日本語モデルをオンデバイス実行。自分の声と相手の声を自動で分けて記録します。",
  },
];

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <header className="nav-sticky" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="lp-inner" style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "var(--text-1)" }}>GIROKU</span>
          <a href="#download" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", transition: "color 0.12s" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-1)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-3)")}
          >
            ダウンロード
          </a>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div className="lp-inner" style={{ paddingTop: 120, paddingBottom: 100 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "var(--red)", marginBottom: 52, fontWeight: 600 }}>
            STEALTH MEETING RECORDER
          </p>
          <h1
            style={{
              fontSize: "clamp(52px, 9vw, 108px)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              marginBottom: 48,
            }}
          >
            会議の記録を、<br />
            相手に知られず。
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-2)",
              lineHeight: 1.85,
              maxWidth: 460,
              marginBottom: 56,
            }}
          >
            Zoom・Meet・Teams の音声を相手に気づかれずに録音・文字起こし。
            音声データはすべてデバイス内で処理されます。
          </p>
          <div style={{ display: "flex", gap: 36, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <a
              href="#download"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                background: "var(--text-1)",
                color: "var(--bg)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                transition: "opacity 0.12s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              macOS 用ダウンロード
            </a>
            <a href="#pricing" style={{ fontSize: 13, color: "var(--text-3)", letterSpacing: "0.03em", transition: "color 0.12s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-1)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-3)")}
            >
              料金を見る →
            </a>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>
            月 120 分まで無料 · クレジットカード不要
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderTop: "1px solid var(--border)" }}>
        {features.map((f, i) => (
          <div key={f.num} style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="lp-inner feature-row" style={{ paddingTop: 48, paddingBottom: 48 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-3)", fontFamily: "monospace", paddingTop: 3 }}>
                {f.num}
              </p>
              <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.45, letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.9 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="lp-inner" style={{ paddingTop: 100, paddingBottom: 100 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.35em", color: "var(--text-3)", marginBottom: 72 }}>PRICING</p>
          <div className="pricing-grid">
            {/* Free */}
            <div className="pricing-col" style={{ paddingRight: 56 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 32 }}>FREE</p>
              <p style={{ fontSize: 60, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>¥0</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 44 }}>月 120 分まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 52 }}>
                {["録音・文字起こし", "話者分離（自分/相手）", "履歴・全文コピー"].map((item) => (
                  <p key={item} style={{ fontSize: 13, color: "var(--text-2)" }}>— {item}</p>
                ))}
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>— AI 要約</p>
              </div>
              <a
                href="#download"
                style={{
                  display: "block",
                  padding: "12px 0",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textAlign: "center",
                  transition: "border-color 0.12s, color 0.12s",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--text-1)"; el.style.color = "var(--text-1)" }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-2)" }}
              >
                無料で始める
              </a>
            </div>

            {/* Divider */}
            <div className="pricing-divider" style={{ background: "var(--border)" }} />

            {/* Paid */}
            <div className="pricing-col" style={{ paddingLeft: 56 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--red)", marginBottom: 32 }}>PAID</p>
              <p style={{ fontSize: 60, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>¥980</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 44 }}>1 年間 · 3 台まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 52 }}>
                {["録音・文字起こし（無制限）", "話者分離（自分/相手）", "履歴・全文コピー", "AI 要約（Gemini）"].map((item) => (
                  <p key={item} style={{ fontSize: 13, color: "var(--text-1)" }}>— {item}</p>
                ))}
              </div>
              <a
                href="https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747"
                style={{
                  display: "block",
                  padding: "12px 0",
                  background: "var(--text-1)",
                  color: "var(--bg)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textAlign: "center",
                  transition: "opacity 0.12s",
                }}
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
        <div className="lp-inner" style={{ paddingTop: 100, paddingBottom: 100 }}>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            今すぐ始める
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 52, lineHeight: 1.7 }}>
            月 120 分まで無料。クレジットカード不要。
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <a
              href="https://github.com/naoyatsuji/giroku-releases/releases/latest"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 32px",
                background: "var(--text-1)",
                color: "var(--bg)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
                transition: "opacity 0.12s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              <span style={{ fontSize: 15 }}></span>
              macOS 用ダウンロード
            </a>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 32px",
                border: "1px solid var(--border)",
                color: "var(--text-3)",
                fontSize: 12,
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}
            >
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
          className="lp-inner"
          style={{ paddingTop: 20, paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
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
