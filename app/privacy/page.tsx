import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー — Giroku",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="mb-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← Giroku トップへ
        </Link>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-2">プライバシーポリシー</h1>
      <p className="text-gray-500 text-sm mb-10">最終更新日：2026年6月18日</p>

      <div className="prose prose-invert max-w-none space-y-10 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">1. 基本方針</h2>
          <p>
            Giroku（以下「本アプリ」）は、ユーザーのプライバシーを最大限に尊重します。
            本アプリはオフライン処理を基本設計とし、録音した音声データおよび文字起こしデータを
            外部サーバーに送信することは一切ありません。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">2. 収集する情報</h2>
          <h3 className="text-gray-200 font-medium mb-2">2-1. デバイス上にのみ保存される情報</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>録音した音声データ（.webm形式）</li>
            <li>音声の文字起こしデータ（JSON形式）</li>
            <li>使用時間の記録（月別・分単位）</li>
            <li>ライセンスキー（暗号化して保存）</li>
            <li>Gemini APIキー（有料プランのみ・暗号化して保存）</li>
          </ul>
          <p className="mt-3">
            上記のデータはすべて
            <code className="bg-gray-800 px-1 rounded text-xs">~/Library/Application Support/Giroku/</code>（macOS）
            または
            <code className="bg-gray-800 px-1 rounded text-xs">%APPDATA%\Giroku\</code>（Windows）
            に保存され、ユーザー自身が管理します。
          </p>

          <h3 className="text-gray-200 font-medium mb-2 mt-6">2-2. 外部に送信される情報</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>ライセンス認証時：ライセンスキーおよびデバイスID（LemonSqueezy社のサーバー）</li>
            <li>AI要約機能使用時：文字起こしテキスト（Google Gemini APIサーバー）※有料プランのみ</li>
            <li>アプリ更新確認時：バージョン情報（GitHub Releases）</li>
          </ul>
          <p className="mt-3 text-gray-500">
            ※音声データは外部に送信されません。AI要約はテキスト化後のみ送信されます。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">3. データの利用目的</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>音声の文字起こし処理（すべてデバイス内で実行）</li>
            <li>AI要約の生成（有料プランのみ・Gemini APIを使用）</li>
            <li>使用量の制限管理（無料プランの月120分上限）</li>
            <li>ライセンスの有効性確認</li>
            <li>アプリの自動更新</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">4. 第三者への提供</h2>
          <p>
            収集した個人情報を、法令に基づく場合を除き、第三者に提供することはありません。
            ただし、以下のサービスはユーザーの操作に応じてデータを受信します。
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 mt-3">
            <li>
              <strong className="text-gray-300">LemonSqueezy</strong>：ライセンス購入・認証時（決済情報・デバイスID）
            </li>
            <li>
              <strong className="text-gray-300">Google Gemini API</strong>：AI要約生成時（文字起こしテキスト）
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">5. データの削除</h2>
          <p>
            録音データおよびすべての設定は、アプリのデータディレクトリを削除することで完全に消去できます。
            アプリ自体のアンインストール後も、データディレクトリは残る場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">6. セキュリティ</h2>
          <p>
            ライセンスキーおよびAPIキーはOSのキーチェーンまたは暗号化ストアに保存されます。
            ただし、本アプリは個人利用を前提としており、エンタープライズグレードのセキュリティ要件には
            対応していない場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">7. ポリシーの変更</h2>
          <p>
            本ポリシーは予告なく変更される場合があります。重要な変更がある場合はアプリ内でお知らせします。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">8. お問い合わせ</h2>
          <p>
            プライバシーに関するお問い合わせは{" "}
            <a href="mailto:naoyatttsuji@gmail.com" className="text-blue-400 hover:text-blue-300">
              naoyatttsuji@gmail.com
            </a>{" "}
            までご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
