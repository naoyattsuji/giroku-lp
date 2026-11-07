"use client";

import { useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { ScrollFx } from "./components/ScrollFx";
import { MacLive, PhoneLive } from "./components/HeroLive";
import "./home.css";

/*
 * Giroku の紹介ページ。手本は Apple の製品ページ（短い見出し・本物の画面・余白）。
 * 来た端末に合った入口を一番に出し、ページの下ではすべての端末を選べるようにする。
 */

const APP_STORE_URL = "https://apps.apple.com/jp/app/giroku/id6826128219";
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

/** Microsoft Store の公式バッジ画像（Microsoft が配るもの。高さ 44px で、ほかの2つとそろう） */
function MicrosoftStoreBadge(): ReactElement {
  return (
    <a href="/download/windows" className="h-badge" aria-label="Microsoft Store からダウンロード">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://get.microsoft.com/images/ja%20dark.svg" alt="Microsoft Store からダウンロード" width={161} height={44} style={{ height: 44 }} />
    </a>
  );
}

/**
 * Mac 版の直接ダウンロード。隣の App Store・Microsoft Store のバッジと同じ「黒い角丸・2段の文字」にそろえる。
 * Apple のりんごの印は Apple の決まりで使えないので、ノートパソコンの形の印にする。
 */
function MacDownloadBadge({ height = 44 }: { height?: number }): ReactElement {
  // 外形・縁・字の位置は App Store の公式バッジと同じ（public/badges/mac-download-ja-black.svg）
  return (
    <a href="/download/mac" className="h-badge" aria-label="Mac 版を直接ダウンロード">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/badges/mac-download-ja-black.svg" alt="Mac 直接ダウンロード" height={height} style={{ height }} />
    </a>
  );
}

/** 端末に合わせた一番の入口（どれもストアのバッジと同じ形） */
function PrimaryAction({ platform }: { platform: Platform }): ReactElement {
  if (platform === "ios") return <AppStoreBadge height={44} />;
  if (platform === "mac") return <MacDownloadBadge height={44} />;
  if (platform === "windows") return <MicrosoftStoreBadge />;
  return <a href="#download" className="h-button">無料でダウンロード</a>;
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
      <ScrollFx />

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
            <p className="h-lead">録音して、そのまま文字に。AIが議事録にまとめます。</p>
            <div className="h-hero-actions">
              <PrimaryAction platform={platform} />
              <a href="#download" className="h-link">ほかの端末 ›</a>
            </div>
            <p className="h-hero-note">全機能無料・登録不要・iPhone／Mac／Windows</p>
          </div>
          <div className="h-hero-stage" data-scroll>
            <MacLive />
            <div className="h-hero-phone"><PhoneLive /></div>
          </div>
        </section>

        <Section id="features">
          <div className="h-points" data-reveal>
            <div>
              <span className="h-point-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 12s3.5-6.5 9-6.5c1.9 0 3.5.7 4.9 1.7M21 12s-3.5 6.5-9 6.5c-1.9 0-3.5-.7-4.9-1.7" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M4 20 20 4" /></svg></span>
              <h3>相手に気づかれない</h3>
              <p>会議に録音用の参加者が入らないので、相手には分かりません。</p>
            </div>
            <div>
              <span className="h-point-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="5" height="9" rx="2.5" /><path d="M2.5 11a4 4 0 0 0 8 0M6.5 15v4" /><path d="M13.5 10h2.5l3.5-3v10l-3.5-3h-2.5z" /><path d="M21.5 9.5a3 3 0 0 1 0 5" /></svg></span>
              <h3>自分の声も、パソコンの音も</h3>
              <p>パソコン版は、マイクとパソコンの音を同時に録音します。</p>
            </div>
            <div>
              <span className="h-point-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.6a5 5 0 0 1 6.8 0" /><circle cx="12" cy="19" r="1" fill="currentColor" /><path d="M4 21 20 3" /></svg></span>
              <h3>ネットがなくても文字に</h3>
              <p>文字起こしは端末の中だけ。音声は外に送られません。</p>
            </div>
          </div>
        </Section>

        <Section tone="gray">
          <h2 className="h-center-title" data-reveal>録音から議事録まで、これひとつで。</h2>
          <div className="h-trio" data-scroll>
            <figure>
              <PhoneShot src="/shots/ios-04.webp" alt="AI 議事録。概要・決まったこと・やることが並ぶ" />
              <figcaption><b>AI が議事録をつくる</b>話のトピックごとに見出しを立てて、要点をまとめます</figcaption>
            </figure>
            <figure>
              <PhoneShot src="/shots/ios-05.webp" alt="議事録への質問に、吹き出しで答えが返る" />
              <figcaption><b>AI と録音の内容について話せる</b>気になることを聞いたり、書き直しを頼んだりできます</figcaption>
            </figure>
            <figure>
              <PhoneShot src="/shots/ios-06.webp" alt="履歴。すべての録音・お気に入り・フォルダ・最近削除した項目" />
              <figcaption><b>録音を整理できる</b>フォルダ分け・お気に入り・検索。消しても7日間は戻せます</figcaption>
            </figure>
          </div>
        </Section>

        <Section id="pricing">
          <h2 className="h-center-title" data-reveal>全機能、無料。</h2>
          <div className="h-plans" data-reveal>
            <article className="h-plan">
              <h3>無料</h3>
              <p className="h-price"><strong>¥0</strong></p>
              <ul className="h-list">
                <li><Check />録音・文字起こし・AI 議事録</li>
                <li><Check />何回でも使える</li>
                <li className="h-muted">iPhone 版は広告あり</li>
              </ul>
              <a href="#download" className="h-button h-button-gray">無料で始める</a>
            </article>
            <article className="h-plan h-plan-pro">
              <h3>Pro</h3>
              <p className="h-price"><strong>¥980</strong><span>／年（税込）</span></p>
              <ul className="h-list">
                <li><Check />広告なし</li>
                <li><Check />より高性能な AI で議事録を作成</li>
                <li><Check />文字起こしの誤字・句読点を自動で直す</li>
              </ul>
              <div className="h-plan-actions">
                <div>
                  <p className="h-plan-where">iPhone</p>
                  <p className="h-plan-how">アプリの［設定］から購入</p>
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
            <h2 data-reveal>今すぐ、無料で。</h2>
            <div className="h-stores" data-reveal>
              <div className="h-store">
                <h3>iPhone</h3>
                <div className="h-store-badge"><AppStoreBadge height={44} /></div>
                <p>iOS 16.4 以降</p>
              </div>
              <div className="h-store">
                <h3>Mac</h3>
                <div className="h-store-badge"><MacDownloadBadge height={44} /></div>
                <p>macOS 13 以降・Apple シリコン</p>
              </div>
              <div className="h-store">
                <h3>Windows</h3>
                <div className="h-store-badge"><MicrosoftStoreBadge /></div>
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
