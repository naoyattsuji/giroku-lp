import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 — Giroku",
};

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", height: 56, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.1em", textDecoration: "none" }}>← GIROKU</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 40px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 20 }}>TERMS OF SERVICE</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>利用規約</h1>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 56, letterSpacing: "0.05em" }}>最終更新日：2026年6月18日</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第1条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>適用</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              本利用規約（以下「本規約」）は、辻直哉（以下「提供者」）が提供するGiroku（以下「本アプリ」）の
              利用に関する条件を定めるものです。ユーザーは本アプリをダウンロードまたは使用することにより、
              本規約に同意したものとみなします。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第2条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>利用条件</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "本アプリは個人利用を目的として提供されます。",
                "本アプリを使用して録音・文字起こしを行う際は、適用される法律および規則を遵守してください。",
                "会議等の録音については、参加者の同意を得るかどうかはユーザーの責任において判断してください。日本の法律では、会議の当事者が行う録音は原則として違法ではありませんが、各国・地域の法律が異なる場合があります。",
                "本アプリを違法な目的または他者を傷つける目的で使用することを禁じます。",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)", flexShrink: 0, fontFamily: "monospace", marginTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.8 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第3条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>禁止事項</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>ユーザーは以下の行為を行ってはなりません。</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "本アプリのリバースエンジニアリング、逆コンパイル、逆アセンブル",
                "本アプリのライセンスキーの複製・転売・不正使用",
                "本アプリを使用した第三者のプライバシー侵害",
                "本アプリを使用した違法録音・盗聴",
                "本アプリの著作権表示の削除または改ざん",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第4条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>有料プランとライセンス</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "有料プランのライセンスは購入日から1年間有効です。",
                "ライセンスは1人のユーザーが所有する最大3台のデバイスで使用できます。",
                "ライセンスキーの他者への譲渡・共有は禁止します。",
                "購入後のキャンセル・返金については、LemonSqueezyのポリシーに従います。技術的な問題により本アプリが正常に動作しない場合は、サポートへお問い合わせください。",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)", flexShrink: 0, fontFamily: "monospace", marginTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.8 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第5条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>免責事項</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "本アプリは「現状有姿」で提供されます。提供者は本アプリの完全性、正確性、特定目的への適合性について保証しません。",
                "文字起こしの精度は音声品質・話者・環境に依存します。提供者は文字起こし内容の正確性を保証しません。",
                "本アプリの使用により生じた損害（録音データの消失、文字起こしの誤りによる損害等）について、提供者は責任を負いません。",
                "ユーザーが本アプリを使用して行った録音に関する法的責任は、すべてユーザーが負うものとします。",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)", flexShrink: 0, fontFamily: "monospace", marginTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.8 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第6条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>知的財産権</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              本アプリに関する著作権その他の知的財産権は提供者に帰属します。
              本規約に基づき付与されるのは、本アプリを使用する非独占的・非譲渡的な権利のみです。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第7条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>規約の変更</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              提供者は本規約を変更する場合があります。重要な変更はアプリ内または本サイトにて通知します。
              変更後の本アプリの使用継続をもって、変更後の規約に同意したものとみなします。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第8条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>準拠法・管轄</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              本規約は日本法に準拠し、本規約に関する一切の紛争は東京地方裁判所を第一審の専属合意管轄裁判所とします。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>第9条</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>お問い合わせ</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              本規約に関するお問い合わせは{" "}
              <a href="mailto:naoyatttsuji@gmail.com" style={{ color: "var(--text-1)", textDecoration: "underline" }}>
                naoyatttsuji@gmail.com
              </a>{" "}
              までご連絡ください。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
