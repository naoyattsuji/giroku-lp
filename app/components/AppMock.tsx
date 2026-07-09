// Giroku アプリ本体（Apple ボイスメモ風UI）を模したヒーロー用モック。
// LPとアプリの世界観を視覚的につなぐための実物ライクな静的モックアップ。
import type { ReactElement } from "react";

const INK = "#1c1c1e";
const DIM = "#8e8e93";
const RED = "#e8192c";
const MIC = "#0a84ff";

function MicIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DIM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v3M9 20h6" />
    </svg>
  );
}
function SpeakerIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DIM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
function GearGlyph(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DIM} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6" />
    </svg>
  );
}

const check = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11.5,
  fontWeight: 600,
  padding: "5px 10px",
  borderRadius: 999,
  background: "#f0f0f2",
  color: INK,
  whiteSpace: "nowrap",
} as const;

const bars = [8, 16, 10, 20, 13, 22, 9, 17, 12];

export function AppMock(): ReactElement {
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
        {/* サイドバー */}
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
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
            <RecordGlyph />
            <span style={{ fontSize: 8.5, fontWeight: 700, color: RED }}>録音</span>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 11, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
            <ListGlyph />
            <span style={{ fontSize: 8.5, fontWeight: 600, color: DIM }}>履歴</span>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 11, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
            <GearGlyph />
            <span style={{ fontSize: 8.5, fontWeight: 600, color: DIM }}>設定</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: MIC }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: INK }}>高精度</span>
          </div>
        </div>

        {/* メイン：録音中の画面 */}
        <div style={{ flex: 1, padding: "18px 22px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 10, columnGap: 10, paddingBottom: 12, borderBottom: "1px solid #e2e2e6", marginBottom: 14 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 3, height: 20 }}>
              {bars.map((h, i) => (
                <span
                  key={i}
                  style={{ width: 2.6, height: h, borderRadius: 2, background: RED, opacity: 0.55 + (i % 3) * 0.15 }}
                />
              ))}
            </div>
            <span style={{ fontSize: 19, fontWeight: 300, color: INK, fontVariantNumeric: "tabular-nums" }}>04:12</span>
            <span style={{ flex: 1, minWidth: 0 }} />
            <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
              <span style={check}>
                <MicIcon /> マイク
              </span>
              <span style={check}>
                <SpeakerIcon /> パソコンの音
              </span>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
            {[
              { who: "マイク", color: MIC, text: "次回の打ち合わせは来週の水曜でどうでしょう。" },
              { who: "パソコンの音", color: RED, text: "了解です、10時からでお願いします。" },
              { who: "マイク", color: MIC, text: "承知しました。議事録はあとでまとめて送ります。" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{ width: 64, flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: s.color, textAlign: "right" }}>
                  {s.who}
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.6, color: INK }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
