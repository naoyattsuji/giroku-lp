"use client";
// Giroku アプリ本体（Apple ボイスメモ風UI）を模したヒーロー用モック。
// LPとアプリの世界観を視覚的につなぐための実物ライクな静的モックアップ。
// 実際のアプリUI（サイドバー4項目・音源トグルはMeet/Zoom風の丸ボタン+メーター・
// 話者タグは赤一色・オンライン状態は緑ドット）と同期させておくこと。
// 「話すだけで議事録になる」ことが一目で伝わるよう、文字起こしが実際に
// 流れていくライブ演出を付ける（prefers-reduced-motionでは静止表示）。
import { useEffect, useState, type ReactElement } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const INK = "#1c1c1e";
const DIM = "#8e8e93";
const RED = "#e8192c";
const OK = "#1a9d4b";

const SCRIPT = [
  { who: "マイク", text: "次回の打ち合わせは来週の水曜でどうでしょう。" },
  { who: "パソコンの音", text: "了解です、10時からでお願いします。" },
  { who: "マイク", text: "承知しました。議事録はあとでまとめて送ります。" },
  { who: "パソコンの音", text: "ありがとうございます、助かります。" },
  { who: "マイク", text: "それでは今日はここまでにしましょう。" },
  { who: "パソコンの音", text: "お疲れ様でした。" },
];

function useLiveTranscript(): { who: string; text: string; done: boolean }[] {
  const reducedMotion = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const line = SCRIPT[idx % SCRIPT.length];
    const timer =
      typed < line.text.length
        ? setTimeout(() => setTyped((t) => t + 1), 45)
        : setTimeout(() => {
            setIdx((i) => i + 1);
            setTyped(0);
          }, 1100);
    return () => clearTimeout(timer);
  }, [reducedMotion, idx, typed]);

  if (reducedMotion) {
    return SCRIPT.slice(0, 3).map((s) => ({ ...s, done: true }));
  }

  const current = SCRIPT[idx % SCRIPT.length];
  const lines: { who: string; text: string; done: boolean }[] = [];
  for (let back = 2; back >= 1; back--) {
    const i = idx - back;
    if (i >= 0) {
      const s = SCRIPT[i % SCRIPT.length];
      lines.push({ who: s.who, text: s.text, done: true });
    }
  }
  lines.push({ who: current.who, text: current.text.slice(0, typed), done: typed >= current.text.length });
  return lines;
}

function useLiveMeters(): { time: string; micLevel: number; pcLevel: number } {
  const reducedMotion = usePrefersReducedMotion();
  const [seconds, setSeconds] = useState(4 * 60 + 12);
  const [micLevel, setMicLevel] = useState(62);
  const [pcLevel, setPcLevel] = useState(38);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setInterval(() => {
      setSeconds((s) => s + 1);
      setMicLevel(30 + Math.round(Math.random() * 55));
      setPcLevel(20 + Math.round(Math.random() * 50));
    }, 1000);
    return () => clearInterval(t);
  }, [reducedMotion]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { time: `${mm}:${ss}`, micLevel, pcLevel };
}

function MicIcon(): ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v3M9 20h6" />
    </svg>
  );
}
function SpeakerIcon(): ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M17 9c1.5 1.2 1.5 4.8 0 6M19.5 6.5c3 2.4 3 8.6 0 11" />
    </svg>
  );
}
function RecordGlyph(): ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={RED}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
function ListGlyph(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DIM} strokeWidth="1.7" strokeLinecap="round">
      <path d="M8 7h11M8 12h11M8 17h11" />
      <circle cx="4.5" cy="7" r="1" fill={DIM} stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill={DIM} stroke="none" />
      <circle cx="4.5" cy="17" r="1" fill={DIM} stroke="none" />
    </svg>
  );
}
function TrashGlyph(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DIM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}
function GearGlyph(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DIM} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6" />
    </svg>
  );
}

function SourcePill({ Icon, label, level }: { Icon: () => ReactElement; label: string; level: number }): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: "1.3px solid #e2e2e6",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon />
      </span>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: INK, marginBottom: 3 }}>{label}</div>
        <div style={{ width: 44, height: 4, borderRadius: 999, background: "#ececef", overflow: "hidden" }}>
          <div style={{ width: `${level}%`, height: "100%", background: RED, transition: "width 0.5s ease" }} />
        </div>
      </div>
    </div>
  );
}

const sidebarItem = {
  width: 44,
  height: 44,
  borderRadius: 11,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
};

export function AppMock(): ReactElement {
  const lines = useLiveTranscript();
  const { time, micLevel, pcLevel } = useLiveMeters();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 30px 70px -20px rgba(0,0,0,0.28), 0 4px 14px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* タイトルバー */}
      <div
        style={{
          height: 34,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 14px",
          background: "#ececef",
          borderBottom: "1px solid #e2e2e6",
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
      </div>

      <div style={{ display: "flex", height: 300 }}>
        {/* サイドバー（録音・履歴・ゴミ箱・設定の4項目＋オンライン表示） */}
        <div
          style={{
            width: 66,
            background: "#ececef",
            borderRight: "1px solid #e2e2e6",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 16,
            gap: 4,
          }}
        >
          <div style={{ ...sidebarItem, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <RecordGlyph />
            <span style={{ fontSize: 8.5, fontWeight: 700, color: RED }}>録音</span>
          </div>
          <div style={sidebarItem}>
            <ListGlyph />
            <span style={{ fontSize: 8.5, fontWeight: 600, color: DIM }}>履歴</span>
          </div>
          <div style={sidebarItem}>
            <TrashGlyph />
            <span style={{ fontSize: 8.5, fontWeight: 600, color: DIM }}>ゴミ箱</span>
          </div>
          <div style={sidebarItem}>
            <GearGlyph />
            <span style={{ fontSize: 8.5, fontWeight: 600, color: DIM }}>設定</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span className="mock-online-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: OK }} />
            <span style={{ fontSize: 7.5, fontWeight: 700, color: DIM }}>オンライン</span>
          </div>
        </div>

        {/* メイン：録音中の画面 */}
        <div style={{ flex: 1, minWidth: 0, padding: "18px 22px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 10, columnGap: 16, paddingBottom: 14, borderBottom: "1px solid #e2e2e6", marginBottom: 14 }}>
            <span style={{ fontSize: 19, fontWeight: 300, color: INK, fontVariantNumeric: "tabular-nums", minWidth: 46 }}>{time}</span>
            <SourcePill Icon={MicIcon} label="マイク" level={micLevel} />
            <SourcePill Icon={SpeakerIcon} label="パソコンの音" level={pcLevel} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", minWidth: 0 }}>
            {lines.map((s, i) => (
              <div key={i} style={{ minWidth: 0 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: RED }}>{s.who}</span>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, lineHeight: 1.6, color: INK, wordBreak: "break-word" }}>
                  {s.text}
                  {!s.done && <span className="mock-cursor">|</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
