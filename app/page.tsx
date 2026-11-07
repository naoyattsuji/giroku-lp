"use client";

import { useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
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
  { q: "音声は外に送られますか？", a: "送られません。文字起こしは端末の中です。AI 議事録を作るときだけ、文字をサーバーへ送ります。" },
  { q: "iPhone で相手の声も録れますか？", a: "iPhone はマイクの音だけです。オンライン会議の相手の声まで録るなら、Mac 版・Windows 版を。" },
  { q: "相手に知らせなくていいですか？", a: "相手の画面には何も出ませんが、録音するときはひとこと伝えるのがマナーです。" },
  { q: "Pro の解約は？", a: "iPhone は［設定］→ 自分の名前 →［サブスクリプション］から。期間の終わりまでは Pro のままです。" },
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
        <section className="h-hero">
          <div className="h-inner h-hero-copy">
            <h1>
              相手に気づかれず、
              <br />
              会話をまるごと記録。
            </h1>
            <p className="h-lead">録音すると、その場で文字に。AI が議事録にまとめます。</p>
            <div className="h-hero-actions">
              <PrimaryAction platform={platform} />
              <a href="#download" className="h-link">ほかの端末 ›</a>
            </div>
            <p className="h-hero-note">全機能無料・登録不要・iPhone／Mac／Windows</p>
          </div>
          <div className="h-hero-stage">
            <MacWindow src="/shots/pc-03-live.webp" alt="Mac 版で録音中。マイクの声とパソコンの音が、それぞれ文字になって並ぶ" />
            <PhoneShot src="/shots/ios-02.webp" alt="iPhone 版で録音中。話した言葉がその場で文字になる" className="h-hero-phone" />
          </div>
        </section>

        <Section id="features">
          <div className="h-points">
            <div>
              <h3>気づかれない</h3>
              <p>会議に Bot を入れません。相手の画面はいつもどおり。</p>
            </div>
            <div>
              <h3>両方の声</h3>
              <p>パソコン版は、マイクと相手の声（パソコンの音）を同時に。</p>
            </div>
            <div>
              <h3>端末の中で</h3>
              <p>文字起こしはネット不要。音声は外に出ません。</p>
            </div>
          </div>
        </Section>

        <Section tone="gray">
          <h2 className="h-center-title">録って、まとめて、すぐ見つかる。</h2>
          <div className="h-trio">
            <figure>
              <PhoneShot src="/shots/ios-04.webp" alt="AI 議事録。概要・決まったこと・やることが並ぶ" />
              <figcaption>話題ごとの AI 議事録</figcaption>
            </figure>
            <figure>
              <PhoneShot src="/shots/ios-05.webp" alt="議事録への質問に、吹き出しで答えが返る" />
              <figcaption>聞けば答える</figcaption>
            </figure>
            <figure>
              <PhoneShot src="/shots/ios-06.webp" alt="履歴。すべての録音・お気に入り・フォルダ・最近削除した項目" />
              <figcaption>フォルダで整理</figcaption>
            </figure>
          </div>
        </Section>

        <Section id="pricing">
          <h2 className="h-center-title">全機能、無料。</h2>
          <div className="h-plans">
            <article className="h-plan">
              <h3>無料</h3>
              <p className="h-price"><strong>¥0</strong></p>
              <ul className="h-list">
                <li><Check />録音・文字起こし・AI 議事録</li>
                <li><Check />回数の制限なし</li>
                <li className="h-muted">iPhone 版は広告あり</li>
              </ul>
              <a href="#download" className="h-button h-button-gray">無料で始める</a>
            </article>
            <article className="h-plan h-plan-pro">
              <h3>Pro</h3>
              <p className="h-price"><strong>¥980</strong><span>／年（税込）</span></p>
              <ul className="h-list">
                <li><Check />広告なし</li>
                <li><Check />より高品質な AI</li>
                <li><Check />誤字・句読点を自動で整える</li>
              </ul>
              <div className="h-plan-actions">
                <div>
                  <p className="h-plan-where">iPhone</p>
                  <p className="h-plan-how">アプリの［設定］から</p>
                </div>
                <div>
                  <p className="h-plan-where">Mac・Windows</p>
                  <a href={PC_PRO_CHECKOUT_URL} className="h-button h-button-small">ウェブで購入</a>
                </div>
              </div>
            </article>
          </div>
          <p className="h-fineprint">
            Pro は iPhone とパソコンで別々に購入します。1 年ごとの自動更新で、期間が終わる 24 時間前までに解約しない限り更新されます。
          </p>
        </Section>

        <section id="download" className="h-section h-section-gray h-download">
          <div className="h-inner">
            <h2>今すぐ、無料で。</h2>
            <div className="h-stores">
              <div className={`h-store${platform === "ios" ? " is-here" : ""}`}>
                <h3>iPhone</h3>
                <AppStoreBadge height={44} />
                <p>iOS 16.4 以降</p>
              </div>
              <div className={`h-store${platform === "mac" ? " is-here" : ""}`}>
                <h3>Mac</h3>
                <a href="/download/mac" className="h-button">ダウンロード</a>
                <p>macOS 13 以降・Apple シリコン</p>
              </div>
              <div className={`h-store${platform === "windows" ? " is-here" : ""}`}>
                <h3>Windows</h3>
                <MicrosoftStoreBadge />
                <p>Windows 10・11</p>
              </div>
            </div>
            <div className="h-faq">
              {faqs.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
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
