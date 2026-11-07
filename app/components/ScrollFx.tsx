"use client";

import { useEffect } from "react";

/**
 * スクロールに合わせた動き（紹介ページ用）。画面には何も描かない。
 *
 * - data-reveal：画面に入ったら .is-in を付ける（CSS で、ぼかしから浮き上がって現れる）
 * - data-scroll：見えている間だけ、位置を CSS の変数に渡す
 *     --enter：要素の上端が画面の下に来たとき 0、画面の 35% の高さまで来たとき 1
 *     --exit ：要素が上へ抜けていくほど 0 → 1
 *
 * 動きを減らす設定の人には何もしない（最初から最後の姿で表示）。
 * JavaScript が動かない場合も、CSS は最後の姿を基本にしているので中身は必ず見える。
 */
export function ScrollFx(): null {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("fx-ready");

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const visible = new Set<HTMLElement>();
    const watch = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(el);
        else visible.delete(el);
      }
      schedule();
    });
    document.querySelectorAll<HTMLElement>("[data-scroll]").forEach((el) => watch.observe(el));

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of visible) {
        const r = el.getBoundingClientRect();
        const enter = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.65)));
        const exit = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
        el.style.setProperty("--enter", enter.toFixed(3));
        el.style.setProperty("--exit", exit.toFixed(3));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      reveal.disconnect();
      watch.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove("fx-ready");
    };
  }, []);
  return null;
}
