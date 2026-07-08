// Giroku LP 用の軽量ラインアート・イラスト集（モノ＋赤アクセント）。
// 文字に頼らず直感的に伝えるための図解・シーンイラスト。
import type { ReactElement } from "react";

const INK = "#0a0a0a";
const RED = "#e8192c";
const FAINT = "#d9d9d9";

/** ヒーロー用フロー図：3つの場面 → あなたのパソコン → 3つの成果（録音・文字起こし・AI議事録） */
export function HeroDiagram(): ReactElement {
  return (
    <svg viewBox="0 0 640 336" width="100%" role="img" aria-label="オンライン会議・対面の打ち合わせ・講義を、あなたのパソコンの中だけで、録音・文字起こし・AI議事録にする流れ" style={{ maxWidth: 640 }}>
      {/* 左：3つの場面 */}
      {/* オンライン会議 */}
      <g transform="translate(4,20)">
        <rect x="0" y="0" width="110" height="56" rx="8" fill="none" stroke={INK} strokeWidth="2.2" />
        <rect x="12" y="13" width="36" height="28" rx="4" fill="none" stroke={INK} strokeWidth="1.8" />
        <circle cx="30" cy="24" r="4.5" fill="none" stroke={INK} strokeWidth="1.6" />
        <path d="M23 38c0-4.5 3-7 7-7s7 2.5 7 7" fill="none" stroke={INK} strokeWidth="1.6" />
        <rect x="58" y="17" width="38" height="6.5" rx="3" fill={FAINT} />
        <rect x="58" y="30" width="28" height="6.5" rx="3" fill={FAINT} />
        <text x="55" y="74" fontSize="11" fill={INK} textAnchor="middle" fontWeight="600">オンライン会議</text>
      </g>
      {/* 対面の打ち合わせ */}
      <g transform="translate(4,120)">
        <rect x="0" y="0" width="110" height="56" rx="8" fill="none" stroke={INK} strokeWidth="2.2" />
        <g stroke={INK} strokeWidth="1.8" fill="none">
          <circle cx="38" cy="20" r="6.5" />
          <path d="M27 42c0-7 5-12 11-12s11 5 11 12" />
          <circle cx="72" cy="20" r="6.5" />
          <path d="M61 42c0-7 5-12 11-12s11 5 11 12" />
        </g>
        <ellipse cx="55" cy="44" rx="32" ry="5.5" fill="none" stroke={FAINT} strokeWidth="2" />
        <text x="55" y="74" fontSize="11" fill={INK} textAnchor="middle" fontWeight="600">対面の打ち合わせ</text>
      </g>
      {/* 講義・授業 */}
      <g transform="translate(4,220)">
        <rect x="0" y="0" width="110" height="56" rx="8" fill="none" stroke={INK} strokeWidth="2.2" />
        <rect x="12" y="11" width="42" height="28" rx="3" fill="none" stroke={INK} strokeWidth="1.8" />
        <path d="M20 21h26M20 29h18" stroke={FAINT} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="84" cy="21" r="5.5" fill="none" stroke={INK} strokeWidth="1.8" />
        <path d="M73 42c0-6.5 5-10 11-10s11 3.5 11 10" fill="none" stroke={INK} strokeWidth="1.8" />
        <text x="55" y="74" fontSize="11" fill={INK} textAnchor="middle" fontWeight="600">講義・授業</text>
      </g>

      {/* 場面 → パソコン（集約する矢印） */}
      <g stroke={RED} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M120 46C158 46 168 158 236 166" markerEnd="url(#arrow)" />
        <path d="M120 148h112" markerEnd="url(#arrow)" />
        <path d="M120 250C158 250 168 174 236 168" markerEnd="url(#arrow)" />
      </g>

      {/* 中央：あなたのパソコン */}
      <g>
        <rect x="244" y="112" width="150" height="104" rx="10" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <rect x="244" y="112" width="150" height="26" rx="10" fill={INK} />
        <circle cx="260" cy="125" r="4" fill={RED} />
        <text x="292" y="129" fontSize="9.5" fill="#fff" fontWeight="700" letterSpacing="0.5">録音中</text>
        <rect x="260" y="152" width="70" height="6" rx="3" fill={INK} />
        <rect x="260" y="166" width="112" height="6" rx="3" fill={FAINT} />
        <rect x="260" y="180" width="90" height="6" rx="3" fill={RED} opacity="0.85" />
        <rect x="260" y="194" width="104" height="6" rx="3" fill={FAINT} />
        <path d="M319 242l0-26" stroke={INK} strokeWidth="2.5" />
        <rect x="274" y="242" width="90" height="8" rx="4" fill={INK} />
        <text x="319" y="274" fontSize="12" fill={INK} textAnchor="middle" fontWeight="700">あなたのパソコン</text>
        <text x="319" y="290" fontSize="10" fill={INK} textAnchor="middle" opacity="0.55">音声は外に出ません</text>
      </g>

      {/* パソコン → 3つの成果（広がる矢印） */}
      <g stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M400 158C440 158 452 60 502 54" markerEnd="url(#arrow2)" />
        <path d="M400 164h96" markerEnd="url(#arrow2)" />
        <path d="M400 170C440 170 452 254 502 260" markerEnd="url(#arrow2)" />
      </g>

      {/* 右：3つの成果 */}
      {/* 録音 */}
      <g transform="translate(510,26)">
        <rect x="0" y="0" width="118" height="56" rx="8" fill="#fff" stroke={INK} strokeWidth="2.2" />
        <g stroke={RED} strokeWidth="2.4" strokeLinecap="round">
          <path d="M18 34v-12" /><path d="M26 38v-20" /><path d="M34 34v-12" /><path d="M42 40v-24" /><path d="M50 34v-12" />
        </g>
        <text x="86" y="33" fontSize="13" fill={INK} fontWeight="700" textAnchor="middle">録音</text>
      </g>
      {/* 文字起こし */}
      <g transform="translate(510,120)">
        <rect x="0" y="0" width="118" height="56" rx="8" fill="#fff" stroke={INK} strokeWidth="2.2" />
        <g stroke={INK} strokeWidth="2.2" strokeLinecap="round">
          <path d="M16 20h28" /><path d="M16 28h34" /><path d="M16 36h22" />
        </g>
        <text x="88" y="33" fontSize="12" fill={INK} fontWeight="700" textAnchor="middle">文字起こし</text>
      </g>
      {/* AI議事録 */}
      <g transform="translate(510,220)">
        <rect x="0" y="0" width="118" height="56" rx="8" fill="#fff" stroke={INK} strokeWidth="2.2" />
        <rect x="16" y="14" width="30" height="28" rx="3" fill="none" stroke={INK} strokeWidth="1.8" />
        <path d="M22 22h18M22 28h18M22 34h12" stroke={FAINT} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M50 14l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5z" fill={RED} />
        <text x="90" y="33" fontSize="12.5" fill={INK} fontWeight="700" textAnchor="middle">AI議事録</text>
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
