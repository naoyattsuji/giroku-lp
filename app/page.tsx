import Link from "next/link";

const features = [
  {
    label: "STEALTH",
    title: "完全ステルス",
    desc: "録音ボットを会議に参加させません。Zoom・Meet・Teamsに一切通知されません。",
  },
  {
    label: "PRIVATE",
    title: "完全プライベート",
    desc: "音声データは外部サーバーに送信されません。文字起こしもAI処理もデバイス内で完結。",
  },
  {
    label: "JAPANESE",
    title: "日本語特化",
    desc: "OpenAI Whisperの日本語モデルをオンデバイスで実行。ネット環境に依存しない高精度な文字起こし。",
  },
  {
    label: "SPEAKER",
    title: "話者分離",
    desc: "自分の声（マイク）と相手の声（システム音声）を自動で分離。誰が何を言ったか一目瞭然。",
  },
  {
    label: "AI",
    title: "AI要約（有料）",
    desc: "Gemini AIが要点・決定事項・アクションアイテムを自動生成。会議後の議事録作成が0秒に。",
  },
  {
    label: "MINI",
    title: "ミニ表示",
    desc: "録音中は画面の隅に小さく常に前面表示。会議の邪魔になりません。",
  },
];

const steps = [
  { num: "01", title: "ダウンロード", desc: "DMG または EXE をインストール（1分）" },
  { num: "02", title: "モデル取得", desc: "初回起動時に Whisper モデル（1.5GB）を自動取得" },
  { num: "03", title: "会議を開始", desc: "録音ボタンを押してオンライン会議に参加するだけ" },
  { num: "04", title: "議事録完成", desc: "会議終了後、文字起こしと要約が自動生成される" },
];

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", color: "var(--text-1)" }}>GIROKU</span>
          <div style={{ display: "flex", gap: 32 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.08em", textDecoration: "none" }}>PRIVACY</Link>
            <Link href="/terms" style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.08em", textDecoration: "none" }}>TERMS</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 40px 80px", width: "100%" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.25em", color: "var(--red)", marginBottom: 24 }}>STEALTH MEETING RECORDER</p>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text-1)", marginBottom: 24 }}>
          会議の全て、<br />記録される。
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.8, maxWidth: 480, marginBottom: 48 }}>
          Zoom・Meet・Teams などのオンライン会議を、相手に一切通知せず録音・文字起こし。
          音声データはすべてデバイス内で処理されます。
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <a
            href="#download"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background: "var(--text-1)",
              color: "var(--bg)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textDecoration: "none",
            }}
          >
            無料でダウンロード
          </a>
          <a
            href="#features"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              fontSize: 11,
              letterSpacing: "0.15em",
              textDecoration: "none",
            }}
          >
            機能を見る
          </a>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>月120分まで無料 · macOS & Windows 対応</p>
      </section>

      {/* Features */}
      <section id="features" style={{ borderTop: "1px solid var(--border)", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 48 }}>FEATURES</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0" }}>
            {features.map((f, i) => (
              <div
                key={f.label}
                style={{
                  padding: "32px",
                  borderRight: (i + 1) % 3 !== 0 ? "1px solid var(--border)" : "none",
                  borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                }}
              >
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--text-3)", marginBottom: 16 }}>{f.label}</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ borderTop: "1px solid var(--border)", padding: "80px 40px", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 48 }}>HOW IT WORKS</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ padding: "32px", borderRight: i < steps.length - 1 ? "1px solid var(--border)" : "none" }}>
                <p style={{ fontSize: 32, fontWeight: 700, color: "var(--red)", fontFamily: "monospace", letterSpacing: "-0.02em", marginBottom: 16 }}>{s.num}</p>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ borderTop: "1px solid var(--border)", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 48 }}>PRICING</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid var(--border)", maxWidth: 720 }}>
            {/* Free */}
            <div style={{ padding: "40px", borderRight: "1px solid var(--border)" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--text-3)", marginBottom: 16 }}>FREE</p>
              <p style={{ fontSize: 40, fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", marginBottom: 4 }}>¥0</p>
              <p style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 32 }}>月120分まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                {["録音・文字起こし（月120分）", "話者分離（自分 / 相手）", "履歴・全文コピー"].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>—</span>
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>{item}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>—</span>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>AI要約</span>
                </div>
              </div>
              <a
                href="#download"
                style={{
                  display: "block",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                無料で始める
              </a>
            </div>

            {/* Paid */}
            <div style={{ padding: "40px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--red)", marginBottom: 16 }}>PAID</p>
              <p style={{ fontSize: 40, fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", marginBottom: 4 }}>¥980</p>
              <p style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 32 }}>1年間 買い切り · 3台まで</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                {["録音・文字起こし（無制限）", "話者分離（自分 / 相手）", "履歴・全文コピー", "AI要約（Gemini）", "3台まで使用可能"].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 10, color: "var(--text-1)", marginTop: 2 }}>—</span>
                    <span style={{ fontSize: 12, color: "var(--text-1)" }}>{item}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747"
                style={{
                  display: "block",
                  padding: "12px",
                  background: "var(--text-1)",
                  color: "var(--bg)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                ¥980 で購入
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" style={{ borderTop: "1px solid var(--border)", padding: "80px 40px", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 48 }}>DOWNLOAD</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>今すぐ始める</h2>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 40 }}>月120分まで無料。インストールして即使えます。</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 28px",
                border: "1px solid var(--border)",
                color: "var(--text-1)",
                fontSize: 12,
                letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 16 }}></span>
              macOS 用ダウンロード
            </a>
            <a
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 28px",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                fontSize: 12,
                letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 16 }}>⊞</span>
              Windows 用ダウンロード
            </a>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 16, letterSpacing: "0.05em" }}>macOS 12 以降 · Windows 10 以降</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.05em" }}>© 2026 Naoya Tsuji</span>
          <div style={{ display: "flex", gap: 32 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.05em" }}>PRIVACY</Link>
            <Link href="/terms" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.05em" }}>TERMS</Link>
            <a href="mailto:naoyatttsuji@gmail.com" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.05em" }}>SUPPORT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
