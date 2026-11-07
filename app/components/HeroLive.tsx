"use client";

/*
 * 最初の画面の「動く実機」。Mac 版と iPhone 版の録音中の画面を HTML で組み立て、
 * 経過時間・音の目盛り・文字起こしを実際のアプリと同じように動かす。
 * 見た目は実際のアプリの画面写真（public/shots/pc-03-live.webp・ios-02.webp）から寸法を取った。
 * 大きさはすべて枠の幅に対する割合（cqw）なので、どの画面幅でも同じ見た目になる。
 * 動きを減らす設定の人には、止まった完成の画面を出す。
 */
import { useEffect, useState, type ReactElement } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Who = "PC" | "マイク";
const MAC_SCRIPT: { who: Who; text: string }[] = [
  { who: "PC", text: "よろしくお願いします。資料は先ほど共有しました。" },
  { who: "マイク", text: "おはようございます。今日は来月のキャンペーンの段取りを決めます。" },
  { who: "PC", text: "了解です。SNS の投稿も同じ日に出します。" },
  { who: "マイク", text: "告知は来週の月曜から始めましょう。" },
  { who: "PC", text: "承知しました。水曜の午前中に送ります。" },
];

const PHONE_SENTENCES = [
  "それでは、新商品の発売日について確認します。",
  "工場からは、12月の第2週には出荷できると連絡がありました。",
  "それなら、発売日は12月15日で進めましょう。",
  "販促は、店頭のポップと SNS の告知を先に準備したいです。",
];

const MAC_LENGTHS = MAC_SCRIPT.map((l) => l.text.length);
const PHONE_LENGTHS = PHONE_SENTENCES.map((t) => t.length);
const TYPE_MS = 55;
const GAP_MS = 900;

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

/** 経過時間（1秒ずつ） */
function useSeconds(start: number, running: boolean): number {
  const [s, setS] = useState(start);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return s;
}

/** 文字を1文字ずつ進める。行の終わりで少し間を置き、最後まで行ったら初めから */
function useTyping(lengths: number[], running: boolean): { line: number; chars: number; cycle: number } {
  const [state, setState] = useState({ line: 0, chars: 0, cycle: 0 });
  useEffect(() => {
    if (!running) return;
    const len = lengths[state.line];
    const t =
      state.chars < len
        ? setTimeout(() => setState((s) => ({ ...s, chars: s.chars + 1 })), TYPE_MS)
        : state.line < lengths.length - 1
          ? setTimeout(() => setState((s) => ({ ...s, line: s.line + 1, chars: 0 })), GAP_MS)
          : setTimeout(() => setState((s) => ({ line: 0, chars: 0, cycle: s.cycle + 1 })), 2600);
    return () => clearTimeout(t);
  }, [state.line, state.chars, lengths, running]);
  return state;
}

/** 話している間だけ揺れる音の目盛り（0〜1） */
function useLevel(active: boolean, running: boolean): number {
  const [v, setV] = useState(active ? 0.7 : 0.05);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setV(active ? 0.45 + Math.random() * 0.55 : Math.random() * 0.08), 140);
    return () => clearInterval(id);
  }, [active, running]);
  return v;
}

function MicIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  );
}
function SpeakerIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M15.5 9a4 4 0 0 1 0 6M18 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  );
}

// 左の帯は大事な所だけ（2026-11-08 本人：細かい項目が並びすぎる）。実際のアプリにはフォルダ・設定なども並ぶ
const SIDEBAR = [
  { label: "すべての録音", count: 7 },
  { label: "お気に入り", count: 1 },
];

/** Mac 版の録音中の画面 */
export function MacLive(): ReactElement {
  const reduced = usePrefersReducedMotion();
  const running = !reduced;
  const seconds = useSeconds(13, running);
  const { line, chars } = useTyping(MAC_LENGTHS, running);
  const current = MAC_SCRIPT[line];
  const typing = running && chars < current.text.length;
  const mic = useLevel(typing && current.who === "マイク", running);
  const pc = useLevel(typing && current.who === "PC", running);
  const shown = reduced ? MAC_SCRIPT : MAC_SCRIPT.slice(0, line + 1);

  return (
    <div className="lv-mac" role="img" aria-label="Mac 版で録音中の画面。マイクの声とパソコンの音が、それぞれ文字になって流れていく">
      <div className="lv-mac-bar" aria-hidden="true"><i /><i /><i /></div>
      <div className="lv-mac-body" aria-hidden="true">
        <aside className="lv-side">
          <p className="lv-side-rec"><span className="lv-dot" />録音</p>
          {SIDEBAR.map((item) => (
            <p key={item.label} className="lv-side-item">
              <span className="lv-ico" />
              {item.label}
              <em>{item.count}</em>
            </p>
          ))}
          <p className="lv-side-item"><span className="lv-ico lv-ico-trash" />最近削除した項目</p>
        </aside>
        <main className="lv-main">
          <div className="lv-top">
            <span className="lv-timer">{clock(seconds)}</span>
            <span className="lv-src">
              <span className="lv-round"><MicIcon /></span>
              <span className="lv-src-copy"><b>マイク</b><span className="lv-meter"><i style={{ transform: `scaleX(${reduced ? 0.6 : mic})` }} /></span></span>
            </span>
            <span className="lv-src">
              <span className="lv-round"><SpeakerIcon /></span>
              <span className="lv-src-copy"><b>パソコンの音</b><span className="lv-meter"><i style={{ transform: `scaleX(${reduced ? 0.4 : pc})` }} /></span></span>
            </span>
            <span className="lv-top-actions">
              <span>ミニ表示</span>
              <span>Ⅱ 一時停止</span>
              <span className="lv-stop"><i />停止</span>
            </span>
          </div>
          <div className="lv-lines">
            {shown.map((l, i) => {
              const isCurrent = !reduced && i === line;
              const text = isCurrent ? l.text.slice(0, chars) : l.text;
              return (
                <p key={i} className="lv-line">
                  <b>{l.who}</b>
                  {isCurrent && chars === 0 ? <span className="lv-wait"><i />認識中…</span> : <span>{text}</span>}
                </p>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

/** iPhone 版の録音中の画面 */
export function PhoneLive(): ReactElement {
  const reduced = usePrefersReducedMotion();
  const running = !reduced;
  const seconds = useSeconds(15, running);
  const { line, chars } = useTyping(PHONE_LENGTHS, running);
  const typing = running && chars < PHONE_SENTENCES[line].length;
  const mic = useLevel(typing, running);

  // 確定した文は濃く、話している途中の文は薄く（実際のアプリと同じ）
  const done = reduced ? PHONE_SENTENCES.join("") : PHONE_SENTENCES.slice(0, line).join("") + (typing ? "" : PHONE_SENTENCES[line]);
  const draft = reduced || !typing ? "" : PHONE_SENTENCES[line].slice(0, chars);

  return (
    <div className="lv-phone" role="img" aria-label="iPhone 版で録音中の画面。話している途中の言葉が薄い字で出て、文が終わると濃くなる">
      <div className="lv-screen" aria-hidden="true">
        <div className="lv-status">
          <span>9:41</span>
          <i className="lv-island" />
          <span className="lv-status-r">
            <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
            <span className="lv-batt"><i /></span>
          </span>
        </div>
        <p className="lv-pill"><span />録音中</p>
        <p className="lv-big">{clock(seconds)}</p>
        <p className="lv-micname"><b>マイク</b>（周りの声）</p>
        <span className="lv-pmeter"><i style={{ transform: `scaleX(${reduced ? 0.7 : mic})` }} /></span>
        <div className="lv-pbtns"><span>Ⅱ 一時停止</span><span className="lv-pstop"><i />停止</span></div>
        <div className="lv-card">
          <p className="lv-card-head"><b>文字起こし</b><span><i />聞き取り中</span></p>
          <p className="lv-card-text">{done}<span className="lv-draft">{draft}</span></p>
        </div>
        <div className="lv-tabs">
          <span className="is-on"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="currentColor" /><circle cx="12" cy="12" r="3.6" fill="#fff" /></svg>録音</span>
          <span><svg viewBox="0 0 24 24"><g fill="currentColor"><circle cx="5" cy="6.5" r="1.4" /><circle cx="5" cy="12" r="1.4" /><circle cx="5" cy="17.5" r="1.4" /><rect x="8.5" y="5.6" width="11" height="1.8" rx=".9" /><rect x="8.5" y="11.1" width="11" height="1.8" rx=".9" /><rect x="8.5" y="16.6" width="11" height="1.8" rx=".9" /></g></svg>履歴</span>
          <span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M9.6 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.3-1 .8-1 1.5v.4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="16.6" r="1.1" fill="#fff" /></svg>使い方</span>
          <span><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.8l1.6 2.3 2.7-.7.5 2.8 2.6 1.1-1 2.6 1.6 2.3-2.4 1.5.2 2.8-2.8.3-1.3 2.5L12 19.4l-1.8 1.9-1.3-2.5-2.8-.3.2-2.8-2.4-1.5 1.6-2.3-1-2.6 2.6-1.1.5-2.8 2.7.7z" /><circle cx="12" cy="12" r="3.2" fill="#fff" /></svg>設定</span>
        </div>
      </div>
    </div>
  );
}
