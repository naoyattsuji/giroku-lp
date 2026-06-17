import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 — Giroku",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="mb-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← Giroku トップへ
        </Link>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-2">利用規約</h1>
      <p className="text-gray-500 text-sm mb-10">最終更新日：2026年6月18日</p>

      <div className="space-y-10 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第1条（適用）</h2>
          <p>
            本利用規約（以下「本規約」）は、辻直哉（以下「提供者」）が提供するGiroku（以下「本アプリ」）の
            利用に関する条件を定めるものです。ユーザーは本アプリをダウンロードまたは使用することにより、
            本規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第2条（利用条件）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>本アプリは個人利用を目的として提供されます。</li>
            <li>本アプリを使用して録音・文字起こしを行う際は、適用される法律および規則を遵守してください。</li>
            <li>会議等の録音については、参加者の同意を得るかどうかはユーザーの責任において判断してください。
              日本の法律では、会議の当事者が行う録音は原則として違法ではありませんが、各国・地域の法律が異なる場合があります。
            </li>
            <li>本アプリを違法な目的または他者を傷つける目的で使用することを禁じます。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第3条（禁止事項）</h2>
          <p className="mb-3">ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>本アプリのリバースエンジニアリング、逆コンパイル、逆アセンブル</li>
            <li>本アプリのライセンスキーの複製・転売・不正使用</li>
            <li>本アプリを使用した第三者のプライバシー侵害</li>
            <li>本アプリを使用した違法録音・盗聴</li>
            <li>本アプリの著作権表示の削除または改ざん</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第4条（有料プランとライセンス）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>有料プランのライセンスは購入日から1年間有効です。</li>
            <li>ライセンスは1人のユーザーが所有する最大3台のデバイスで使用できます。</li>
            <li>ライセンスキーの他者への譲渡・共有は禁止します。</li>
            <li>
              購入後のキャンセル・返金については、LemonSqueezyのポリシーに従います。
              技術的な問題により本アプリが正常に動作しない場合は、サポートへお問い合わせください。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第5条（免責事項）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>
              本アプリは「現状有姿」で提供されます。提供者は本アプリの完全性、正確性、
              特定目的への適合性について保証しません。
            </li>
            <li>
              文字起こしの精度は音声品質・話者・環境に依存します。
              提供者は文字起こし内容の正確性を保証しません。
            </li>
            <li>
              本アプリの使用により生じた損害（録音データの消失、文字起こしの誤りによる損害等）について、
              提供者は責任を負いません。
            </li>
            <li>
              ユーザーが本アプリを使用して行った録音に関する法的責任は、すべてユーザーが負うものとします。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第6条（知的財産権）</h2>
          <p>
            本アプリに関する著作権その他の知的財産権は提供者に帰属します。
            本規約に基づき付与されるのは、本アプリを使用する非独占的・非譲渡的な権利のみです。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第7条（規約の変更）</h2>
          <p>
            提供者は本規約を変更する場合があります。重要な変更はアプリ内または本サイトにて通知します。
            変更後の本アプリの使用継続をもって、変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第8条（準拠法・管轄）</h2>
          <p>
            本規約は日本法に準拠し、本規約に関する一切の紛争は東京地方裁判所を第一審の専属合意管轄裁判所とします。
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">第9条（お問い合わせ）</h2>
          <p>
            本規約に関するお問い合わせは{" "}
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
