"use client";
// Giroku LP 用の軽量ラインアート・イラスト集（モノ＋赤アクセント）。
// 文字に頼らず直感的に伝えるための図解・アイコン。線幅・角丸を統一して清潔に。
import { useState, type ReactElement } from "react";

const INK = "#0a0a0a";
const RED = "#e8192c";
const FAINT = "#cfcfcf";
const SW = 2.2; // 統一ストローク幅

/**
 * Girokuのマスコット「ひそか」のロゴマーク。ナビ等、ブランドを示す場所に使う。
 * app/src/renderer/src/views/Icons.tsx の IconSpirit と同じパス。
 */
export function LogoMark({ size = 22 }: { size?: number }): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.5c4.7 0 7.5 3.3 7.5 8v6.3c0 .6-.7 1-1.2.6l-1.4-1.1-1.5 1.2c-.4.3-1 .3-1.3 0l-1.5-1.2-1.6 1.2c-.4.3-1 .3-1.3 0l-1.5-1.2-1.4 1.1c-.5.4-1.2 0-1.2-.6V11.5c0-4.7 2.8-8 7.4-8z"
        fill={RED}
      />
      <circle cx="9.3" cy="11.5" r="1" fill="#fff" />
      <circle cx="14.7" cy="11.5" r="1" fill="#fff" />
    </svg>
  );
}

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
        <text x="92" y="79" fontSize="13" fill={INK} stroke="none" fontWeight="700">パソコンの音</text>
        <text x="92" y="94" fontSize="9.5" fill={INK} stroke="none" opacity="0.55">通話・動画</text>
      </g>
      {/* あなたの声（マイク） */}
      <g>
        <rect x="8" y="164" width="156" height="60" rx="12" />
        <rect x="30" y="176" width="14" height="22" rx="7" stroke={RED} />
        <path d="M25 194a12 12 0 0 0 24 0" stroke={RED} /><path d="M37 206v8" stroke={RED} /><path d="M30 214h14" stroke={RED} />
        <text x="92" y="199" fontSize="13" fill={INK} stroke="none" fontWeight="700">マイク</text>
        <text x="92" y="214" fontSize="9.5" fill={INK} stroke="none" opacity="0.55">あなた・周り</text>
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

// ---- 3つのコアコンピタンス用ミニ図解（単一アイコンより情報量を持たせる） ----

/** 1. 相手に気づかれない：通話グリッドに「通知が飛ばない」バッジを添える */
export function DiagramStealth(): ReactElement {
  return (
    <svg viewBox="0 0 150 118" width="100%" style={{ maxWidth: 190 }} role="img" aria-label="通話に何も追加されず、通知も飛ばない"
      fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="10" width="94" height="68" rx="9" fill="#fff" stroke={FAINT} />
      {[0, 1, 2, 3].map((i) => {
        const gx = 18 + (i % 2) * 40;
        const gy = 20 + Math.floor(i / 2) * 28;
        return (
          <g key={i} stroke={FAINT}>
            <rect x={gx} y={gy} width="34" height="20" rx="3" />
            <circle cx={gx + 17} cy={gy + 7} r="3.5" />
            <path d={`M${gx + 10} ${gy + 17}a7 7 0 0 1 14 0`} />
          </g>
        );
      })}
      <g transform="translate(90,62)">
        <circle cx="20" cy="20" r="20" fill="#fff" stroke={INK} strokeWidth="1.7" />
        <path d="M20 10a6.5 6.5 0 0 1 6.5 6.5v5l2.6 3.5H10.9l2.6-3.5v-5A6.5 6.5 0 0 1 20 10z" strokeWidth="1.5" />
        <path d="M16.3 27.5a3.7 3.7 0 0 0 7.4 0" strokeWidth="1.5" />
        <path d="M8 8l24 24" stroke={RED} strokeWidth="2.2" />
      </g>
    </svg>
  );
}

/** 2. 自分の声も相手の声も：マイクとパソコンの音、両方がひとつの録音に集まる */
export function DiagramBothVoices(): ReactElement {
  return (
    <svg viewBox="0 0 160 116" width="100%" style={{ maxWidth: 200 }} role="img" aria-label="マイクとパソコンの音、両方をひとつの録音にする"
      fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* マイク（アプリ本体のIconMicと同じパス） */}
      <g transform="translate(8,6) scale(0.9)">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M6 11a6 6 0 0 0 12 0" />
        <path d="M12 17v3M9 20h6" />
      </g>
      <text x="18" y="48" fontSize="9" textAnchor="middle" fill={INK} stroke="none" fontWeight="700">マイク</text>

      {/* パソコンの音（アプリ本体のIconSpeakerと同じパス） */}
      <g stroke={RED} transform="translate(118,6) scale(0.9)">
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M17 9c1.5 1.2 1.5 4.8 0 6M19.5 6.5c3 2.4 3 8.6 0 11" />
      </g>
      <text x="124" y="48" fontSize="9" textAnchor="middle" fill={RED} stroke="none" fontWeight="700">パソコンの音</text>

      {/* マイク・パソコンの音、それぞれから中央の録音バーへ届く直線 */}
      <path d="M28 26L64 66" stroke={INK} />
      <path d="M128 26L92 66" stroke={RED} />

      {/* 中央：ひとつの録音バー（波形の頂点が接続線の終点と一致するよう配置） */}
      <g stroke={RED} strokeWidth="2.4" transform="translate(60,66)">
        <path d="M2 30v-13" /><path d="M11 34v-22" /><path d="M20 30v-13" /><path d="M29 37v-30" /><path d="M38 30v-13" />
      </g>
      <text x="80" y="110" fontSize="9" textAnchor="middle" fill={INK} stroke="none" fontWeight="700" opacity="0.6">ひとつの録音に</text>
    </svg>
  );
}

/** 3. ネットがなくても使える：Wi-Fiが無くても録音中の画面はそのまま動く */
export function DiagramOffline(): ReactElement {
  return (
    <svg viewBox="0 0 150 112" width="100%" style={{ maxWidth: 190 }} role="img" aria-label="インターネットが無くても、パソコンの中で録音が続く"
      fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 86l6-13h72l6 13z" fill="#fff" />
      <rect x="32" y="20" width="84" height="50" rx="7" fill="#fff" stroke={FAINT} />
      <circle cx="48" cy="36" r="4" fill={RED} stroke="none" />
      <text x="84" y="40" fontSize="10" textAnchor="middle" fill={INK} stroke="none" fontWeight="700">録音中</text>
      <path d="M44 52h56" stroke={FAINT} />
      <path d="M44 60h38" stroke={FAINT} />
      <g transform="translate(88,62)">
        <circle cx="20" cy="20" r="20" fill="#fff" stroke={INK} strokeWidth="1.7" />
        <path d="M8 17a17.5 17.5 0 0 1 24 0" strokeWidth="1.5" />
        <path d="M12.8 22.8a11 11 0 0 1 14.4 0" strokeWidth="1.5" />
        <circle cx="20" cy="29" r="1.5" fill={INK} stroke="none" />
        <path d="M7 7l26 26" stroke={RED} strokeWidth="2.2" />
      </g>
    </svg>
  );
}

/** 場面写真：public/scenes/にユーザーが用意した写真があればそれをフルブリードで表示し、
 * まだ無い場合（読み込みエラー時）は既存のライン画イラストに余白付きでフォールバックする
 * （写真が届く前でも安全にデプロイできる）。 */
export function SceneImage({ src, alt, fallback }: { src: string; alt: string; fallback: ReactElement }): ReactElement {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!loaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, boxSizing: "border-box" }}>
          {fallback}
        </div>
      )}
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      )}
    </div>
  );
}

// ---- 利用シーン（作り込みイラスト） ----
const sceneWrap = { width: "100%" as const, height: "auto" as const };

/** 小さな人物（頭＋肩）。back=true で後ろ姿 */
function Person(x: number, y: number, r: number, color = INK): ReactElement {
  return (
    <g stroke={color}>
      <circle cx={x} cy={y} r={r} />
      <path d={`M${x - r * 1.5} ${y + r * 3}c0-${r * 2} ${r * 0.9}-${r * 3} ${r * 1.5}-${r * 3}s${r * 1.5} ${r} ${r * 1.5} ${r * 3}`} />
    </g>
  );
}

/** オンライン会議：机の上のノートPCに通話グリッド＋録音キャプチャ */
export function SceneOnline(): ReactElement {
  return (
    <svg viewBox="0 0 260 168" style={sceneWrap} role="img" aria-label="オンライン会議" fill="none" stroke={INK} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      {/* 机 */}
      <path d="M20 150h220" stroke={FAINT} strokeWidth="2.3" />
      {/* ノートPC本体 */}
      <path d="M64 142l9-16h114l9 16z" fill="#fff" />
      <path d="M60 142h140" />
      {/* 画面 */}
      <rect x="70" y="34" width="120" height="86" rx="7" fill="#fff" />
      {/* 通話グリッド 2x2（左上が発話中＝赤） */}
      {[0, 1, 2, 3].map((i) => {
        const gx = 80 + (i % 2) * 52;
        const gy = 46 + Math.floor(i / 2) * 34;
        const c = i === 0 ? RED : FAINT;
        return (
          <g key={i}>
            <rect x={gx} y={gy} width="44" height="26" rx="4" stroke={c} />
            <circle cx={gx + 22} cy={gy + 9} r="4.5" stroke={i === 0 ? RED : INK} />
            <path d={`M${gx + 14} ${gy + 22}a8 8 0 0 1 16 0`} stroke={i === 0 ? RED : INK} />
          </g>
        );
      })}
      {/* 録音キャプチャ（赤い波形バッジ） */}
      <g stroke={RED} strokeWidth="2.4">
        <path d="M206 96v-8M213 100v-16M220 96v-8" />
      </g>
      <circle cx="213" cy="76" r="4" fill={RED} stroke="none" />
    </svg>
  );
}

/** 対面の打ち合わせ：テーブルを挟んで2人、中央のPCが両方の声を録る */
export function SceneMeeting(): ReactElement {
  return (
    <svg viewBox="0 0 260 168" style={sceneWrap} role="img" aria-label="対面の打ち合わせ" fill="none" stroke={INK} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      {/* テーブル */}
      <ellipse cx="130" cy="126" rx="96" ry="22" fill="#fff" />
      {/* 2人（向かい合う） */}
      {Person(52, 58, 14)}
      {Person(208, 58, 14)}
      {/* 会話（吹き出しの点） */}
      <g stroke={FAINT} strokeWidth="2"><path d="M78 60h18M164 60h18" /></g>
      {/* 中央のノートPC（録音中） */}
      <path d="M104 128l6-14h40l6 14z" fill="#fff" />
      <rect x="110" y="96" width="40" height="20" rx="4" fill="#fff" />
      <g stroke={RED} strokeWidth="2.2"><path d="M120 110v-6M127 113v-12M134 111v-8M141 113v-12" /></g>
      <circle cx="130" cy="88" r="4" fill={RED} stroke="none" />
      {/* 両側から中央PCへ音が集まる */}
      <path d="M74 84c14 6 22 8 30 12" stroke={RED} strokeWidth="1.6" opacity="0.6" />
      <path d="M186 84c-14 6-22 8-30 12" stroke={RED} strokeWidth="1.6" opacity="0.6" />
    </svg>
  );
}

/** 講義・授業：スクリーンと講師、聴講席、前方PCが録音 */
export function SceneLecture(): ReactElement {
  return (
    <svg viewBox="0 0 260 168" style={sceneWrap} role="img" aria-label="大学の講義・授業" fill="none" stroke={INK} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      {/* スクリーン/黒板 */}
      <rect x="26" y="20" width="150" height="88" rx="6" fill="#fff" />
      <path d="M42 40h100M42 54h118M42 68h78" stroke={FAINT} strokeWidth="3" />
      {/* 板書の図（赤アクセント） */}
      <path d="M42 86l14-10 12 6 16-12" stroke={RED} strokeWidth="2.2" />
      {/* 講師 */}
      {Person(212, 44, 13)}
      {/* 聴講席（2列の頭） */}
      <g fill={FAINT} stroke="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={`a${i}`} cx={40 + i * 26} cy={132} r="6.5" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <circle key={`b${i}`} cx={53 + i * 26} cy={150} r="6.5" />
        ))}
      </g>
      {/* 前方PC（録音中） */}
      <rect x="196" y="120" width="34" height="22" rx="4" fill="#fff" stroke={RED} />
      <g stroke={RED} strokeWidth="2"><path d="M205 134v-6M212 137v-12M219 134v-6" /></g>
      <circle cx="213" cy="114" r="3.5" fill={RED} stroke="none" />
    </svg>
  );
}
