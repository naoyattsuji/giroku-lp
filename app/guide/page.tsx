import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { LogoMark } from "../components/Illustrations";

export const metadata: Metadata = {
  title: "使い方ガイド — Giroku",
  description: "Giroku（議録）の使い方をスクリーンショット付きで紹介。録音の始め方から、AI議事録、履歴の探し方、設定まで。",
  alternates: { canonical: "/guide" },
};

const steps = [
  {
    num: "01",
    image: "/guide/01-record.png",
    title: "押すだけで、録音がはじまる",
    desc: "サイドバーの「録音」から赤いボタンを押すだけ。マイクの声も、パソコンから流れる相手の声も、同時に録れます。会議に何も追加しないので、相手の画面には何も表示されません。",
  },
  {
    num: "02",
    image: "/guide/02-minutes.png",
    title: "話した内容が、そのまま議事録に",
    desc: "録音を止めると、文字起こしとAI議事録が自動で作られます。決まったこと・やること・担当・期限まで、貼ってすぐ使える形にまとまります。マイク／パソコンの音は別々に表示できます。",
  },
  {
    num: "03",
    image: "/guide/03-chat.png",
    title: "「もっと短く」も「あれ何だっけ」も、聞くだけ",
    desc: "議事録の下のチャットに話しかけると、AIがその場で書き直したり、内容について答えてくれます。話した内容を覚えたまま会話できるので、聞き直す手間がありません。",
  },
  {
    num: "04",
    image: "/guide/04-history.png",
    title: "先週の「あの話」に、すぐ戻れる",
    desc: "「履歴」には、これまでの記録が一覧で並びます。タイトルだけでなく文字起こしの中身も検索でき、フォルダで整理することもできます。",
  },
  {
    num: "05",
    image: "/guide/05-settings.png",
    title: "録音した音声は、パソコンの外に出ない",
    desc: "「設定」では、文字起こしの精度やマイクの選択、購入キー・招待コードの登録ができます。文字起こしは端末内で処理し、AIを使うときだけ文字だけを送ります。",
  },
];

export default function GuidePage() {
  return (
    <div className="site-shell">
      <header className="nav-sticky">
        <div className="lp-inner nav-inner">
          <Link href="/" className="nav-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={26} height={26} />
            <span>Giroku</span>
          </Link>
          <div className="nav-actions">
            <Link href="/#scenes" className="nav-secondary-link">使い方</Link>
            <Link href="/#pricing" className="nav-secondary-link">料金</Link>
            <Link href="/#download" className="nav-download">ダウンロード</Link>
          </div>
        </div>
      </header>

      <section className="section guide-hero">
        <div className="lp-inner section-inner guide-hero-inner">
          <span className="hero-spirit guide-hero-spirit">
            <LogoMark size={40} />
          </span>
          <p className="section-eyebrow">使い方ガイド</p>
          <h1 className="section-title guide-hero-title">
            Girokuの使い方を、画面で見る。
          </h1>
          <p className="guide-hero-description">
            録音から議事録、履歴、設定まで。実際の画面と一緒に紹介します。
          </p>
        </div>
      </section>

      <section className="section section-muted guide-steps-section">
        <div className="lp-inner section-inner">
          <div className="guide-steps">
            {steps.map((step) => (
              <article className="guide-step" key={step.num}>
                <div className="guide-step-media">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={2880}
                    height={1800}
                    sizes="(max-width: 768px) 100vw, 900px"
                  />
                </div>
                <div className="guide-step-copy">
                  <p className="guide-step-num">{step.num}</p>
                  <h2>{step.title}</h2>
                  <p>{step.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section guide-cta-section">
        <div className="lp-inner section-inner guide-cta-inner">
          <h2 className="section-title">今すぐ、試してみる。</h2>
          <p className="guide-cta-description">登録せずに、すぐ使えます。</p>
          <div className="guide-cta-actions">
            <Link href="/#download" className="button button-dark">
              無料でダウンロード
            </Link>
            <a
              href="https://naoya-tsuji.com/?topic=giroku#contact"
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              使い方についてお問い合わせ →
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="lp-inner footer-inner">
          <span>© {new Date().getFullYear()} Naoya Tsuji</span>
          <div className="footer-links">
            <Link href="/privacy">プライバシー</Link>
            <Link href="/terms">利用規約</Link>
            <a href="https://naoya-tsuji.com/?topic=giroku#contact" target="_blank" rel="noreferrer">
              お問い合わせ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
