"use client";
// スクロールで要素がふわっと現れる控えめな演出。Apple製品ページのような
// 「スクロールすると意味のある単位で現れる」感覚をLP全体に薄く敷く。
// prefers-reduced-motionの場合はアニメーションさせず即表示する。
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  const shown = reducedMotion || visible;

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(18px)",
        transition: reducedMotion ? "none" : `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
