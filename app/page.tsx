"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import {
  SceneOnline,
  SceneMeeting,
  SceneLecture,
  SceneImage,
  LogoMark,
} from "./components/Illustrations";
import { AppMock } from "./components/AppMock";
import { Reveal } from "./components/Reveal";

const scenes = [
  {
    Illust: SceneOnline,
    photo: "/scenes/online-meeting.jpg",
    tag: "オンライン会議",
    title: "会議画面は、そのまま。",
    desc: "通話にボットを追加せず、マイクとパソコンの音を分けてリアルタイムで記録します。",
    lines: [
      { speaker: "マイク", text: "次回は水曜日の10時でどうでしょう。" },
      { speaker: "パソコンの音", text: "了解です。予定を入れておきます。" },
    ],
  },
  {
    Illust: SceneMeeting,
    photo: "/scenes/in-person.jpg",
    tag: "対面",
    title: "パソコンを置くだけ。",
    desc: "自分と相手の声をその場で文字に。会話を止めず、メモを取る手間を減らせます。",
    lines: [
      { speaker: "マイク", text: "まずは画面案から確認しましょう。" },
      { speaker: "マイク", text: "金曜日までに共有をお願いします。" },
    ],
  },
  {
    Illust: SceneLecture,
    photo: "/scenes/lecture.jpg",
    tag: "講義",
    title: "聞くことに集中。",
    desc: "聞き逃した箇所を、あとから文字と音声で確認。大切な説明を探し直せます。",
    lines: [
      { speaker: "マイク", text: "ここが今日の重要なポイントです。" },
      { speaker: "マイク", text: "次回までに資料を読んでおいてください。" },
    ],
  },
];

// マスコット「ひそか」の胴体（LogoMarkと同じパス）。3つの理由アイコンでは
// 目・小道具だけを変え、体形は常に同じにして「ひそか」だと一目でわかるようにする。
const SPIRIT_BODY = "M12 3.5c4.7 0 7.5 3.3 7.5 8v6.3c0 .6-.7 1-1.2.6l-1.4-1.1-1.5 1.2c-.4.3-1 .3-1.3 0l-1.5-1.2-1.6 1.2c-.4.3-1 .3-1.3 0l-1.5-1.2-1.4 1.1c-.5.4-1.2 0-1.2-.6V11.5c0-4.7 2.8-8 7.4-8z";

function SpiritStealthIcon(): ReactElement {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true" className="spirit-hook spirit-hook-stealth">
      <path d={SPIRIT_BODY} fill="#e8192c" />
      {/* サングラス＝気づかれずこっそり見ている */}
      <rect x="7.4" y="10.5" width="3.6" height="2.4" rx="1.2" fill="#1c1c1e" />
      <rect x="13" y="10.5" width="3.6" height="2.4" rx="1.2" fill="#1c1c1e" />
      <path d="M11 11.4h2" stroke="#1c1c1e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function SpiritMicIcon(): ReactElement {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true" className="spirit-hook spirit-hook-mic">
      <path d={SPIRIT_BODY} fill="#e8192c" />
      <circle cx="9.3" cy="11.5" r="1" fill="#fff" />
      <circle cx="14.7" cy="11.5" r="1" fill="#fff" />
      {/* 小さなマイク（丸頭+スタンド）を持っている＝音を両方拾う。定番の
          マイクのシルエットの方が小さいサイズでも一目でわかるため採用 */}
      <g transform="translate(15,12.4)">
        <circle cx="1.8" cy="1.8" r="2.9" fill="#1c1c1e" />
        <path d="M1.8 4.8v3.2" stroke="#1c1c1e" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M-0.4 8h4.4" stroke="#1c1c1e" strokeWidth="1.3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function SpiritOfflineIcon(): ReactElement {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true" className="spirit-hook spirit-hook-offline">
      <path d={SPIRIT_BODY} fill="#e8192c" />
      <circle cx="9.3" cy="11.5" r="1" fill="#fff" />
      <circle cx="14.7" cy="11.5" r="1" fill="#fff" />
      {/* wifi-offバッジ＝ネットなしでも平気（ひそかは止まらず浮遊し続ける） */}
      <g transform="translate(14.6,13.6)">
        <path d="M0.4 3.1a5 5 0 0 1 5.6 0" stroke="#1c1c1e" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <circle cx="3.2" cy="5.4" r="0.7" fill="#1c1c1e" />
        <path d="M-0.6 0.4l7.6 5.8" stroke="#1c1c1e" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const reasons = [
  { title: "相手に、気づかれない。", desc: "通話に何も追加しません。相手の画面は、いつもと同じままです。", Icon: SpiritStealthIcon },
  { title: "マイクも、スマホ・パソコンの音も。", desc: "オンライン会議も、対面も、講義も。全てきちんと録れます。", Icon: SpiritMicIcon },
  { title: "ネットが、なくても。", desc: "機内でも、地下でも、電波の外でも。止まらず録れます。", Icon: SpiritOfflineIcon },
];

// 利用場面を1つずつ大きく見せる切り替え式パネル。写真だけに説明を任せず、
// その場でGirokuが表示する文字起こしまで並べて、使い方を具体的に伝える。
function SceneExperience(): ReactElement {
  const [active, setActive] = useState(0);
  const scene = scenes[active];
  const ActiveIllustration = scene.Illust;

  const moveTab = (index: number) => {
    const next = (index + scenes.length) % scenes.length;
    setActive(next);
    document.getElementById(`scene-tab-${next}`)?.focus();
  };

  return (
    <div className="scene-experience">
      <div className="scene-tabs" role="tablist" aria-label="利用場面を選ぶ">
        {scenes.map(({ tag }, index) => (
          <button
            id={`scene-tab-${index}`}
            key={tag}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls="scene-panel"
            tabIndex={active === index ? 0 : -1}
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") { event.preventDefault(); moveTab(index + 1); }
              if (event.key === "ArrowLeft") { event.preventDefault(); moveTab(index - 1); }
              if (event.key === "Home") { event.preventDefault(); moveTab(0); }
              if (event.key === "End") { event.preventDefault(); moveTab(scenes.length - 1); }
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div id="scene-panel" role="tabpanel" aria-labelledby={`scene-tab-${active}`} className="scene-experience-card" key={scene.tag}>
        <div className="scene-experience-photo">
          <SceneImage src={scene.photo} alt={`${scene.tag}でGirokuを使う様子`} fallback={<ActiveIllustration />} />
          <span className="scene-recording"><i /> 録音中</span>
        </div>
        <div className="scene-experience-copy">
          <p className="scene-tag">{scene.tag}</p>
          <h3>{scene.title}</h3>
          <p className="scene-description">{scene.desc}</p>
          <div className="scene-transcript" aria-label={`${scene.tag}の文字起こし例`}>
            {scene.lines.map((line, index) => (
              <div key={`${line.speaker}-${index}`}>
                <span>{line.speaker}</span>
                <p>{line.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const btnDark = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "14px 30px",
  background: "var(--text-1)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 999,
  whiteSpace: "nowrap" as const,
  transition: "opacity 0.15s, transform 0.15s",
};

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <header className="nav-sticky">
        <div className="lp-inner" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={26} height={26} style={{ display: "block" }} />
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--text-1)" }}>Giroku</span>
          </span>
          <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
            <a href="#scenes" className="nav-secondary-link" style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500, whiteSpace: "nowrap" }}>使い方</a>
            <a href="#pricing" className="nav-secondary-link" style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500, whiteSpace: "nowrap" }}>料金</a>
            <a
              href="#download"
              style={{ fontSize: 13, color: "#fff", background: "var(--red)", padding: "8px 18px", borderRadius: 999, fontWeight: 700, whiteSpace: "nowrap" }}
            >
              ダウンロード
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div
          className="lp-inner hero-grid"
          style={{ paddingTop: 76, paddingBottom: 90, display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 48, alignItems: "center" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <span className="hero-spirit">
                <LogoMark size={34} />
              </span>
              <p style={{ display: "inline-flex", fontSize: 12, letterSpacing: "0.02em", color: "var(--red)", fontWeight: 700, background: "rgba(232,25,44,0.08)", padding: "5px 12px", borderRadius: 999 }}>
                録音 · 文字起こし · AI議事録
              </p>
            </div>
            <h1 style={{ fontSize: "clamp(32px, 3.6vw, 44px)", fontWeight: 800, lineHeight: 1.28, letterSpacing: "-0.03em", marginBottom: 22, color: "var(--text-1)" }}>
              相手に<br className="br-narrow" />気づかれず、<br />会話をまるごと<br className="br-narrow" />記録。
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.75, maxWidth: 440, marginBottom: 34 }}>
              マイクも、スマホ・パソコンの音も。ネットがなくても、あなたの端末だけで議事録に。
            </p>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <a
                href="#download"
                style={btnDark}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                無料でダウンロード
              </a>
              <a href="#scenes" style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500 }}>使い方を見る →</a>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-3)" }}>1か月120分まで無料 · 登録不要 · macOS版を公開中</p>
          </div>
          <Reveal delay={120}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AppMock />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Girokuだけの3つ */}
      <section style={{ background: "var(--surface-2)" }}>
        <div className="lp-inner" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <Reveal>
            <p style={{ fontSize: 13, letterSpacing: "0.02em", color: "var(--red)", fontWeight: 700, marginBottom: 12 }}>Girokuだけの3つ</p>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-1)" }}>
              他にはない、3つの理由。
            </h2>
          </Reveal>
          <div>
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={i * 80}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "28px 0", borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
                  <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <r.Icon />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "clamp(20px, 2.2vw, 26px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-1)", marginBottom: 8, lineHeight: 1.3 }}>
                      {r.title}
                    </h3>
                    <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 600 }}>
                      {r.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Scenes */}
      <section id="scenes" className="scenes-section">
        <div className="lp-inner scenes-inner">
          <Reveal>
            <div className="scenes-heading">
              <p>使える場面</p>
              <h2>会議も、講義も。<br />いつものまま記録。</h2>
            </div>
          </Reveal>
          <Reveal>
            <SceneExperience />
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing-section">
        <div className="lp-inner pricing-inner">
          <Reveal>
            <div className="pricing-heading">
              <p>料金</p>
              <h2>シンプルな2プラン。</h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="pricing-compare">
              <div className="plan-head-row">
                <div className="comparison-corner" aria-hidden="true" />
                <article className="plan-head">
                  <p className="plan-name">無料</p>
                  <div className="plan-price"><strong>¥0</strong></div>
                  <a href="#download" className="plan-button plan-button-free">無料で始める</a>
                </article>
                <article className="plan-head plan-head-paid">
                  <p className="plan-name">有料</p>
                  <div className="plan-price"><strong>¥980</strong><small>/ 年</small></div>
                  <a
                    href="https://naoyatsuji.lemonsqueezy.com/checkout/buy/5683990b-8898-4ca6-aa05-5e287095d747"
                    className="plan-button plan-button-paid"
                  >
                    購入する
                  </a>
                </article>
              </div>

              <div className="comparison-body" role="table" aria-label="無料プランと有料プランの比較">
                <div className="comparison-row" role="row">
                  <div className="comparison-label" role="rowheader">文字起こし</div>
                  <div className="comparison-value" role="cell"><strong>月120分</strong></div>
                  <div className="comparison-value paid-value" role="cell"><strong>制限なし</strong></div>
                </div>
                <div className="comparison-row" role="row">
                  <div className="comparison-label" role="rowheader">AI議事録</div>
                  <div className="comparison-value" role="cell"><strong>月2件</strong></div>
                  <div className="comparison-value paid-value" role="cell"><strong>制限なし</strong></div>
                </div>
                <div className="comparison-row" role="row">
                  <div className="comparison-label" role="rowheader">AIへの質問・修正</div>
                  <div className="comparison-value" role="cell"><strong>1件につき10回</strong></div>
                  <div className="comparison-value paid-value" role="cell"><strong>制限なし</strong></div>
                </div>
                <div className="comparison-row" role="row">
                  <div className="comparison-label" role="rowheader">端末での利用</div>
                  <div className="comparison-value" role="cell"><strong>登録不要</strong></div>
                  <div className="comparison-value paid-value" role="cell"><strong>2台まで</strong></div>
                </div>
              </div>
              <div className="pricing-footnote">
                <p>有料プランは1年分を一括購入。自動更新はありません。</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Download */}
      <section id="download" style={{ background: "var(--bg)" }}>
        <div className="lp-inner" style={{ paddingTop: 92, paddingBottom: 92, textAlign: "center" }}>
          <Reveal>
            <span className="hero-spirit" style={{ display: "inline-flex", marginBottom: 18 }}>
              <LogoMark size={40} />
            </span>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 28, color: "var(--text-1)" }}>
              今すぐ始める
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 12, width: "min(100%, 620px)", margin: "0 auto 18px" }}>
              <a
                href="/download/mac"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 24px", background: "var(--red)", color: "white", fontSize: 14, fontWeight: 700, borderRadius: 999, whiteSpace: "nowrap" }}
              >
                macOS版をダウンロード
              </a>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 24px", background: "var(--surface-2)", color: "var(--text-3)", fontSize: 14, borderRadius: 999, whiteSpace: "nowrap" }}>
                Windows版 — 準備中
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 24px", background: "var(--surface-2)", color: "var(--text-3)", fontSize: 14, borderRadius: 999, whiteSpace: "nowrap" }}>
                iPhone版 — 準備中
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 24px", background: "var(--surface-2)", color: "var(--text-3)", fontSize: 14, borderRadius: 999, whiteSpace: "nowrap" }}>
                Android版 — 準備中
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-3)" }}>1か月120分まで無料 · 登録不要 · Apple Silicon（M1以降）対応</p>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "auto", background: "var(--surface-2)" }}>
        <div className="lp-inner" style={{ paddingTop: 22, paddingBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>© {new Date().getFullYear()} Naoya Tsuji</span>
          <div style={{ display: "flex", gap: 22 }}>
            <Link href="/privacy" style={{ fontSize: 12.5, color: "var(--text-3)" }}>プライバシー</Link>
            <Link href="/terms" style={{ fontSize: 12.5, color: "var(--text-3)" }}>利用規約</Link>
            <a href="mailto:naoyatttsuji@gmail.com" style={{ fontSize: 12.5, color: "var(--text-3)" }}>サポート</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
