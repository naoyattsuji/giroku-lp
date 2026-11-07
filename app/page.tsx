"use client";

import { useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { LogoMark } from "./components/Illustrations";
import { Reveal } from "./components/Reveal";
import "./home.css";

/*
 * Giroku の紹介ページ。手本は Apple の製品ページ（短い見出し・本物の画面・余白）。
 * 来た端末に合った入口を一番に出し、ページの下ではすべての端末を選べるようにする。
 */

const APP_STORE_URL = "https://apps.apple.com/jp/app/giroku/id6826128219";
const MS_STORE_ID = "9NC27ZW645KD";
// PC 版 Pro の購入画面（Lemon Squeezy）。本番の商品ができたら差し替える（2026-11-08 時点は審査中）
const PC_PRO_CHECKOUT_URL =
  "https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747";

type Platform = "ios" | "mac" | "windows" | "other";

/** 来た端末を見分ける。iPad は Mac と名乗るので、指で触れるかどうかで iPhone 側に寄せる。
 *  サーバーで作る最初の HTML では分からないので "other"（全端末向けの入口）にしておく */
function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const touch = navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touch)) return "ios";
  if (/Macintosh|Mac OS X/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "windows";
  return "other";
}
const noSubscribe = () => () => {};
function useVisitorPlatform(): Platform {
  return useSyncExternalStore(noSubscribe, detectPlatform, () => "other");
}

function AppStoreBadge({ height = 44 }: { height?: number }): ReactElement {
  return (
    <a href={APP_STORE_URL} className="h-badge" aria-label="App Store からダウンロード">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/badges/app-store-ja-black.svg" alt="App Store からダウンロード" height={height} style={{ height }} />
    </a>
  );
}

/** Microsoft Store の公式バッジ（公式の部品を埋め込む。読み込めないときは文字のリンク） */
function MicrosoftStoreBadge(): ReactElement {
  return (
    <span className="h-ms-badge">
      <span
        dangerouslySetInnerHTML={{
          __html: `<ms-store-badge productid="${MS_STORE_ID}" productname="Giroku" window-mode="direct" theme="dark" language="ja" size="large" animation="off"></ms-store-badge>`,
        }}
      />
      <noscript>
        <a href={`https://apps.microsoft.com/detail/${MS_STORE_ID}`}>Microsoft Store で入手</a>
      </noscript>
    </span>
  );
}

/** 端末に合わせた一番の入口 */
function PrimaryAction({ platform, compact = false }: { platform: Platform; compact?: boolean }): ReactElement {
  if (platform === "ios") return <AppStoreBadge height={compact ? 36 : 48} />;
  const label =
    platform === "mac" ? "Mac 版をダウンロード" : platform === "windows" ? "Windows 版を入手" : "無料でダウンロード";
  const href = platform === "mac" ? "/download/mac" : platform === "windows" ? "/download/windows" : "#download";
  return (
    <a href={href} className={compact ? "h-button h-button-small" : "h-button"}>
      {label}
    </a>
  );
}

function Check(): ReactElement {
  return (
    <svg className="h-check" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({ id, tone = "white", children }: { id?: string; tone?: "white" | "gray"; children: ReactNode }): ReactElement {
  return (
    <section id={id} className={`h-section h-section-${tone}`}>
      <div className="h-inner">{children}</div>
    </section>
  );
}

/** Mac のウィンドウの枠（本物の画面写真を入れる） */
function MacWindow({ src, alt }: { src: string; alt: string }): ReactElement {
  return (
    <figure className="h-window">
      <div className="h-window-bar" aria-hidden="true">
        <i /><i /><i />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={1600} height={1108} loading="lazy" />
    </figure>
  );
}

/** iPhone の画面写真（角を丸めて縁を付けるだけ。傾けたり影を足したりしない） */
function PhoneShot({ src, alt, className = "" }: { src: string; alt: string; className?: string }): ReactElement {
  return (
    <figure className={`h-phone ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={640} height={1391} loading="lazy" />
    </figure>
  );
}

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "相手に知らせずに録音してもいいですか？",
    a: "Giroku は会議に何も参加させないので、相手の画面には何も出ません。それでも、録音するときは相手にひとこと伝えるのがマナーです。大学の講義は、先生の決まりに従ってください。",
  },
  {
    q: "音声はどこかに送られますか？",
    a: "送られません。文字起こしは端末の中で行います。AI 議事録を作るときと、議事録に質問するときだけ、文字（音声ではありません）を Giroku のサーバーへ送り、AI（Google Gemini）で処理します。",
  },
  {
    q: "ネットがない所でも使えますか？",
    a: "録音と文字起こしは、ネットがなくても使えます。AI 議事録を作るときだけネットが必要です。",
  },
  {
    q: "iPhone でもパソコンの音（相手の声）は録れますか？",
    a: "iPhone はマイクの音を録ります。対面の会議や講義はそのまま録れます。オンライン会議の相手の声までしっかり残すなら、Mac 版・Windows 版をお使いください。マイクとパソコンの音の両方を録れます。",
  },
  {
    q: "対応している端末は？",
    a: "iPhone は iOS 16.4 以降、Mac は macOS 13 以降（Apple シリコン）、Windows は Windows 10・11（64ビット）です。iOS 26・macOS 26 以降では、Apple の音声認識で文字起こしします。Android 版はありません。",
  },
  {
    q: "Pro の解約はどうすればいいですか？",
    a: "iPhone で買った場合は、iPhone の［設定］→ 自分の名前 →［サブスクリプション］から解約できます。パソコン版をウェブで買った場合は、購入時のメールにある管理ページから解約できます。解約しても、期間の終わりまでは Pro のまま使えます。",
  },
  {
    q: "アカウントの登録は必要ですか？",
    a: "要りません。ダウンロードしてすぐに使えます。",
  },
];

export default function Home(): ReactElement {
  const platform = useVisitorPlatform();

  return (
    <div className="h-page">
      <Script src="https://get.microsoft.com/badge/ms-store-badge.bundled.js" type="module" strategy="lazyOnload" />

      <header className="h-nav">
        <div className="h-nav-inner">
          <a href="#top" className="h-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={24} height={24} />
            <span>Giroku</span>
          </a>
          <nav className="h-nav-links" aria-label="ページ内">
            <a href="#features">特長</a>
            <a href="#pricing">料金</a>
            <Link href="/guide">使い方</Link>
          </nav>
          <a href="#download" className="h-button h-button-small">ダウンロード</a>
        </div>
      </header>

      <main id="top">
        {/* ひと目で分かる：何をするアプリか・一番の入口・本物の画面 */}
        <section className="h-hero">
          <div className="h-inner h-hero-copy">
            <span className="h-hero-mark"><LogoMark size={44} /></span>
            <h1>
              相手に気づかれず、
              <br />
              会話をまるごと記録。
            </h1>
            <p className="h-lead">
              録音すると、その場で文字に。AI が議事録にまとめます。
              <br className="h-br-wide" />
              会議に Bot は入れません。iPhone・Mac・Windows で。
            </p>
            <div className="h-hero-actions">
              <PrimaryAction platform={platform} />
              <a href="#download" className="h-link">ほかの端末 ›</a>
            </div>
            <p className="h-hero-note">全機能無料・登録不要</p>
          </div>
          <div className="h-hero-stage">
            <MacWindow src="/shots/pc-03-live.webp" alt="Mac 版で録音中の画面。マイクの声とパソコンの音が、それぞれ文字になって並んでいる" />
            <PhoneShot src="/shots/ios-02.webp" alt="iPhone 版で録音中の画面。話した言葉がその場で文字になっている" className="h-hero-phone" />
          </div>
        </section>

        {/* 安心の帯 */}
        <div className="h-facts" role="list">
          {["会議に Bot を入れない", "音声は端末の外に出ない", "ネットなしで文字起こし", "登録不要・全機能無料"].map((fact) => (
            <span key={fact} role="listitem"><Check />{fact}</span>
          ))}
        </div>

        <div id="features" />

        {/* 強み1：気づかれない */}
        <Section tone="gray">
          <Reveal>
            <div className="h-split">
              <div className="h-split-copy">
                <h2>相手に、気づかれない。</h2>
                <p>
                  多くの議事録サービスは、録音用の参加者（Bot）を会議に入れます。Giroku は入れません。あなたの端末で録音するだけなので、相手の画面はいつもどおりです。
                </p>
                <p className="h-small">録音するときは、相手にひとこと伝えましょう。</p>
              </div>
              <div className="h-participants" aria-label="会議の参加者の表示の比較（イメージ）">
                <div className="h-pcard">
                  <p className="h-pcard-title">Bot を使う議事録サービス</p>
                  <ul>
                    <li><span className="h-avatar">山</span>山田</li>
                    <li><span className="h-avatar">佐</span>佐藤</li>
                    <li className="h-bot"><span className="h-avatar">AI</span>議事録 Bot が参加しました</li>
                  </ul>
                </div>
                <div className="h-pcard h-pcard-giroku">
                  <p className="h-pcard-title">Giroku</p>
                  <ul>
                    <li><span className="h-avatar">山</span>山田</li>
                    <li><span className="h-avatar">佐</span>佐藤</li>
                  </ul>
                  <p className="h-pcard-note">参加者は増えません</p>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* 強み2：両方の声 */}
        <Section>
          <Reveal>
            <div className="h-center">
              <h2>自分の声も、相手の声も。</h2>
              <p className="h-sub">
                パソコン版は、マイクとパソコンの音を同時に録ります。オンライン会議の相手の声も、こぼさず文字に。
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="h-wide-shot">
              <MacWindow src="/shots/pc-03-live.webp" alt="「マイク」と「PC」の印つきで、自分と相手の発言が交互に並ぶ文字起こし" />
              <div className="h-legend">
                <span><b>マイク</b>あなたや、その場の声</span>
                <span><b>PC</b>パソコンから流れる相手の声</span>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* 強み3：端末の中で */}
        <Section tone="gray">
          <Reveal>
            <div className="h-split h-split-reverse">
              <div className="h-split-copy">
                <h2>ネットがなくても、端末の中で文字に。</h2>
                <p>
                  文字起こしは、iPhone やパソコンの中で行います。音声は外に出ません。機内や地下でも止まりません。
                </p>
                <ul className="h-list">
                  <li><Check />iPhone・Mac は、最新の OS なら Apple の音声認識</li>
                  <li><Check />Windows は、日本語に強い Parakeet</li>
                  <li><Check />話している途中は薄い文字で、確定すると濃く</li>
                </ul>
              </div>
              <PhoneShot src="/shots/ios-02.webp" alt="iPhone で録音中。聞き取り中の言葉が薄い文字で出ている" className="h-phone-solo" />
            </div>
          </Reveal>
        </Section>

        {/* 議事録 */}
        <Section>
          <Reveal>
            <div className="h-center">
              <h2>決まったこと、やること。<br />AI が話題ごとに。</h2>
              <p className="h-sub">議事録には質問もできます。「いつまでに？」と聞けば、録音の中から答えます。</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="h-phones">
              <PhoneShot src="/shots/ios-04.webp" alt="AI 議事録。概要・決まったこと・やることが見出しごとに並ぶ" />
              <PhoneShot src="/shots/ios-05.webp" alt="議事録への質問。吹き出しで答えが返ってくる" />
            </div>
          </Reveal>
        </Section>

        {/* 整理 */}
        <Section tone="gray">
          <Reveal>
            <div className="h-center">
              <h2>あとから、すぐ見つかる。</h2>
              <p className="h-sub">
                フォルダとお気に入りで整理。まとめて選んで移動・削除。消しても 7 日間は元に戻せます。
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="h-wide-shot">
              <MacWindow src="/shots/pc-09-history.webp" alt="履歴の画面。左にすべての録音・お気に入り・フォルダ・最近削除した項目が並ぶ" />
            </div>
          </Reveal>
        </Section>

        {/* 料金 */}
        <Section id="pricing">
          <Reveal>
            <div className="h-center">
              <h2>全機能、無料。</h2>
              <p className="h-sub">録音・文字起こし・AI 議事録は、回数の制限なく使えます。もっと良くしたい人に、Pro。</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="h-plans">
              <article className="h-plan">
                <h3>無料</h3>
                <p className="h-price"><strong>¥0</strong></p>
                <ul className="h-list">
                  <li><Check />録音・文字起こし・AI 議事録</li>
                  <li><Check />議事録への質問・書き直し</li>
                  <li><Check />フォルダ・お気に入り・検索</li>
                  <li className="h-muted">iPhone 版は広告が出ます</li>
                </ul>
                <a href="#download" className="h-button h-button-gray">無料で始める</a>
              </article>
              <article className="h-plan h-plan-pro">
                <h3>Pro</h3>
                <p className="h-price"><strong>¥980</strong><span>／年（税込）</span></p>
                <p className="h-price-note">月あたり約 82 円</p>
                <ul className="h-list">
                  <li><Check />広告なし</li>
                  <li><Check />より高品質な AI で議事録</li>
                  <li><Check />録音後に、誤字や句読点を自動で整える</li>
                                  </ul>
                <div className="h-plan-actions">
                  <div>
                    <p className="h-plan-where">iPhone</p>
                    <p className="h-plan-how">アプリの［設定］→［Pro にする］</p>
                  </div>
                  <div>
                    <p className="h-plan-where">Mac・Windows</p>
                    <a href={PC_PRO_CHECKOUT_URL} className="h-button h-button-small">ウェブで購入</a>
                    <p className="h-plan-how h-plan-sub">パソコン 2 台まで</p>
                  </div>
                </div>
              </article>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-polish">
              <p className="h-polish-title">Pro の「文章の仕上げ」の例</p>
              <div className="h-polish-row">
                <p><span className="h-tag">仕上げ前</span>ブランドの<mark className="h-before">常常的</mark>価値について話します。</p>
                <p><span className="h-tag h-tag-pro">仕上げ後</span>ブランドの<mark className="h-after">情緒的</mark>価値について話します。</p>
              </div>
              <p className="h-small">聞き間違えた言葉を、前後の話から直します。Giroku の実際の録音で試した例です。</p>
            </div>
          </Reveal>
          <p className="h-fineprint">
            Pro は、iPhone とパソコンで別々に購入します（iPhone の Pro は iPhone で、パソコンの Pro は Mac・Windows で使えます）。Pro は 1 年ごとの自動更新です。期間が終わる 24 時間前までに解約しない限り、同じ料金で更新されます。iPhone では［設定］→ 自分の名前 →［サブスクリプション］から、いつでも解約できます。解約しても、期間の終わりまでは Pro のまま使えます。
          </p>
        </Section>

        {/* よくある質問 */}
        <Section tone="gray">
          <h2 className="h-center-title">よくある質問</h2>
          <div className="h-faq">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* ダウンロード：すべての端末を並べる */}
        <section id="download" className="h-section h-download">
          <div className="h-inner">
            <span className="h-hero-mark"><LogoMark size={44} /></span>
            <h2>今すぐ、無料で。</h2>
            <p className="h-sub">登録せずに、すぐ使えます。</p>
            <div className="h-stores">
              <div className={`h-store${platform === "ios" ? " is-here" : ""}`}>
                <h3>iPhone</h3>
                <AppStoreBadge height={44} />
                <p>iOS 16.4 以降</p>
              </div>
              <div className={`h-store${platform === "mac" ? " is-here" : ""}`}>
                <h3>Mac</h3>
                <a href="/download/mac" className="h-button">Mac 版をダウンロード</a>
                <p>macOS 13 以降・Apple シリコン<br />Apple の公証済み・約 160MB</p>
              </div>
              <div className={`h-store${platform === "windows" ? " is-here" : ""}`}>
                <h3>Windows</h3>
                <MicrosoftStoreBadge />
                <p>Windows 10・11（64ビット）</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-footer">
        <div className="h-inner h-footer-inner">
          <div className="h-footer-links">
            <Link href="/guide">使い方</Link>
            <Link href="/privacy">プライバシー</Link>
            <Link href="/terms">利用規約</Link>
            <a href="https://naoya-tsuji.com/?topic=giroku#contact" target="_blank" rel="noreferrer">お問い合わせ</a>
          </div>
          <p>© {new Date().getFullYear()} Naoya Tsuji</p>
          <p className="h-legal">
            iPhone、Mac、App Store は、米国およびその他の国で登録された Apple Inc. の商標です。Windows、Microsoft Store は Microsoft グループの商標です。
          </p>
        </div>
      </footer>
    </div>
  );
}
