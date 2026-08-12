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

const steps: Step[] = [
  {
    num: "1",
    title: "赤いボタンを押す",
    desc: "サイドバーの「録音」で、赤いボタンを押すだけで始まります。",
    image: { src: "/guide/step-01-start.png", alt: "録音ボタンを押す" },
  },
  {
    num: "2",
    title: "はじめての時だけ、ひとこと確認",
    desc: "相手の同意についての確認です。チェックして進めば、次回からは出ません。",
    image: { src: "/guide/step-02-consent.png", alt: "同意の確認ダイアログ" },
  },
  {
    num: "3",
    title: "話した内容が、その場で文字になる",
    desc: "マイクの声も、パソコンの音（通話・動画）も、区別しながらリアルタイムで表示されます。",
    image: { src: "/guide/step-03-live.png", alt: "録音中のライブ文字起こし" },
  },
  {
    num: "4",
    title: "音源はその場でオン/オフできる",
    desc: "マイクだけ、パソコンの音だけ、を録りたいときはワンクリックでミュートできます。",
    image: { src: "/guide/step-04-mute.png", alt: "マイクをミュートする" },
  },
  {
    num: "5",
    title: "終わったら、停止するだけ",
    desc: "「停止」を押すと、あとは自動で保存・文字起こしまで進みます。",
    image: { src: "/guide/step-05-stop.png", alt: "録音を停止する" },
  },
  {
    num: "6",
    title: "「議事録を作成」で、AIがまとめる",
    desc: "決まったこと・やることを、AIが自動で整理します（無料でも毎月2件まで作成可）。",
    image: { src: "/guide/step-06-create.png", alt: "議事録を作成ボタン" },
  },
  {
    num: "7",
    title: "気になることは、そのまま聞ける",
    desc: "「誰が担当？」「いつまで？」と話しかけると、AIがその場で答えたり、議事録を書き直したりします。",
    image: { src: "/guide/step-07-result.png", alt: "完成した議事録とAIチャットでの質問" },
  },
  {
    num: "8",
    title: "履歴から、いつでも探せる",
    desc: "検索・お気に入り・フォルダ分けで、あとから見返しやすくなっています。",
    image: { src: "/guide/step-08-history.png", alt: "履歴画面での検索とお気に入り" },
  },
  {
    num: "9",
    title: "複数まとめて、フォルダ移動や削除も",
    desc: "「選択」でチェックを付けると、まとめてフォルダに移動したりゴミ箱に入れたりできます。",
    image: { src: "/guide/step-09-select.png", alt: "複数選択して一括操作" },
  },
  {
    num: "10",
    title: "消しても、7日間はゴミ箱に残る",
    desc: "うっかり消しても大丈夫。7日以内なら「元に戻す」でいつでも復元できます。",
    image: { src: "/guide/step-10-trash.png", alt: "ゴミ箱画面" },
  },
  {
    num: "11",
    title: "困ったときは、設定の「ヘルプ」から",
    desc: "このガイドにも、お問い合わせにも、設定画面からすぐに戻ってこられます。",
    image: { src: "/guide/step-11-help.png", alt: "設定画面のヘルプセクション" },
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
            width={2080}
            height={1440}
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
