// Giroku LP 用の軽量ラインアート・イラスト集（モノ＋赤アクセント）。
// 文字に頼らず直感的に伝えるための図解・アイコン。線幅・角丸を統一して清潔に。
import type { ReactElement } from "react";

const INK = "#0a0a0a";
const RED = "#e8192c";
const FAINT = "#cfcfcf";
const SW = 2.2; // 統一ストローク幅

/**
 * ヒーロー図：相手の声（スピーカー）＋ 自分の声（マイク）→ あなたのパソコン（録音中・ネット不要）
 *  → 録音 / 文字起こし / AI議事録。3つのコアコンピタンスが一目で伝わる図。
 */
export function HeroDiagram(): ReactElement {
  return (
    <svg viewBox="0 0 600 300" width="100%" role="img"
      aria-label="相手の声とあなたの声の両方を、ネットがなくてもあなたのパソコンの中だけで、録音・文字起こし・AI議事録にする流れ"
      style={{ maxWidth: 600 }} fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">

      {/* 左：2つの音声入力 */}
      {/* 相手の声（スピーカー） */}
      <g>
        <rect x="8" y="44" width="156" height="60" rx="12" />
        <rect x="26" y="62" width="20" height="24" rx="4" />
        <g stroke={RED}><path d="M54 66c5 4 5 16 0 20" /><path d="M62 60c9 7 9 29 0 36" /></g>
        <text x="92" y="79" fontSize="13" fill={INK} stroke="none" fontWeight="700">相手の声</text>
        <text x="92" y="94" fontSize="9.5" fill={INK} stroke="none" opacity="0.55">スピーカー</text>
      </g>
      {/* あなたの声（マイク） */}
      <g>
        <rect x="8" y="164" width="156" height="60" rx="12" />
        <rect x="30" y="176" width="14" height="22" rx="7" stroke={RED} />
        <path d="M25 194a12 12 0 0 0 24 0" stroke={RED} /><path d="M37 206v8" stroke={RED} /><path d="M30 214h14" stroke={RED} />
        <text x="92" y="199" fontSize="13" fill={INK} stroke="none" fontWeight="700">あなたの声</text>
        <text x="92" y="214" fontSize="9.5" fill={INK} stroke="none" opacity="0.55">マイク</text>
      </g>

      {/* 入力 → パソコン（集約） */}
      <g stroke={RED}>
        <path d="M170 74C210 74 214 132 244 138" markerEnd="url(#redArrow)" />
        <path d="M170 194C210 194 214 152 244 146" markerEnd="url(#redArrow)" />
      </g>

      {/* 中央：あなたのパソコン */}
      <g>
        <rect x="252" y="96" width="150" height="100" rx="12" fill="#fff" />
        <path d="M252 122h150" />
        <circle cx="270" cy="109" r="4" fill={RED} stroke="none" />
        <text x="300" y="113" fontSize="10" fill={INK} stroke="none" fontWeight="700">録音中</text>
        <path d="M270 140h64" stroke={INK} /><path d="M270 156h104" stroke={FAINT} />
        <path d="M270 172h84" stroke={RED} opacity="0.85" />
        <path d="M327 214v-18" /><path d="M300 214h54" />
        <text x="327" y="238" fontSize="12.5" fill={INK} stroke="none" fontWeight="700" textAnchor="middle">あなたのパソコン</text>
        {/* ネット不要バッジ */}
        <g transform="translate(279,250)">
          <rect x="0" y="0" width="96" height="20" rx="10" fill="#fff" stroke={INK} strokeWidth="1.6" />
          <path d="M11 13a5 5 0 0 1 8 0" strokeWidth="1.6" /><circle cx="15" cy="14.5" r="1.2" fill={INK} stroke="none" />
          <path d="M8 6l14 12" stroke={RED} strokeWidth="1.6" />
          <text x="56" y="14" fontSize="9.5" fill={INK} stroke="none" fontWeight="700" textAnchor="middle">ネット不要</text>
        </g>
      </g>

      {/* パソコン → 3つの成果（分岐） */}
      <g stroke={INK}>
        <path d="M410 132C444 132 452 62 484 56" markerEnd="url(#inkArrow)" />
        <path d="M410 146h70" markerEnd="url(#inkArrow)" />
        <path d="M410 160C444 160 452 236 484 242" markerEnd="url(#inkArrow)" />
      </g>

      {/* 右：3つの成果 */}
      {/* 録音 */}
      <g>
        <rect x="490" y="30" width="104" height="52" rx="10" fill="#fff" />
        <g stroke={RED}><path d="M506 62v-14" /><path d="M514 66v-22" /><path d="M522 62v-14" /><path d="M530 68v-26" /><path d="M538 62v-14" /></g>
        <text x="566" y="60" fontSize="12" fill={INK} stroke="none" fontWeight="700" textAnchor="middle">録音</text>
      </g>
      {/* 文字起こし */}
      <g>
        <rect x="490" y="124" width="104" height="52" rx="10" fill="#fff" />
        <path d="M504 143h24" /><path d="M504 151h30" /><path d="M504 159h18" />
        <text x="562" y="155" fontSize="11" fill={INK} stroke="none" fontWeight="700" textAnchor="middle">文字起こし</text>
      </g>
      {/* AI議事録 */}
      <g>
        <rect x="490" y="216" width="104" height="52" rx="10" fill="#fff" />
        <rect x="504" y="228" width="26" height="28" rx="3" />
        <path d="M510 236h14" stroke={FAINT} strokeWidth="1.8" /><path d="M510 242h14" stroke={FAINT} strokeWidth="1.8" /><path d="M510 248h9" stroke={FAINT} strokeWidth="1.8" />
        <path d="M534 226l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z" fill={RED} stroke="none" />
        <text x="566" y="247" fontSize="11" fill={INK} stroke="none" fontWeight="700" textAnchor="middle">AI議事録</text>
      </g>

      <defs>
        <marker id="redArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0l6 4-6 4" stroke={RED} strokeWidth="2" /></marker>
        <marker id="inkArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0l6 4-6 4" stroke={INK} strokeWidth="2" /></marker>
      </defs>
    </svg>
  );
}

// ---- 3つのコアコンピタンス用アイコン（大きめ・清潔） ----

/** 1. 相手に気づかれない（通知が飛ばない） */
export function IconStealth(): ReactElement {
  return (
    <svg viewBox="0 0 56 56" width="52" height="52" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="28" cy="20" r="8" />
      <path d="M13 44c0-9 7-14 15-14s15 5 15 14" />
      <path d="M9 9l38 38" stroke={RED} strokeWidth="3" />
    </svg>
  );
}

/** 2. 自分の声も相手の声も（マイク＋スピーカー） */
export function IconBothVoices(): ReactElement {
  return (
    <svg viewBox="0 0 56 56" width="52" height="52" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {/* マイク */}
      <rect x="12" y="12" width="11" height="18" rx="5.5" />
      <path d="M8 27a9.5 9.5 0 0 0 19 0" /><path d="M17.5 36v6" /><path d="M12 42h11" />
      {/* スピーカー */}
      <g stroke={RED}>
        <rect x="34" y="20" width="9" height="12" rx="2.5" />
        <path d="M46 22c3.5 3 3.5 9 0 12" /><path d="M50 18c6 5 6 17 0 22" />
      </g>
    </svg>
  );
}

/** 3. ネットがなくても使える（オフライン） */
export function IconOffline(): ReactElement {
  return (
    <svg viewBox="0 0 56 56" width="52" height="52" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 24a22 22 0 0 1 32 0" />
      <path d="M19 32a12 12 0 0 1 18 0" />
      <path d="M25.5 39.5a4 4 0 0 1 5 0" />
      <circle cx="28" cy="45" r="1.6" fill={INK} stroke="none" />
      <path d="M10 12l36 36" stroke={RED} strokeWidth="3" />
    </svg>
  );
}

// ---- 利用シーン（清潔化） ----
const sceneWrap = { width: "100%" as const, height: "auto" as const };

export function SceneOnline(): ReactElement {
  return (
    <svg viewBox="0 0 240 150" style={sceneWrap} role="img" aria-label="オンライン会議" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="40" y="30" width="160" height="92" rx="10" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={56 + (i % 2) * 72} y={44 + Math.floor(i / 2) * 38} width="60" height="30" rx="5" stroke={i === 0 ? RED : FAINT} />
          <circle cx={72 + (i % 2) * 72} cy={55 + Math.floor(i / 2) * 38} r="5.5" stroke={i === 0 ? RED : INK} />
          <path d={`M${64 + (i % 2) * 72} ${68 + Math.floor(i / 2) * 38}a8 8 0 0 1 16 0`} stroke={i === 0 ? RED : INK} />
        </g>
      ))}
      <circle cx="200" cy="36" r="5.5" fill={RED} stroke="none" />
    </svg>
  );
}

export function SceneMeeting(): ReactElement {
  return (
    <svg viewBox="0 0 240 150" style={sceneWrap} role="img" aria-label="対面の打ち合わせ" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="94" y="94" width="52" height="26" rx="5" stroke={RED} />
      <g stroke={RED} strokeWidth="2"><path d="M104 110v-6" /><path d="M112 112v-10" /><path d="M120 111v-8" /><path d="M128 110v-6" /><path d="M136 112v-10" /></g>
      <circle cx="60" cy="52" r="13" /><path d="M40 96c0-14 9-22 20-22s20 8 20 22" />
      <circle cx="180" cy="52" r="13" /><path d="M160 96c0-14 9-22 20-22s20 8 20 22" />
    </svg>
  );
}

export function SceneLecture(): ReactElement {
  return (
    <svg viewBox="0 0 240 150" style={sceneWrap} role="img" aria-label="大学の講義・授業" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="28" y="26" width="118" height="72" rx="6" />
      <path d="M44 46h80M44 60h96M44 74h56" stroke={FAINT} strokeWidth="3.2" />
      <circle cx="182" cy="46" r="13" /><path d="M162 92c0-14 9-22 20-22s20 8 20 22" />
      <g fill={FAINT} stroke="none">{[0, 1, 2, 3, 4].map((i) => (<circle key={i} cx={44 + i * 22} cy={126} r="6" />))}</g>
      <rect x="150" y="112" width="30" height="20" rx="4" fill="#fff" stroke={RED} />
      <circle cx="165" cy="122" r="3.5" fill={RED} stroke="none" />
    </svg>
  );
}
