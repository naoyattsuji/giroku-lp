"use client";

import { useEffect, useRef, type ReactElement, type ReactNode } from "react";

/**
 * 横に並んだ物（中の .hs-track）を、縦のスクロールに合わせて少しずつ横へ流す（スマホだけ）。
 *
 * 2026-11-08 作り直し：画面を止めて横に送る形（ピン留め）は「勝手に動く」感じがして不自然だった（本人の指摘）。
 * 今の形：
 * - 画面は止めない。並びが画面の下から上へ通り過ぎる間に、スクロールした分だけ横へ流れる。
 * - 動きは目標の位置へ毎フレーム少しずつ近づける（なめらかに追いつく）。指の動きにぴったり付いてきつつ、カクつかない。
 * - 指で横にすべらせたら、その並びはそこから先は自分で動かさない（指の操作が優先。吸い付きも戻す）。
 * - パソコン（全部が見えている）と、動きを減らす設定の人には何もしない。
 */
export function HScroll({ children }: { children: ReactNode }): ReactElement {
  const outer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = outer.current;
    const track = box?.querySelector<HTMLElement>(".hs-track");
    if (!box || !track) return;

    const mq = window.matchMedia("(max-width: 760px) and (prefers-reduced-motion: no-preference)");
    let handedOver = false; // 指で触ったら true（以後は自分で動かさない）
    let current = 0;
    let frame = 0;

    const target = (): number => {
      const dist = track.scrollWidth - track.clientWidth;
      if (dist <= 0) return 0;
      const r = track.getBoundingClientRect();
      const vh = window.innerHeight;
      // 並びの真ん中が画面の下から 80% の所に来たら流れ始め、35% の所で流れ終わる。
      // 画面より背の高い並び（料金のカード）は、上の「画面の7割」ぶんを並びとみなす。
      // こうすると、背の低い画面3枚と同じ見え方・同じ速さで流れる（2026-11-12 本人の指摘：特長の画面と全く同じ動きに）
      const center = r.top + Math.min(r.height, vh * 0.7) / 2;
      const p = (vh * 0.8 - center) / (vh * 0.45);
      return Math.min(1, Math.max(0, p)) * dist;
    };

    const tick = () => {
      frame = 0;
      if (handedOver || !mq.matches) return;
      const goal = target();
      current += (goal - current) * 0.18;
      if (Math.abs(goal - current) < 0.5) current = goal;
      track.scrollLeft = current;
      if (current !== goal) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const setup = () => {
      if (mq.matches && !handedOver) {
        track.classList.add("hs-driven");
        current = track.scrollLeft;
        schedule();
      } else {
        track.classList.remove("hs-driven");
      }
    };

    // 指で横にすべらせたら、指に任せる
    const handOver = () => {
      if (handedOver) return;
      handedOver = true;
      track.classList.remove("hs-driven");
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    setup();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", setup);
    mq.addEventListener("change", setup);
    // 横の位置が、こちらで動かした位置からずれたら＝指で横にすべらせた（縦にスクロールしただけでは外さない）
    const onTrackScroll = () => {
      if (Math.abs(track.scrollLeft - current) > 2) handOver();
    };
    track.addEventListener("scroll", onTrackScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", setup);
      mq.removeEventListener("change", setup);
      track.removeEventListener("scroll", onTrackScroll);
      if (frame) cancelAnimationFrame(frame);
      track.classList.remove("hs-driven");
    };
  }, []);

  return (
    <div ref={outer} className="hs">
      {children}
    </div>
  );
}
