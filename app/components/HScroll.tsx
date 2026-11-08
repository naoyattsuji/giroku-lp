"use client";

import { useEffect, useRef, type ReactElement, type ReactNode } from "react";

/**
 * 横に並んだ物（中の .hs-track）を、縦のスクロールで横に送る（スマホだけ。2026-11-08 本人の案）。
 *
 * しくみ：
 * - 外側の箱を「横に動かす距離」の分だけ縦に長くし、中身（.hs-sticky）は画面に貼り付けておく。
 * - 縦にスクロールした量に合わせて、並びを横へ送る（scrollLeft）。最後まで見えたら貼り付けが外れ、次の区切りへ進む。
 * - パソコン（横幅が広く、全部が見えている）と、動きを減らす設定の人には何もしない（普通の横すべり／並び）。
 */
const NAV_HEIGHT = 52;

export function HScroll({ children }: { children: ReactNode }): ReactElement {
  const outer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = outer.current;
    if (!box) return;
    const sticky = box.firstElementChild as HTMLElement | null;
    const track = box.querySelector<HTMLElement>(".hs-track");
    if (!sticky || !track) return;

    const mq = window.matchMedia("(max-width: 760px) and (prefers-reduced-motion: no-preference)");
    let dist = 0;
    let frame = 0;

    const reset = () => {
      box.classList.remove("hs-on");
      box.style.height = "";
      sticky.style.top = "";
      track.scrollLeft = 0;
    };

    const measure = () => {
      if (!mq.matches) {
        reset();
        return;
      }
      box.classList.add("hs-on");
      // 並びの右端までの距離（最後の物が右の余白まで来たら終わり）
      dist = Math.max(0, track.scrollWidth - track.clientWidth);
      if (dist === 0) {
        reset();
        return;
      }
      const h = sticky.offsetHeight;
      const room = window.innerHeight - NAV_HEIGHT;
      // 画面の高さに収まるなら真ん中に貼る。収まらないときは上に貼る
      sticky.style.top = `${NAV_HEIGHT + Math.max(0, (room - h) / 2)}px`;
      box.style.height = `${h + dist}px`;
      update();
    };

    const update = () => {
      frame = 0;
      if (!box.classList.contains("hs-on")) return;
      const top = box.getBoundingClientRect().top - parseFloat(sticky.style.top || "0");
      const p = Math.min(1, Math.max(0, -top / dist));
      // 並びは overflow: hidden の箱なので、横の位置を直接動かす（指での横すべりは止めて、縦の動きだけで送る）
      track.scrollLeft = p * dist;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    // 画像の読み込みで高さが変わるので、大きさが変わったら測り直す
    const ro = new ResizeObserver(() => measure());
    ro.observe(sticky);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
      if (frame) cancelAnimationFrame(frame);
      reset();
    };
  }, []);

  return (
    <div ref={outer} className="hs">
      <div className="hs-sticky">{children}</div>
    </div>
  );
}
