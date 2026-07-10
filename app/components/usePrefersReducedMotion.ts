"use client";
// prefers-reduced-motionを安全に購読する（SSR/ハイドレーションミスマッチを避けるため
// useSyncExternalStoreを使う。effect内でのsetStateを避けるための正攻法）。
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
