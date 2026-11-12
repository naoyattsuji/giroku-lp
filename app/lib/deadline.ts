import { AsyncLocalStorage } from 'node:async_hooks'

/**
 * 1回のリクエストの締め切り。Vercel の関数は60秒で切られ、切られると catch に入らないので、
 * 数えた回数を返す処理（quota.refund）も走らない（2026-11-12 の点検）。
 * 締め切りを関数の制限より少し前に置き、間に合わないときは自分で失敗を投げて、いつもの道で回数を返す。
 */
const store = new AsyncLocalStorage<number>()

export function runWithDeadline<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  return store.run(Date.now() + ms, fn)
}

/** 締め切りまでの残り（締め切りの外で呼ばれたら無限） */
export function remainingMs(): number {
  const deadline = store.getStore()
  return deadline === undefined ? Infinity : deadline - Date.now()
}
