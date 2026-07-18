"use client";

import { useEffect, useState } from "react";
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
import { usePrefersReducedMotion } from "./components/usePrefersReducedMotion";

const scenes = [
  {
    Illust: SceneOnline,
    photo: "/scenes/online-meeting.jpg",
    tag: "オンライン会議",
    title: "会議画面は、そのまま。",
    desc: "通話にボットを追加せず、マイクとパソコンの音を分けて記録します。",
    lines: [
      { speaker: "マイク", text: "次回は水曜日の10時でどうでしょう。" },
      { speaker: "パソコンの音", text: "了解です。予定を入れておきます。" },
      { speaker: "マイク", text: "資料は前日までに共有します。" },
      { speaker: "パソコンの音", text: "ありがとうございます。確認しておきます。" },
      { speaker: "マイク", text: "それでは、水曜日にお願いします。" },
      { speaker: "パソコンの音", text: "はい、よろしくお願いします。" },
    ],
  },
  {
    Illust: SceneMeeting,
    photo: "/scenes/in-person.jpg",
    tag: "対面",
    title: "パソコンを置くだけ。",
    desc: "自分と相手の声をその場で文字に。メモを取らず、会話に集中できます。",
    lines: [
      { speaker: "マイク", text: "まずは画面案から確認しましょう。" },
      { speaker: "マイク", text: "この配置なら見やすそうですね。" },
      { speaker: "マイク", text: "色だけ少し調整できますか。" },
      { speaker: "マイク", text: "今日中に修正版を作ります。" },
      { speaker: "マイク", text: "金曜日までに共有をお願いします。" },
      { speaker: "マイク", text: "分かりました。進めておきます。" },
    ],
  },
  {
    Illust: SceneLecture,
    photo: "/scenes/lecture.jpg",
    tag: "講義",
    title: "聞くことに集中。",
    desc: "聞き逃した箇所を、あとから文字と音声で確認できます。",
    lines: [
      { speaker: "マイク", text: "ここが今日の重要なポイントです。" },
      { speaker: "マイク", text: "まず、前回の内容を振り返ります。" },
      { speaker: "マイク", text: "この図を資料に残しておいてください。" },
      { speaker: "マイク", text: "試験でも扱う予定です。" },
      { speaker: "マイク", text: "次回までに資料を読んでおいてください。" },
      { speaker: "マイク", text: "それでは、今日はここまでです。" },
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

// 選択中の利用場面を、ヒーローのアプリモックと同じリズムで再生する。
// 1人目を入力→短く間を置く→2人目を入力→会話全体を見せてから繰り返す。
// 動きを減らすOS設定では、最初から全文を表示する。
function LiveSceneTranscript({
  lines,
}: {
  lines: { speaker: string; text: string }[];
}): ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const current = lines[lineIndex];
    const timer =
      typed < current.text.length
        ? window.setTimeout(() => setTyped((value) => value + 1), 48)
        : lineIndex < lines.length - 1
          ? window.setTimeout(() => {
              setLineIndex((value) => value + 1);
              setTyped(0);
            }, 760)
          : window.setTimeout(() => {
              setCycle((value) => value + 1);
              setLineIndex(0);
              setTyped(0);
            }, 2400);

    return () => window.clearTimeout(timer);
  }, [lineIndex, lines, reducedMotion, typed]);

  const fullTranscript = lines.map((line) => `${line.speaker}：${line.text}`).join(" ");
  const displayedLines = reducedMotion ? lines.slice(0, 3) : lines;
  const scrollOffset = reducedMotion ? 0 : Math.max(0, lineIndex - 2);

  return (
    <div className="scene-transcript" aria-label={fullTranscript}>
      <div key={cycle} className={`scene-transcript-track scene-offset-${scrollOffset}`}>
        {displayedLines.map((line, index) => {
          const visible = reducedMotion || index <= lineIndex;
          const complete = reducedMotion || index < lineIndex || typed >= line.text.length;
          const text = complete ? line.text : index === lineIndex ? line.text.slice(0, typed) : "";

          return (
            <div
              key={`${line.speaker}-${index}`}
              className={`scene-transcript-line${visible ? " is-visible" : ""}`}
              aria-hidden="true"
            >
              <span>{line.speaker}</span>
              <p>
                {text}
                {visible && !complete && <i className="scene-cursor" />}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
          <LiveSceneTranscript key={scene.tag} lines={scene.lines} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      {/* Nav */}
      <header className="nav-sticky">
        <div className="lp-inner nav-inner">
          <span className="nav-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="" width={26} height={26} />
            <span>Giroku</span>
          </span>
          <div className="nav-actions">
            <a href="#scenes" className="nav-secondary-link">使い方</a>
            <a href="#pricing" className="nav-secondary-link">料金</a>
            <a href="#download" className="nav-download">ダウンロード</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div className="lp-inner hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="hero-spirit">
                <LogoMark size={34} />
              </span>
              <p>
                録音 · 文字起こし · AI議事録
              </p>
            </div>
            <h1>
              相手に気づかれず、会話をまるごと記録。
            </h1>
            <p className="hero-description">
              マイクも、スマホ・パソコンの音も。ネットがなくても、あなたの端末だけで議事録に。
            </p>
            <div className="hero-actions">
              <a href="#download" className="button button-dark">
                無料でダウンロード
              </a>
              <a href="#scenes" className="text-link">使い方を見る →</a>
            </div>
            <p className="hero-note">1か月120分まで無料 · 登録不要 · macOS版を公開中</p>
          </div>
          <Reveal delay={120}>
            <div className="hero-product">
              <AppMock />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Girokuだけの3つ */}
      <section className="section section-muted">
        <div className="lp-inner section-inner">
          <Reveal>
            <div className="section-heading">
              <p className="section-eyebrow">Girokuだけの3つ</p>
              <h2 className="section-title">他にはない、3つの理由。</h2>
            </div>
          </Reveal>
          <div className="reasons-list">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={i * 80}>
                <div className="reason-row">
                  <div className="reason-icon">
                    <r.Icon />
                  </div>
                  <div className="reason-copy">
                    <h3>{r.title}</h3>
                    <p>{r.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Scenes */}
      <section id="scenes" className="section scenes-section">
        <div className="lp-inner section-inner">
          <Reveal>
            <div className="section-heading">
              <p className="section-eyebrow">使える場面</p>
              <h2 className="section-title">会議も、講義も。いつものまま記録。</h2>
            </div>
          </Reveal>
          <Reveal>
            <SceneExperience />
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section pricing-section">
        <div className="lp-inner section-inner">
          <Reveal>
            <div className="section-heading">
              <p className="section-eyebrow">料金</p>
              <h2 className="section-title">シンプルな2プラン。</h2>
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
      <section id="download" className="section download-section">
        <div className="lp-inner section-inner download-inner">
          <Reveal>
            <span className="hero-spirit download-spirit">
              <LogoMark size={40} />
            </span>
            <h2 className="section-title">今すぐ始める。</h2>
            <p className="download-description">登録せずに、すぐ使えます。</p>
            <div className="download-grid">
              <a href="/download/mac" className="download-option download-option-primary">
                macOS版をダウンロード
              </a>
              <span className="download-option">
                Windows版 — 準備中
              </span>
              <span className="download-option">
                iPhone版 — 準備中
              </span>
              <span className="download-option">
                Android版 — 準備中
              </span>
            </div>
            <p className="download-note">1か月120分まで無料 · Apple Silicon（M1以降）対応</p>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="lp-inner footer-inner">
          <span>© {new Date().getFullYear()} Naoya Tsuji</span>
          <div className="footer-links">
            <Link href="/privacy">プライバシー</Link>
            <Link href="/terms">利用規約</Link>
            <a href="mailto:naoyatttsuji@gmail.com">サポート</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
