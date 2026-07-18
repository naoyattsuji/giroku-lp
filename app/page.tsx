"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { AppMock } from "./components/AppMock";
import { LogoMark } from "./components/Illustrations";
import { Reveal } from "./components/Reveal";

const SPIRIT_BODY = "M12 3.5c4.7 0 7.5 3.3 7.5 8v6.3c0 .6-.7 1-1.2.6l-1.4-1.1-1.5 1.2c-.4.3-1 .3-1.3 0l-1.5-1.2-1.6 1.2c-.4.3-1 .3-1.3 0l-1.5-1.2-1.4 1.1c-.5.4-1.2 0-1.2-.6V11.5c0-4.7 2.8-8 7.4-8z";

function ReasonIcon({ kind }: { kind: "quiet" | "audio" | "offline" }): ReactElement {
  return (
    <svg className={`reason-icon reason-icon-${kind}`} width="72" height="72" viewBox="0 0 24 24" aria-hidden="true">
      <path d={SPIRIT_BODY} fill="#f01932" />
      {kind === "quiet" ? (
        <>
          <rect x="7.4" y="10.4" width="3.6" height="2.4" rx="1.2" fill="#1d1d1f" />
          <rect x="13" y="10.4" width="3.6" height="2.4" rx="1.2" fill="#1d1d1f" />
          <path d="M11 11.4h2" stroke="#1d1d1f" strokeWidth="1" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="9.3" cy="11.5" r="1" fill="#fff" />
          <circle cx="14.7" cy="11.5" r="1" fill="#fff" />
        </>
      )}
      {kind === "audio" && (
        <g transform="translate(14.8 12.4)" fill="#1d1d1f">
          <circle cx="1.9" cy="1.8" r="2.8" />
          <rect x="1.25" y="4" width="1.3" height="4.3" rx=".65" />
          <rect x="-.25" y="7.5" width="4.3" height="1.2" rx=".6" />
        </g>
      )}
      {kind === "offline" && (
        <g transform="translate(14.2 13.5)" fill="none" stroke="#1d1d1f" strokeLinecap="round">
          <path d="M.5 3.1a5 5 0 0 1 5.8 0" strokeWidth="1.15" opacity=".55" />
          <circle cx="3.4" cy="5.4" r=".65" fill="#1d1d1f" stroke="none" />
          <path d="M-.2.2l7.3 6" strokeWidth="1.25" />
        </g>
      )}
    </svg>
  );
}

const reasons = [
  {
    kind: "quiet" as const,
    title: "会議画面は、いつものまま。",
    text: "通話にボットを追加しません。相手側の画面や会議の進め方を変えずに使えます。",
  },
  {
    kind: "audio" as const,
    title: "マイクも、パソコンの音も。",
    text: "オンライン会議も、対面も、講義も。2つの音を分けて、きちんと記録します。",
  },
  {
    kind: "offline" as const,
    title: "ネットが、なくても。",
    text: "録音と文字起こしは端末の中で動作。電波が不安定な場所でも止まりません。",
  },
];

const plans = [
  {
    name: "無料",
    price: "¥0",
    note: "登録不要",
    features: ["文字起こし 月120分", "AI議事録 月2件", "AIへの質問・修正", "保存・編集・コピー"],
    cta: "無料で始める",
    href: "#download",
  },
  {
    name: "有料",
    price: "¥980",
    suffix: "/ 年",
    note: "買い切り感覚の年額・2台まで",
    features: ["録音・文字起こし", "AI議事録・質問・修正", "利用量を気にせず使える", "2台まで利用可能"],
    cta: "デスクトップ版を購入",
    href: "https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747",
    featured: true,
  },
];

function Check(): ReactElement {
  return <span className="check" aria-hidden="true">✓</span>;
}

function MinutesMock(): ReactElement {
  return (
    <div className="minutes-window" aria-label="GirokuのAI議事録画面イメージ">
      <div className="window-bar"><i /><i /><i /></div>
      <div className="minutes-body">
        <div className="minutes-topline">
          <div>
            <span className="eyebrow">AI議事録</span>
            <h3>プロジェクト定例</h3>
          </div>
          <span className="copy-pill">まとめてコピー</span>
        </div>
        <div className="minutes-grid">
          <div className="minutes-main">
            <section>
              <span>決まったこと</span>
              <p>新しい画面案は金曜日までに共有し、次回の会議で最終確認する。</p>
            </section>
            <section>
              <span>次にやること</span>
              <div className="task-row"><b>✓</b><p>田中さん：画面案を作成</p><time>金曜</time></div>
              <div className="task-row"><b>✓</b><p>佐藤さん：利用者テストを準備</p><time>来週</time></div>
            </section>
          </div>
          <div className="chat-preview">
            <div className="chat-heading"><LogoMark size={18} /><span>議事録について聞く</span></div>
            <p className="user-message">今日決まったことは？</p>
            <p className="bot-message">画面案を金曜までに共有し、次回会議で最終確認します。</p>
            <div className="chat-input">もう少し詳しく<span>↑</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactElement {
  return (
    <main>
      <header className="site-nav">
        <div className="shell nav-inner">
          <a className="brand" href="#top" aria-label="Giroku トップへ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width="30" height="30" />
            <span>Giroku</span>
          </a>
          <nav aria-label="メインナビゲーション">
            <a href="#features">機能</a>
            <a href="#pricing">料金</a>
            <a className="nav-download" href="/download/mac">無料で始める</a>
          </nav>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="shell hero-copy">
          <Reveal>
            <p className="hero-kicker">録音・文字起こし・AI議事録を、ひとつに。</p>
            <h1>会議は、そのまま。<br />記録だけ、残る。</h1>
            <p className="hero-lead">通話にボットを追加せず、マイクとパソコンの音を<br className="desktop-break" />リアルタイムで文字起こしします。</p>
            <div className="hero-actions">
              <a className="primary-button" href="/download/mac">macOS版を無料でダウンロード</a>
              <a className="text-link" href="#experience">使い方を見る <span>↓</span></a>
            </div>
            <p className="hero-note">登録不要 · 月120分まで無料 · Apple Silicon対応</p>
          </Reveal>
        </div>
        <div className="hero-product shell-wide">
          <Reveal delay={100}><AppMock /></Reveal>
        </div>
      </section>

      <section className="reasons-section" id="features">
        <div className="shell content-narrow">
          <Reveal>
            <p className="section-label">Girokuだけの3つ</p>
            <h2>他にはない、3つの理由。</h2>
          </Reveal>
          <div className="reasons-list">
            {reasons.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 70}>
                <article className="reason-row">
                  <div className="reason-visual"><ReasonIcon kind={reason.kind} /></div>
                  <div>
                    <h3>{reason.title}</h3>
                    <p>{reason.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="consent-note">録音するときは、相手の同意や所属組織のルールを確認してご利用ください。</p>
        </div>
      </section>

      <section className="experience-section" id="experience">
        <div className="shell feature-block">
          <Reveal>
            <div className="feature-copy">
              <p className="section-label">リアルタイム文字起こし</p>
              <h2>話したそばから、<br />読める。</h2>
              <p>マイクとパソコンの音を分けて表示。誰の音か迷わず、会議をしながら内容を追えます。</p>
              <ul className="simple-list">
                <li><Check />会議中もリアルタイムで表示</li>
                <li><Check />軽快・高精度の2モード</li>
                <li><Check />録音停止後に自動で仕上げ</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="product-stage compact-stage"><AppMock /></div>
          </Reveal>
        </div>
      </section>

      <section className="minutes-section">
        <div className="shell minutes-heading">
          <Reveal>
            <p className="section-label">AI議事録</p>
            <h2>終わった会議を、<br />もう一度聞かなくていい。</h2>
            <p>決まったこと、次にやること、大切な発言を自動で整理。質問や書き直しも、その場でできます。</p>
          </Reveal>
        </div>
        <div className="shell-wide minutes-stage"><Reveal delay={100}><MinutesMock /></Reveal></div>
      </section>

      <section className="privacy-section">
        <div className="shell privacy-grid">
          <Reveal>
            <div>
              <p className="section-label">プライバシー</p>
              <h2>音声は、あなたのMacから出さない。</h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="privacy-details">
              <article><span>01</span><div><h3>端末の中で文字起こし</h3><p>録音音声は外部の文字起こしサービスへ送信しません。</p></div></article>
              <article><span>02</span><div><h3>ネットなしでも録音</h3><p>接続が不安定でも、録音と文字起こしを続けられます。</p></div></article>
              <article><span>03</span><div><h3>AI仕上げは文章だけ</h3><p>有効にした場合も、AIへ送るのは文字起こし結果だけです。</p></div></article>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="shell content-narrow">
          <Reveal>
            <div className="pricing-heading">
              <p className="section-label">料金</p>
              <h2>まずは無料で。<br />必要になったら、そのまま広げる。</h2>
            </div>
          </Reveal>
          <div className="pricing-cards">
            {plans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 80}>
                <article className={`price-card${plan.featured ? " featured" : ""}`}>
                  <div className="price-top">
                    <p>{plan.name}</p>
                    {plan.featured && <span>おすすめ</span>}
                  </div>
                  <div className="price"><strong>{plan.price}</strong>{plan.suffix && <small>{plan.suffix}</small>}</div>
                  <p className="price-note">{plan.note}</p>
                  <ul>{plan.features.map((feature) => <li key={feature}><Check />{feature}</li>)}</ul>
                  <a className={plan.featured ? "primary-button" : "secondary-button"} href={plan.href}>{plan.cta}</a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="download-section" id="download">
        <div className="shell content-narrow">
          <Reveal>
            <LogoMark size={48} />
            <h2>次の会議から、<br />残してみる。</h2>
            <p>登録せずに、すぐ使えます。</p>
            <a className="primary-button large-button" href="/download/mac">macOS版を無料でダウンロード</a>
            <div className="platform-status" aria-label="対応予定プラットフォーム">
              <span>Windows <small>準備中</small></span>
              <span>iPhone <small>準備中</small></span>
              <span>Android <small>準備中</small></span>
            </div>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="shell footer-inner">
          <div className="footer-brand"><LogoMark size={22} /><span>Giroku</span></div>
          <div className="footer-links">
            <Link href="/privacy">プライバシー</Link>
            <Link href="/terms">利用規約</Link>
            <a href="mailto:naoyatttsuji@gmail.com">サポート</a>
          </div>
          <p>© {new Date().getFullYear()} Naoya Tsuji</p>
        </div>
      </footer>
    </main>
  );
}
