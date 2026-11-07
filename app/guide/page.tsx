import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { LogoMark } from "../components/Illustrations";

export const metadata: Metadata = {
  title: "使い方ガイド — Giroku",
  description: "Giroku（議録）の使い方を、録音を始めてから終わるまでの流れに沿って画面付きで紹介します。",
  alternates: { canonical: "/guide" },
};

type Step = {
  num: string;
  title: string;
  desc: string;
  image: { src: string; alt: string };
};

// 中身は PC 版アプリの使い方（Giroku/app/src/renderer/src/views/GuideView.tsx）とそろえる。
// 写真はアプリ側の step-*.png を Web 用に軽くした物（cwebp -q 86 -resize 1600 0）
const steps: Step[] = [
  {
    num: "1",
    title: "赤いボタンを押す",
    desc: "「録音」の赤いボタンを押すと始まります。",
    image: { src: "/guide/step-01-start.webp", alt: "録音ボタンを押す" },
  },
  {
    num: "2",
    title: "はじめてだけ、ひとこと確認",
    desc: "相手の同意についての確認です。チェックして進めば、次からは出ません。",
    image: { src: "/guide/step-02-consent.webp", alt: "同意の確認" },
  },
  {
    num: "3",
    title: "話した内容が、その場で文字になる",
    desc: "マイクの声とパソコンの音（通話・動画）を分けて表示します。文字にするのは、このパソコンの中です。",
    image: { src: "/guide/step-03-live.webp", alt: "録音中の文字起こし" },
  },
  {
    num: "4",
    title: "音はその場でオン/オフ",
    desc: "マイクやパソコンの音のボタンを押すと、その音だけ止められます。",
    image: { src: "/guide/step-04-mute.webp", alt: "マイクを止める" },
  },
  {
    num: "5",
    title: "小さくすると、ミニ表示に",
    desc: "録音中にウィンドウを小さくすると、自動でミニ表示になります。大きくするか最大化すると、元に戻ります。",
    image: { src: "/guide/step-05-mini.webp", alt: "ミニ表示" },
  },
  {
    num: "6",
    title: "終わったら、停止するだけ",
    desc: "「停止」を押すと、保存と文字起こしまで自動で進みます。",
    image: { src: "/guide/step-06-stop.webp", alt: "録音を停止する" },
  },
  {
    num: "7",
    title: "「議事録を作成」で、AIがまとめる",
    desc: "決まったこと・やることを、AIが整理します。",
    image: { src: "/guide/step-07-create.webp", alt: "議事録を作成ボタン" },
  },
  {
    num: "8",
    title: "気になることは、そのまま聞ける",
    desc: "下の欄に書くか「もう少し詳しく」「短くまとめる」を押すと、AIが吹き出しで答えます。Apple Intelligence が使える Mac なら、無料版でもパソコンの中のAIが答えます。",
    image: { src: "/guide/step-08-chat.webp", alt: "議事録への質問と答え" },
  },
  {
    num: "9",
    title: "履歴から、いつでも探せる",
    desc: "左の「すべての録音」「お気に入り」と各フォルダから見返せます。「＋ 新規フォルダ」でフォルダを作り、フォルダを右クリックすると名前の変更や削除ができます。",
    image: { src: "/guide/step-09-history.webp", alt: "履歴" },
  },
  {
    num: "10",
    title: "まとめてフォルダ移動や削除も",
    desc: "「選択」を押して録音を選ぶと、下の帯の「移動」「削除」でまとめて操作できます。フォルダの中の「項目を追加」からも入れられます。",
    image: { src: "/guide/step-10-select.webp", alt: "複数を選んでまとめて操作" },
  },
  {
    num: "11",
    title: "削除しても、7日間は元に戻せる",
    desc: "削除したものは「最近削除した項目」に移ります。7日後に完全に削除され、それまでは「元に戻す」で戻せます。「選択」でまとめて戻すこともできます。",
    image: { src: "/guide/step-11-deleted.webp", alt: "最近削除した項目" },
  },
  {
    num: "12",
    title: "Pro なら、文章も自動で整う",
    desc: "録音のあと文字だけをAIに送り、誤字や句読点を直します。設定の「文章を自動で整える」で切り替えられます。",
    image: { src: "/guide/step-12-pro.webp", alt: "設定の「文章を自動で整える」" },
  },
  {
    num: "13",
    title: "困ったときは、設定の「ヘルプ」から",
    desc: "アプリの中のこの使い方にも、お問い合わせにも、設定からすぐ戻れます。",
    image: { src: "/guide/step-13-help.webp", alt: "設定のヘルプ" },
  },
];

function StepRow({ step }: { step: Step }): ReactElement {
  return (
    <li className="flow-step">
      <div className="flow-step-marker">
        <span className="flow-step-num">{step.num}</span>
      </div>
      <div className="flow-step-body">
        <h2>{step.title}</h2>
        <p>{step.desc}</p>
        <div className="flow-step-shot">
          <Image
            src={step.image.src}
            alt={step.image.alt}
            width={1600}
            height={1108}
            sizes="(max-width: 768px) 100vw, 760px"
          />
        </div>
      </div>
    </li>
  );
}

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
            <Link href="/#scenes" className="nav-secondary-link">トップ</Link>
            <Link href="/#pricing" className="nav-secondary-link">料金</Link>
            <Link href="/#download" className="nav-download">ダウンロード</Link>
          </div>
        </div>
      </header>

      <div className="lp-inner guide-flow-header">
        <div className="hero-kicker guide-flow-kicker">
          <span className="hero-spirit">
            <LogoMark size={34} />
          </span>
          <p>使い方ガイド</p>
        </div>
        <h1>録音を始めてから、終わるまで。</h1>
      </div>

      <div className="lp-inner guide-flow-wrap">
        <ol className="flow-steps">
          {steps.map((step) => (
            <StepRow step={step} key={step.num} />
          ))}
        </ol>
      </div>

      <section className="section guide-cta-section">
        <div className="lp-inner guide-cta-inner">
          <p className="guide-cta-lead">読んでも分からないことがあれば、いつでもお問い合わせください。</p>
          <div className="guide-cta-actions">
            <a
              href="https://naoya-tsuji.com/?topic=giroku#contact"
              className="button button-dark"
              target="_blank"
              rel="noreferrer"
            >
              お問い合わせ
            </a>
            <Link href="/#download" className="text-link">
              まだの方はダウンロード →
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="lp-inner footer-inner">
          <span>© {new Date().getFullYear()} Naoya Tsuji</span>
          <div className="footer-links">
            <Link href="/guide">使い方ガイド</Link>
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
