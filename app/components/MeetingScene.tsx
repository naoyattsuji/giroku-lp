"use client";

/*
 * 強み3つを「オンライン会議中の1画面」で見せる（G案、2026-11-08 本人が選んだ形）。
 * 会議の画面に ①②③ の印を打ち、横の説明と結びつける。
 * 絵の中は「参加者の数・ネットなし・2人の画面・目盛り・会話1行」だけ（会議の名前は置かない。B 案）。
 *  ① 参加者は2人のまま（録音用の Bot が入らない）
 *  ② マイクとパソコンの音、2本の目盛りが話す人に合わせて動く
 *  ③ ネットなしでも文字になる（機内モードでも文字起こしが進む）
 * 動きを減らす設定の人には、止まった完成の画面を出す。
 */
import { useEffect, useState, type ReactElement } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import "./meeting.css";

const TURNS: { who: "マイク" | "PC"; speaker: 0 | 1; text: string }[] = [
  { who: "PC", speaker: 1, text: "資料は先ほど共有しました。" },
  { who: "マイク", speaker: 0, text: "では、発売日から決めましょう。" },
  { who: "PC", speaker: 1, text: "12月15日でどうでしょう。" },
  { who: "マイク", speaker: 0, text: "それで進めます。" },
];

function useTurn(running: boolean): number {
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTurn((t) => (t + 1) % TURNS.length), 2400);
    return () => clearInterval(id);
  }, [running]);
  return turn;
}

function useLevel(active: boolean, running: boolean): number {
  const [v, setV] = useState(active ? 0.7 : 0.06);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setV(active ? 0.45 + Math.random() * 0.55 : Math.random() * 0.08), 150);
    return () => clearInterval(id);
  }, [active, running]);
  return v;
}

const POINTS = [
  { title: "相手に気づかれない", text: "録音用の Bot は入りません。相手の画面はいつもどおりです。" },
  { title: "自分の声も、パソコンの音も", text: "パソコン版は、マイクの声とパソコンの音を同時に録音します。" },
  { title: "ネットがなくても文字に", text: "最初に一度準備すれば、文字起こしは端末の中で行います。音声は外に出ません。" },
];

export function MeetingScene(): ReactElement {
  const reduced = usePrefersReducedMotion();
  const running = !reduced;
  const turn = useTurn(running);
  const current = TURNS[turn];
  const mic = useLevel(current.who === "マイク", running);
  const pc = useLevel(current.who === "PC", running);
  // 会話は1行だけ見せる（情報を減らす。2026-11-08 本人が B 案を選んだ）
  const lines = reduced ? [TURNS[2]] : [current];

  return (
    <div className="ms">
      <div className="ms-scene" role="img" aria-label="オンライン会議の画面。参加者は山田さんと佐藤さんの2人だけ。マイクとパソコンの音の目盛りが動き、ネットなしでも会話が文字になっていく">
        <div className="ms-window" aria-hidden="true">
          <div className="ms-head">
            <span className="ms-count">参加者 2人</span>
            <span className="ms-offline">
              <svg viewBox="0 0 24 24"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.6a5 5 0 0 1 6.8 0" /><circle cx="12" cy="19" r="1" /><path d="M4 21 20 3" /></svg>
              ネットなし
            </span>
          </div>
          <div className="ms-tiles">
            {["山田", "佐藤"].map((name, i) => (
              <div key={name} className={`ms-tile${running && current.speaker === i ? " is-speaking" : ""}`}>
                <span className="ms-avatar">{name[0]}</span>
                <span className="ms-name">{name}</span>
              </div>
            ))}
          </div>
          <div className="ms-giroku">
            <div className="ms-meters">
              <p><b>マイク</b><span className="ms-meter"><i style={{ transform: `scaleX(${reduced ? 0.6 : mic})` }} /></span></p>
              <p><b>パソコンの音</b><span className="ms-meter"><i style={{ transform: `scaleX(${reduced ? 0.45 : pc})` }} /></span></p>
            </div>
            <div className="ms-lines">
              {lines.map((l, i) => (
                <p key={`${turn}-${i}`} className={running ? "is-new" : ""}><b>{l.who}</b>{l.text}</p>
              ))}
            </div>
          </div>
        </div>
        <span className="ms-pin ms-pin-1" aria-hidden="true">1</span>
        <span className="ms-pin ms-pin-2" aria-hidden="true">2</span>
        <span className="ms-pin ms-pin-3" aria-hidden="true">3</span>
      </div>
      <ol className="ms-points">
        {POINTS.map((p, i) => (
          <li key={p.title}>
            <span className="ms-num" aria-hidden="true">{i + 1}</span>
            <div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
