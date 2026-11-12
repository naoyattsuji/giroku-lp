"use client";

import { useSyncExternalStore } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ScrollFx } from "./components/ScrollFx";
import { MacLive, PhoneLive } from "./components/HeroLive";
import { MeetingScene } from "./components/MeetingScene";
import { SiteFooter } from "./components/SiteFooter";
import { HScroll } from "./components/HScroll";
import "./home.css";

/*
 * Giroku の紹介ページ。手本は Apple の製品ページ（短い見出し・本物の画面・余白）。
 * 来た端末に合った入口を一番に出し、ページの下ではすべての端末を選べるようにする。
 */

const APP_STORE_URL = "https://apps.apple.com/jp/app/giroku/id6826128219";
// PC 版 Pro の購入画面（Lemon Squeezy）。本番の商品ができたら差し替える（2026-11-08 時点は審査中）
// Lemon Squeezy のお店が本番になるまでは false（今の購入画面はテストモードで、本当には買えない）。
// 本番の商品の購入リンクに差し替えたら true にする（2026-11-12 の点検）
const PC_PRO_CHECKOUT_READY = false;
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

/** ダウンロードの所の3つ（見ている端末を先頭にして並べる） */
type StoreKey = "ios" | "mac" | "windows";
const STORES: Record<StoreKey, ReactElement> = {
  ios: (
    <>
      <h3>iPhone</h3>
      <div className="h-store-badge"><AppStoreBadge height={44} /></div>
      <p>iOS 16.4 以降</p>
    </>
  ),
  mac: (
    <>
      <h3>Mac</h3>
      <div className="h-store-badge"><MacDownloadBadge height={44} /></div>
      <p>macOS 13 以降・Apple シリコン</p>
    </>
  ),
  windows: (
    <>
      <h3>Windows</h3>
      <div className="h-store-badge"><MicrosoftStoreBadge /></div>
      <p>Windows 10・11（64ビット）</p>
    </>
  ),
};
function orderStores(platform: Platform): StoreKey[] {
  const all: StoreKey[] = ["ios", "mac", "windows"];
  return platform === "other" ? all : [platform, ...all.filter((k) => k !== platform)];
}

/** 上の帯の「ダウンロード」の行き先：見ている端末の入手先へ直接（分からないときはページの下へ） */
function downloadHref(platform: Platform): string {
  if (platform === "ios") return APP_STORE_URL;
  if (platform === "mac") return "/download/mac";
  if (platform === "windows") return "/download/windows";
  return "#download";
}

/** Pro にしか無いものの、無料の側の印（線） */
function Dash(): ReactElement {
  return (
    <svg className="h-check h-dash" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.5 8h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/*
 * 料金の比べる行。無料と Pro のカードに同じ項目を同じ順で並べ、横に見ればそのまま比べられるようにする
 * （2026-11-12 本人の指摘：左右で違う話が並び、字下げもそろっていなかった）
 */
const PLAN_ROWS: { label: string; free: string; freeNote?: string; pro: string; freeHas: boolean }[] = [
  { label: "録音・文字起こし", free: "何回でも", pro: "何回でも", freeHas: true },
  { label: "AI 議事録", free: "月5回", pro: "月100回", freeHas: true },
  { label: "AI への質問", free: "月10回", freeNote: "iPhone は月30回", pro: "月300回", freeHas: true },
  { label: "AI の性能", free: "標準", pro: "より高性能", freeHas: true },
  { label: "文章を整える", free: "―", pro: "使える", freeHas: false },
  { label: "iPhone 版の広告", free: "あり", pro: "なし", freeHas: false },
  { label: "「Giroku で作成」の一文", free: "付く", pro: "消せる", freeHas: false },
];

function PlanRows({ plan }: { plan: "free" | "pro" }): ReactElement {
  return (
    <ul className="h-rows">
      {PLAN_ROWS.map((row) => {
        const has = plan === "pro" || row.freeHas;
        return (
          <li key={row.label} className={has ? "" : "h-row-off"}>
            {has ? <Check /> : <Dash />}
            <span className="h-row-label">{row.label}</span>
            <span className="h-row-value">
              {plan === "pro" ? row.pro : row.free}
              {plan === "free" && row.freeNote ? <small>{row.freeNote}</small> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** スマホの幅だけで出す、無料と Pro の比べる表（1画面に収まる） */
function PlanCompare(): ReactElement {
  return (
    <div className="h-compare" data-reveal>
      <table>
        <caption className="h-sr">無料と Pro のちがい</caption>
        {/* 項目名の列を広くとり、言葉の途中で折り返さないようにする */}
        <colgroup>
          <col className="h-col-label" />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <td />
            <th scope="col">無料<span>¥0</span><small>登録なしで</small></th>
            <th scope="col">Pro<span>¥980<small>／年</small></span><small>月 ¥200 でも</small></th>
          </tr>
        </thead>
        <tbody>
          {PLAN_ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className={row.freeHas ? "" : "h-off"}>
                {row.free}
                {row.freeNote ? <small>{row.freeNote}</small> : null}
              </td>
              <td>{row.pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-compare-actions">
        <a href="#download" className="h-button h-button-gray">無料で始める</a>
        <p>
          Pro の購入：iPhone はアプリの［設定］から。Mac・Windows は
          {PC_PRO_CHECKOUT_READY ? <> <a href={PC_PRO_CHECKOUT_URL}>ウェブで購入</a></> : "準備中"}
        </p>
      </div>
    </div>
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
  { q: "音声は外に送られますか？", a: "送られません。文字起こしは端末の中です。AI 議事録・質問・文章を整えるを使うときだけ、文字をサーバーへ送ります。" },
  { q: "ネットがなくても使えますか？", a: "録音と文字起こしは使えます。Windows と iOS 26 より前の iPhone は、最初の録音のときに文字起こしの準備（約656MB）をネットから取得します。AI 議事録と質問にはネットが要ります。" },
  { q: "iPhone で相手の声も録れますか？", a: "iPhone はマイクの音だけです。オンライン会議の相手の声まで録るなら、Mac 版・Windows 版をお使いください。" },
  { q: "相手に知らせなくていいですか？", a: "相手の画面には何も出ませんが、録音するときはひとこと伝えるのがマナーです。" },
  { q: "使い方は？", a: "アプリの中の「使い方」（iPhone は下のタブ、パソコンは左の帯）から、画面つきで見られます。" },
  { q: "Pro は何台で使えますか？", a: "パソコン版は1つの購入でパソコン1台です。別のパソコンに移すときは、前のパソコンの［設定］で「この端末で解除」してから登録します。iPhone 版は購入した本人だけが使えます。" },
  { q: "機種変更したら Pro は？", a: "iPhone は、新しい iPhone の Giroku で［設定］→「購入を復元」を押します。パソコンは、前のパソコンで解除してから、購入のメールにある購入キーを新しいパソコンで登録します。" },
  { q: "Pro の解約は？", a: "iPhone は［設定］→ 自分の名前 →［サブスクリプション］から解約できます。パソコンは、購入したときのメールにある管理画面から解約できます（Giroku 0.1.90 以降は［設定］→［サブスクリプションを管理］からも開けます）。どちらも期間の終わりまでは Pro のままです。" },
];

/**
 * 見出しを文節ごとに分けて、1つずつ現れるようにする（動きは home.css の .h-w）。
 * "\n" は改行。読み上げでは普通の1つの文として読まれる（区切りは見た目だけ）。
 */
function Words({ parts }: { parts: string[] }): ReactElement {
  let i = 0;
  return (
    <>
      {parts.map((part, k) =>
        part === "\n" ? (
          <br key={k} />
        ) : (
          <span key={k} className="h-w" style={{ "--i": i++ } as CSSProperties}>
            {part}
          </span>
        ),
      )}
    </>
  );
}

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
            <a href="#faq">よくある質問</a>
          </nav>
          <a href={downloadHref(platform)} className="h-button h-button-small">ダウンロード</a>
        </div>
      </header>

      <main id="top">
        <section className="h-hero">
          <div className="h-inner h-hero-copy">
            <p className="h-eyebrow">無料の AI 議事録アプリ</p>
            <h1>
              <Words parts={["相手に", "気づかれず、", "\n", "会話を", "まるごと", "記録。"]} />
            </h1>
            <p className="h-lead">録音して、そのまま文字に。AI が議事録にまとめます。</p>
            <div className="h-hero-actions">
              <PrimaryAction platform={platform} />
              <a href="#download" className="h-link">ほかの端末 ›</a>
            </div>
          </div>
          <div className="h-hero-stage">
            <MacLive />
            <div className="h-hero-phone"><PhoneLive /></div>
          </div>
        </section>

        <Section id="features">
          <div data-reveal>
            <MeetingScene />
          </div>
        </Section>

        <Section tone="gray">
          <HScroll>
          <h2 className="h-center-title h-trio-title" data-reveal><Words parts={["録音から", "議事録まで、", "これひとつで。"]} /></h2>
          <div className="h-trio hs-track" data-reveal>
            <figure>
              <PhoneShot src="/shots/ios-04-minutes.webp" alt="AI 議事録。概要・決まったこと・やることが並ぶ" />
              <figcaption><b>AI が議事録をつくる</b>話のトピックごとに見出しを立てて、要点をまとめます</figcaption>
            </figure>
            <figure>
              <PhoneShot src="/shots/ios-05-chat.webp" alt="議事録への質問に、吹き出しで答えが返る" />
              <figcaption><b>AI と録音の内容について話せる</b>気になることを聞いたり、書き直しを頼んだりできます</figcaption>
            </figure>
            <figure>
              <PhoneShot src="/shots/ios-06.webp" alt="履歴。すべての録音・お気に入り・フォルダ・最近削除した項目" />
              <figcaption><b>録音を整理できる</b>フォルダ分け・お気に入り・検索ができます。消しても7日間は戻せます</figcaption>
            </figure>
          </div>
          </HScroll>
        </Section>

        <Section id="pricing">
          {/* スマホでは2枚を横に送ると片方しか見えず比べられないので、1つの比べる表にする（2026-11-12 本人の指摘）。
              パソコンは2枚のカードのまま。横に送る仕組み（HScroll）は料金では使わない */}
          <h2 className="h-center-title" data-reveal><Words parts={["基本は、", "無料。"]} /></h2>
          <PlanCompare />
          <div className="h-plans" data-reveal>
            <article className="h-plan">
              <h3>無料</h3>
              <p className="h-price"><strong>¥0</strong></p>
              <p className="h-plan-how">登録なしで使えます</p>
              <PlanRows plan="free" />
              <a href="#download" className="h-button h-button-gray">無料で始める</a>
            </article>
            <article className="h-plan h-plan-pro">
              <h3>Pro</h3>
              <p className="h-price"><strong>¥980</strong><span>／年（税込）</span></p>
              <p className="h-plan-how">月ごとなら ¥200／月</p>
              <PlanRows plan="pro" />
              <div className="h-plan-actions">
                <div>
                  <p className="h-plan-where">iPhone</p>
                  <p className="h-plan-how">アプリの［設定］から購入</p>
                </div>
                <div>
                  <p className="h-plan-where">Mac・Windows</p>
                  {PC_PRO_CHECKOUT_READY ? (
                    <a href={PC_PRO_CHECKOUT_URL} className="h-button h-button-small">ウェブで購入</a>
                  ) : (
                    <p className="h-plan-how">準備中</p>
                  )}
                </div>
              </div>
            </article>
          </div>
          {/* 1行に1つのことだけ（2026-11-12 本人の指摘：1段落に詰めるとわかりにくい） */}
          <div className="h-fineprint">
            <p>iPhone とパソコンは別々に購入します。パソコン版は1台、iPhone 版は購入した本人だけが使えます。</p>
            <p>自動で更新されます。解約は、iPhone は更新の24時間前まで、パソコンは更新日までに。</p>
            <p>1日に使える回数にも上限があります。AI 議事録は、会議1時間ごとに1回と数えます。</p>
            <p>iPhone の無料版は、月5回を使い切ったあとも、広告を見ると議事録をもう1回作れます。</p>
          </div>
        </Section>

        <section id="download" className="h-section h-section-gray h-download">
          <div className="h-inner">
            <h2 data-reveal><Words parts={["今すぐ、", "はじめよう。"]} /></h2>
            {/* 見ている端末の入口を先頭に。ここは押してもらう所なので、スクロールで自動に流さない（指で横にすべらせるのは可） */}
            <div className="h-stores" data-reveal>
              {orderStores(platform).map((key) => (
                <div className="h-store" key={key}>{STORES[key]}</div>
              ))}
            </div>
            <div className="h-faq" id="faq">
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

      <SiteFooter />
    </div>
  );
}
