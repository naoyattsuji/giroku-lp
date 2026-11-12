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

/**
 * 締め切りで打ち切ったことを表す失敗。呼び出し元は 500 ではなく 503 にして、
 * 「時間内に終わらなかった（少し待てば通る）」と利用者に伝える（2026-11-12 の点検）
 */
export class DeadlineError extends Error {
  constructor(message = '締め切りまでに AI の応答が間に合いませんでした') {
    super(message)
    this.name = 'DeadlineError'
  }
}

/** 締め切りによる打ち切りか。AbortSignal.timeout で切れたとき（TimeoutError）も含める */
export function isDeadlineError(error: unknown): boolean {
  if (error instanceof DeadlineError) return true
  return error instanceof Error && error.name === 'TimeoutError'
}

export const DEADLINE_MESSAGE = 'AI の処理が時間内に終わりませんでした。少し時間をおいてお試しください。'
