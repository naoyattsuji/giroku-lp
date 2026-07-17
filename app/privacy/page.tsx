import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー — Giroku",
  description: "Giroku のプライバシーポリシー。録音データはデバイス内に保存されます。AI要約を使用した場合のみ文字起こしテキストが外部サービスへ送信されます。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", height: 56, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.1em", textDecoration: "none" }}>← GIROKU</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 40px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--text-3)", marginBottom: 20 }}>PRIVACY POLICY</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>プライバシーポリシー</h1>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 56, letterSpacing: "0.05em" }}>最終更新日：2026年7月15日</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>01</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>基本方針</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              Giroku（以下「本アプリ」）は、ユーザーのプライバシーを最大限に尊重します。
              本アプリはオフライン処理を基本設計とし、録音した音声データはデバイス内のみで処理されます。
              AI要約機能を使用した場合に限り、文字起こしテキストが外部AIサービスへ送信されることがあります。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>02</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>収集する情報</h2>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 12, letterSpacing: "0.08em" }}>デバイス上にのみ保存される情報</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {["録音した音声データ（.webm形式）", "音声の文字起こし・AI議事録・AIとの会話履歴（JSON形式）", "使用時間・設定・学習語彙の記録", "ライセンスキー（OSの安全な保管機能で暗号化）", "クラッシュ診断ファイル（外部へ自動送信しません）"].map((item) => (
                <div key={item} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{item}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.8, marginBottom: 24 }}>
              上記のデータはすべて{" "}
              <code style={{ fontFamily: "monospace", color: "var(--text-2)", fontSize: 11 }}>~/Library/Application Support/Giroku/</code>（macOS）または{" "}
              <code style={{ fontFamily: "monospace", color: "var(--text-2)", fontSize: 11 }}>%APPDATA%\Giroku\</code>（Windows）に保存され、ユーザー自身が管理します。
            </p>

            <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 12, letterSpacing: "0.08em" }}>外部に送信される情報</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {["ライセンス認証時：ライセンスキーおよび端末名（LemonSqueezy）", "無料AI機能使用時：個人情報を含まないランダムな匿名端末ID（利用制限と濫用防止のため）", "AI機能使用時：文字起こしテキスト、現在の議事録、編集指示（Vercel上のGiroku API）。AI処理に必要なテキストだけをGoogle Gemini APIへ送信", "文字起こしモデル取得時：通信情報（Hugging Face）", "アプリ更新確認時：バージョン・通信情報（GitHub Releases）"].map((item) => (
                <div key={item} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{item}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)" }}>※音声データは外部に送信されません。AI要約はテキスト化後のみ送信されます。</p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>03</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>データの利用目的</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["音声の文字起こし処理（すべてデバイス内で実行）", "AI議事録・質問・修正の生成（Gemini APIを使用）", "使用量の制限管理（無料プランの月120分・AI議事録月2件・各10回）", "ライセンスの有効性確認", "アプリの自動更新"].map((item) => (
                <div key={item} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>04</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>第三者への提供</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9, marginBottom: 16 }}>
              収集した個人情報を、法令に基づく場合を除き、第三者に提供することはありません。
              ただし、以下のサービスはユーザーの操作に応じてデータを受信します。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}><strong style={{ color: "var(--text-1)", fontWeight: 500 }}>LemonSqueezy</strong>：ライセンス購入・認証時（決済情報・デバイスID）</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}><strong style={{ color: "var(--text-1)", fontWeight: 500 }}>Vercel</strong>：Giroku APIの提供（文字起こしテキスト、ライセンスキー、IPアドレス等の通信情報）</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}><strong style={{ color: "var(--text-1)", fontWeight: 500 }}>Google Gemini API</strong>：AI要約生成時（文字起こしテキスト）</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}><strong style={{ color: "var(--text-1)", fontWeight: 500 }}>Hugging Face / GitHub</strong>：モデル取得・更新確認時（IPアドレス等の通信情報）</span>
              </div>
            </div>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>05</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>データの削除</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              録音データおよびすべての設定は、アプリのデータディレクトリを削除することで完全に消去できます。
              アプリ自体のアンインストール後も、データディレクトリは残る場合があります。
              外部サービスへ送信されたデータや通信ログは、各サービスの規約・プライバシーポリシーに従って取り扱われます。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>06</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>セキュリティ</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              ライセンスキーはOSのキーチェーン等を利用して暗号化して保存されます。AIサービスのAPIキーは本アプリ内に保存せず、Girokuのサーバー側で管理します。
              ただし、本アプリは個人利用を前提としており、エンタープライズグレードのセキュリティ要件には
              対応していない場合があります。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>07</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>ポリシーの変更</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              本ポリシーは予告なく変更される場合があります。重要な変更がある場合はアプリ内でお知らせします。
            </p>
          </section>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <section>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--red)", fontFamily: "monospace", marginBottom: 16 }}>08</p>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>お問い合わせ</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.9 }}>
              プライバシーに関するお問い合わせは{" "}
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
