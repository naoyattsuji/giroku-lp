// Giroku LP 用の軽量ラインアート・イラスト集（モノ＋赤アクセント）。
// 文字に頼らず直感的に伝えるための図解・シーンイラスト。
import type { ReactElement } from "react";

const INK = "#0a0a0a";
const RED = "#e8192c";
const FAINT = "#d9d9d9";

/** ヒーロー用フロー図：あらゆる場面（オンライン会議・対面・講義）→ デバイス内で文字起こし → 議事録 */
export function HeroDiagram(): ReactElement {
  return (
    <svg viewBox="0 0 560 320" width="100%" role="img" aria-label="オンライン会議・対面ミーティング・講義など、あらゆる会話を録音ボットなしでデバイス内だけで議事録化する流れ" style={{ maxWidth: 560 }}>
      {/* 左：3つの利用場面（オールインワンの入力） */}
      {/* オンライン会議 */}
      <g transform="translate(8,26)">
        <rect x="0" y="0" width="118" height="60" rx="8" fill="none" stroke={INK} strokeWidth="2.2" />
        <rect x="14" y="14" width="40" height="30" rx="4" fill="none" stroke={INK} strokeWidth="1.8" />
        <circle cx="34" cy="26" r="5" fill="none" stroke={INK} strokeWidth="1.6" />
        <path d="M26 40c0-5 4-8 8-8s8 3 8 8" fill="none" stroke={INK} strokeWidth="1.6" />
        <rect x="64" y="18" width="40" height="7" rx="3.5" fill={FAINT} />
        <rect x="64" y="31" width="30" height="7" rx="3.5" fill={FAINT} />
        <text x="59" y="80" fontSize="11" fill={INK} textAnchor="middle" fontWeight="600">オンライン会議</text>
      </g>
      {/* 対面ミーティング */}
      <g transform="translate(8,128)">
        <rect x="0" y="0" width="118" height="60" rx="8" fill="none" stroke={INK} strokeWidth="2.2" />
        <g stroke={INK} strokeWidth="1.8" fill="none">
          <circle cx="40" cy="22" r="7" />
          <path d="M28 44c0-8 5-13 12-13s12 5 12 13" />
          <circle cx="78" cy="22" r="7" />
          <path d="M66 44c0-8 5-13 12-13s12 5 12 13" />
        </g>
        <ellipse cx="59" cy="46" rx="34" ry="6" fill="none" stroke={FAINT} strokeWidth="2" />
        <text x="59" y="80" fontSize="11" fill={INK} textAnchor="middle" fontWeight="600">対面ミーティング</text>
      </g>
      {/* 大学の講義 */}
      <g transform="translate(8,230)">
        <rect x="0" y="0" width="118" height="60" rx="8" fill="none" stroke={INK} strokeWidth="2.2" />
        <rect x="14" y="12" width="44" height="30" rx="3" fill="none" stroke={INK} strokeWidth="1.8" />
        <path d="M22 22h28M22 30h20" stroke={FAINT} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="88" cy="22" r="6" fill="none" stroke={INK} strokeWidth="1.8" />
        <path d="M76 44c0-7 5-11 12-11s12 4 12 11" fill="none" stroke={INK} strokeWidth="1.8" />
        <text x="59" y="80" fontSize="11" fill={INK} textAnchor="middle" fontWeight="600">大学の講義</text>
      </g>

      {/* 収束する音声の矢印 → デバイス */}
      <g stroke={RED} strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M132 52C168 52 176 150 214 158" markerEnd="url(#arrow)" />
        <path d="M132 158h74" markerEnd="url(#arrow)" />
        <path d="M132 264C168 264 176 168 214 160" markerEnd="url(#arrow)" />
      </g>

      {/* 中央：あなたのデバイス（REC · LOCAL） */}
      <g>
        <rect x="222" y="104" width="150" height="104" rx="10" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <rect x="222" y="104" width="150" height="26" rx="10" fill={INK} />
        <circle cx="238" cy="117" r="4" fill={RED} />
        <text x="272" y="121" fontSize="9" fill="#fff" fontWeight="700" letterSpacing="1">REC · LOCAL</text>
        <rect x="238" y="144" width="70" height="6" rx="3" fill={INK} />
        <rect x="238" y="158" width="112" height="6" rx="3" fill={FAINT} />
        <rect x="238" y="172" width="90" height="6" rx="3" fill={RED} opacity="0.85" />
        <rect x="238" y="186" width="104" height="6" rx="3" fill={FAINT} />
        <path d="M297 234l0-26" stroke={INK} strokeWidth="2.5" />
        <rect x="252" y="234" width="90" height="8" rx="4" fill={INK} />
        <text x="297" y="266" fontSize="12" fill={INK} textAnchor="middle" fontWeight="700">あなたのデバイス</text>
        <text x="297" y="282" fontSize="10" fill={INK} textAnchor="middle" opacity="0.55">外部に音声を送らない</text>
      </g>

      {/* → 議事録 */}
      <g>
        <path d="M384 156h30" stroke={INK} strokeWidth="2.5" fill="none" markerEnd="url(#arrow2)" strokeLinecap="round" />
        <rect x="428" y="120" width="88" height="88" rx="8" fill="none" stroke={INK} strokeWidth="2.5" />
        <rect x="442" y="138" width="60" height="6" rx="3" fill={INK} />
        <rect x="442" y="152" width="60" height="5" rx="2.5" fill={FAINT} />
        <rect x="442" y="164" width="44" height="5" rx="2.5" fill={FAINT} />
        <path d="M442 182l7 7 14-16" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="472" y="230" fontSize="12" fill={INK} textAnchor="middle" fontWeight="700">議事録</text>
      </g>

      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0l6 4-6 4" fill="none" stroke={RED} strokeWidth="2" /></marker>
        <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0l6 4-6 4" fill="none" stroke={INK} strokeWidth="2" /></marker>
      </defs>
    </svg>
  );
}

const sceneWrap = { width: "100%" as const, height: "auto" as const };

/** 利用シーン：オンライン会議 */
export function SceneOnline(): ReactElement {
  return (
    <svg viewBox="0 0 240 150" style={sceneWrap} role="img" aria-label="オンライン会議">
      <rect x="40" y="28" width="160" height="96" rx="8" fill="#fff" stroke={INK} strokeWidth="2.5" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={54 + (i % 2) * 74} y={42 + Math.floor(i / 2) * 40} width="62" height="32" rx="4" fill="none" stroke={i === 0 ? RED : FAINT} strokeWidth="2" />
          <circle cx={70 + (i % 2) * 74} cy={54 + Math.floor(i / 2) * 40} r="6" fill="none" stroke={i === 0 ? RED : INK} strokeWidth="1.8" />
        </g>
      ))}
      <rect x="92" y="124" width="56" height="6" rx="3" fill={INK} />
      <circle cx="200" cy="34" r="6" fill={RED} />
    </svg>
  );
}

/** 利用シーン：対面のワーク・1on1 */
export function SceneMeeting(): ReactElement {
  return (
    <svg viewBox="0 0 240 150" style={sceneWrap} role="img" aria-label="対面の打ち合わせ">
      {/* テーブル */}
      <ellipse cx="120" cy="104" rx="86" ry="20" fill="none" stroke={INK} strokeWidth="2.5" />
      {/* 2人 */}
      <g stroke={INK} strokeWidth="2.5" fill="none">
        <circle cx="66" cy="52" r="14" />
        <path d="M44 96c0-16 10-26 22-26s22 10 22 26" />
        <circle cx="174" cy="52" r="14" />
        <path d="M152 96c0-16 10-26 22-26s22 10 22 26" />
      </g>
      {/* 中央の端末＋波形 */}
      <rect x="104" y="92" width="32" height="20" rx="3" fill="#fff" stroke={RED} strokeWidth="2.5" />
      <g stroke={RED} strokeWidth="2" strokeLinecap="round">
        <path d="M112 102v-4" /><path d="M118 104v-8" /><path d="M124 103v-6" /><path d="M130 102v-4" />
      </g>
    </svg>
  );
}

/** 利用シーン：大学の講義 */
export function SceneLecture(): ReactElement {
  return (
    <svg viewBox="0 0 240 150" style={sceneWrap} role="img" aria-label="大学の講義">
      {/* ホワイトボード */}
      <rect x="26" y="26" width="120" height="72" rx="4" fill="none" stroke={INK} strokeWidth="2.5" />
      <path d="M40 46h72M40 60h92M40 74h56" stroke={FAINT} strokeWidth="3" strokeLinecap="round" />
      {/* 講師 */}
      <g stroke={INK} strokeWidth="2.5" fill="none">
        <circle cx="176" cy="46" r="13" />
        <path d="M156 92c0-16 9-26 20-26s20 10 20 26" />
      </g>
      {/* 聴講（点） */}
      <g fill={FAINT}>
        {[0,1,2,3,4].map((i)=>(<circle key={i} cx={44 + i*22} cy={126} r="6" />))}
      </g>
      {/* 端末（録音） */}
      <rect x="150" y="112" width="30" height="20" rx="3" fill="#fff" stroke={RED} strokeWidth="2.5" />
      <circle cx="165" cy="122" r="4" fill={RED} />
    </svg>
  );
}

/** 特長アイコン */
export function IconNoBot(): ReactElement {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" role="img" aria-label="録音ボット不要">
      <rect x="12" y="16" width="24" height="20" rx="5" fill="none" stroke={INK} strokeWidth="2.5" />
      <circle cx="19" cy="26" r="2.5" fill={INK} /><circle cx="29" cy="26" r="2.5" fill={INK} />
      <path d="M24 16v-5" stroke={INK} strokeWidth="2.5" /><circle cx="24" cy="9" r="2.5" fill={INK} />
      <path d="M8 8l32 32" stroke={RED} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export function IconLocal(): ReactElement {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" role="img" aria-label="ローカル完結">
      <path d="M24 7l15 6v9c0 10-6.5 16-15 19-8.5-3-15-9-15-19v-9z" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M17 24l5 5 9-11" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconSpeaker(): ReactElement {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" role="img" aria-label="話者分離">
      <g fill="none" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="17" cy="18" r="6" stroke={INK} /><path d="M8 38c0-7 4-11 9-11s9 4 9 11" stroke={INK} />
        <circle cx="33" cy="20" r="5" stroke={RED} /><path d="M25 38c0-6 3.5-9 8-9s8 3 8 9" stroke={RED} />
      </g>
    </svg>
  );
}
