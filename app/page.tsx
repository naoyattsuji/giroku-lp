import Link from "next/link";

const features = [
  {
    label: "STEALTH",
    title: "完全ステルス",
    desc: "録音ボットを会議に参加させません。Zoom・Meet・Teams に一切通知されません。",
  },
  {
    label: "PRIVATE",
    title: "完全プライベート",
    desc: "音声データは外部サーバーに送信されません。文字起こしも AI 処理もデバイス内で完結。",
  },
  {
    label: "JAPANESE",
    title: "日本語特化",
    desc: "OpenAI Whisper の日本語モデルをオンデバイスで実行。ネット環境に依存しない高精度な文字起こし。",
  },
  {
    label: "SPEAKER",
    title: "話者分離",
    desc: "自分の声（マイク）と相手の声（システム音声）を自動で分離。誰が何を言ったか一目瞭然。",
  },
  {
    label: "AI",
    title: "AI 要約（有料）",
    desc: "Gemini AI が要点・決定事項・アクションアイテムを自動生成。会議後の議事録作成が 0 秒に。",
  },
  {
    label: "MINI",
    title: "ミニ表示",
    desc: "録音中は画面の隅に小さく常に前面表示。Zoom などの会議ウィンドウの邪魔になりません。",
  },
];

const steps = [
  { num: "01", title: "ダウンロード", desc: "DMG または EXE をダウンロードしてインストール（約1分）" },
  { num: "02", title: "モデル取得", desc: "初回起動時に Whisper モデル（1.5 GB）を自動取得" },
  { num: "03", title: "会議を開始", desc: "録音ボタンを押してオンライン会議に参加するだけ" },
  { num: "04", title: "議事録完成", desc: "会議終了後、文字起こしと要約が自動で生成される" },
];

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", color: "var(--text-1)" }}>GIROKU</span>
          <div style={{ display: "flex", gap: 32 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textDecoration: "none" }} className="btn-outline">PRIVACY</Link>
            <Link href="/terms" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textDecoration: "none" }} className="btn-outline">TERMS</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mobile-hero" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 40px 80px", width: "100%", boxSizing: "border-box" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "var(--red)", marginBottom: 28, textTransform: "uppercase" }}>Stealth Meeting Recorder</p>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text-1)", marginBottom: 28 }}>
          会議の全て、<br />記録される。
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.5vw, 16px)", color: "var(--text-2)", lineHeight: 1.9, maxWidth: 500, marginBottom: 48 }}>
          Zoom・Meet・Teams などのオンライン会議を、相手に一切通知せず録音・文字起こし。
          音声データはすべてデバイス内で処理されます。
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <a
            href="#download"
            className="btn-primary"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "var(--text-1)",
              color: "var(--bg)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            無料でダウンロード
          </a>
          <a
            href="#pricing"
            className="btn-outline"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            料金を見る
          </a>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>月120分まで無料 · macOS & Windows 対応</p>
      </section>

      {/* Features */}
      <section id="features" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mobile-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 0" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: 40, textTransform: "uppercase" }}>Features</p>
        </div>
        <div className="grid-border grid-3" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          {features.map((f) => (
            <div key={f.label} style={{ padding: "36px 40px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 16 }}>{f.label}</p>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 12, lineHeight: 1.4 }}>{f.title}</h3>
              <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.9 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="mobile-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 0" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: 40 }}>HOW IT WORKS</p>
        </div>
        <div className="grid-border grid-border-surface grid-4" style={{ borderTop: "1px solid var(--border)" }}>
          {steps.map((s) => (
            <div key={s.num} style={{ padding: "36px 40px" }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--red)", fontFamily: "monospace", letterSpacing: "-0.02em", marginBottom: 20 }}>{s.num}</p>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.8 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="mobile-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 0" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: 40 }}>PRICING</p>
        </div>
        <div className="grid-border grid-2" style={{ borderTop: "1px solid var(--border)", maxWidth: 760, marginLeft: 0 }}>
          {/* Free */}
          <div style={{ padding: "48px 40px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 20 }}>FREE</p>
            <p style={{ fontSize: 44, fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", lineHeight: 1, marginBottom: 8 }}>¥0</p>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 36 }}>月120分まで</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              {["録音・文字起こし（月120分）", "話者分離（自分 / 相手）", "履歴・全文コピー"].map((item) => (
                <div key={item} style={{ display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 10, color: "var(--text-2)", flexShrink: 0, marginTop: 3 }}>—</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{ fontSize: 10, color: "var(--text-3)", flexShrink: 0, marginTop: 3 }}>—</span>
                <span style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>AI 要約</span>
              </div>
            </div>
            <a
              href="#download"
              style={{
                display: "block",
                padding: "13px 0",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              無料で始める
            </a>
          </div>

          {/* Paid */}
          <div style={{ padding: "48px 40px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--red)", marginBottom: 20 }}>PAID</p>
            <p style={{ fontSize: 44, fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", lineHeight: 1, marginBottom: 8 }}>¥980</p>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 36 }}>1年間 買い切り · 3台まで利用可</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              {["録音・文字起こし（無制限）", "話者分離（自分 / 相手）", "履歴・全文コピー", "AI 要約（Gemini）", "3台まで同時利用可"].map((item) => (
                <div key={item} style={{ display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 10, color: "var(--text-1)", flexShrink: 0, marginTop: 3 }}>—</span>
                  <span style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <a
              href="https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747"
              style={{
                display: "block",
                padding: "13px 0",
                background: "var(--text-1)",
                color: "var(--bg)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              ¥980 で購入
            </a>
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="mobile-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 40px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--text-3)", marginBottom: 32 }}>DOWNLOAD</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 16 }}>今すぐ始める</h2>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 40, lineHeight: 1.7 }}>
            月120分まで無料。クレジットカード不要。インストールして即使えます。
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 28px",
                border: "1px solid var(--border)",
                color: "var(--text-1)",
                fontSize: 12,
                letterSpacing: "0.08em",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}></span>
              macOS 用ダウンロード
            </a>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 28px",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                fontSize: 12,
                letterSpacing: "0.08em",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1, fontFamily: "monospace" }}>⊞</span>
              Windows 用ダウンロード
            </a>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>macOS 12 以降 · Windows 10 以降</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>© 2026 Naoya Tsuji</span>
          <div style={{ display: "flex", gap: 28 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.08em" }}>PRIVACY</Link>
            <Link href="/terms" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.08em" }}>TERMS</Link>
            <a href="mailto:naoyatttsuji@gmail.com" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.08em" }}>SUPPORT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
