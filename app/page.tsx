import Link from "next/link";

const features = [
  {
    icon: "🕵️",
    title: "完全ステルス",
    desc: "録音ボットを会議に参加させません。相手のZoom・Meet・Teamsには一切通知されません。",
  },
  {
    icon: "🔒",
    title: "完全プライベート",
    desc: "音声データは外部サーバーに送信されません。文字起こしもAI処理もすべてあなたのデバイス内で完結。",
  },
  {
    icon: "🇯🇵",
    title: "日本語特化",
    desc: "OpenAI Whisperの日本語モデルをオンデバイスで実行。ネット環境に関わらず高精度な文字起こし。",
  },
  {
    icon: "👥",
    title: "話者分離",
    desc: "自分の声（マイク）と相手の声（システム音声）を自動で分けて表示。誰が何を言ったか一目瞭然。",
  },
  {
    icon: "✨",
    title: "AI要約（有料）",
    desc: "Gemini AIが要点・決定事項・アクションアイテムを箇条書きで自動生成。会議後の議事録作成が0秒に。",
  },
  {
    icon: "🪟",
    title: "ミニ表示",
    desc: "録音中は画面の隅に小さなウィンドウで常に前面表示。会議の邪魔になりません。",
  },
];

const steps = [
  { step: "01", title: "ダウンロード", desc: "DMG/EXEをダウンロードしてインストール（1分）" },
  { step: "02", title: "モデル取得", desc: "初回起動時にWhisperモデル（1.5GB）を自動取得" },
  { step: "03", title: "会議を開始", desc: "録音ボタンを押してオンライン会議に参加するだけ" },
  { step: "04", title: "議事録完成", desc: "会議終了後、文字起こし・要約が自動で生成される" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-white tracking-tight">議録 Giroku</span>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
            利用規約
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full text-blue-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          相手に気づかれない議事録AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          会議の内容を、<br />
          <span className="text-blue-400">ステルスで記録。</span>
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed max-w-xl mb-10">
          Zoom・Meet・Teamsなどのオンライン会議を、相手に一切通知せず録音・文字起こし。
          音声データはすべてデバイス内で処理されます。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#download"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            無料でダウンロード
          </a>
          <a
            href="#features"
            className="px-8 py-3.5 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 font-medium rounded-xl transition-colors text-sm border border-gray-700/40"
          >
            機能を見る
          </a>
        </div>
        <p className="text-gray-600 text-xs mt-4">月120分まで無料 · macOS & Windows対応</p>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-12">なぜGirokuなのか</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 hover:border-gray-700/60 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-gray-900/30 border-y border-gray-800/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">使い方</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-4xl font-bold text-blue-800/60 mb-3">{s.step}</div>
                <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-12">料金プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-8">
            <div className="text-gray-400 text-sm font-medium mb-2">無料プラン</div>
            <div className="text-4xl font-bold text-white mb-1">¥0</div>
            <div className="text-gray-500 text-sm mb-6">月120分まで</div>
            <ul className="space-y-2 text-sm text-gray-400 mb-8">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 録音・文字起こし（月120分）</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 話者分離（自分 / 相手）</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 履歴・全文コピー</li>
              <li className="flex items-center gap-2"><span className="text-gray-600">✗</span> AI要約</li>
            </ul>
            <a
              href="#download"
              className="block w-full py-3 text-center bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              無料で始める
            </a>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/40 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
              おすすめ
            </div>
            <div className="text-blue-400 text-sm font-medium mb-2">有料プラン</div>
            <div className="text-4xl font-bold text-white mb-1">¥980</div>
            <div className="text-gray-500 text-sm mb-6">2年間 買い切り</div>
            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 録音・文字起こし（無制限）</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 話者分離（自分 / 相手）</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 履歴・全文コピー</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> AI要約（Gemini）</li>
            </ul>
            <a
              href="https://app.lemonsqueezy.com"
              className="block w-full py-3 text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              ¥980で購入
            </a>
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="px-6 py-20 bg-gray-900/30 border-t border-gray-800/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">今すぐダウンロード</h2>
          <p className="text-gray-400 mb-8">月120分まで無料。インストールして即使えます。</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="flex items-center justify-center gap-3 px-8 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700/40 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <span className="text-xl"></span>
              macOS 用ダウンロード
            </a>
            <a
              href="#"
              className="flex items-center justify-center gap-3 px-8 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700/40 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <span className="text-xl">🪟</span>
              Windows 用ダウンロード
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-4">macOS 12以降 / Windows 10以降</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-600 text-sm">© 2026 Naoya Tsuji. All rights reserved.</span>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">利用規約</Link>
            <a href="mailto:naoyatttsuji@gmail.com" className="hover:text-gray-400 transition-colors">サポート</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
