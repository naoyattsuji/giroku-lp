import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { AppStoreServerAPIClient, Environment, Status } from '@apple/app-store-server-library'
import { BUNDLE_ID, PLUS_PRODUCT_ID, verifiers } from './apple-plus'

/**
 * iPhone（App Store）で買った Plus を、PC 版でも使うためのキー。
 *
 * 形：GIROKU-IOS-<購入の大もとの番号>-<署名12桁>
 * - 番号は Apple の originalTransactionId（自動更新しても変わらない）。署名はこのサーバーだけが作れる。
 * - データベースは使わない。PC から確かめるたびに、Apple の App Store Server API へ
 *   「このサブスクリプションはいま有効か」を問い合わせる。解約・返金・期限切れは自動で無料に戻る。
 *
 * 必要な環境変数（Vercel）：
 * - GIROKU_APPLE_KEY_SECRET … 署名の鍵（ランダムな文字列）
 * - APPLE_IAP_KEY_ID / APPLE_IAP_ISSUER_ID / APPLE_IAP_PRIVATE_KEY … App Store Connect の
 *   「アプリ内課金」キー（.p8 の中身。改行は \n のままでよい）
 */
const PREFIX = 'GIROKU-IOS-'
const KEY_PATTERN = /^GIROKU-IOS-(\d{6,20})-([0-9A-F]{12})$/

export function isAppleKey(input: unknown): input is string {
  return typeof input === 'string' && input.trim().toUpperCase().startsWith(PREFIX)
}

function secret(): string | null {
  return process.env.GIROKU_APPLE_KEY_SECRET?.trim() || null
}

function sign(id: string, key: string): string {
  return createHmac('sha256', key).update(`${PREFIX}${id}`).digest('hex').slice(0, 12).toUpperCase()
}

export function issueAppleKey(originalTransactionId: string): string {
  const key = secret()
  if (!key) throw new Error('サーバーの準備ができていません。')
  if (!/^\d{6,20}$/.test(originalTransactionId)) throw new Error('購入記録を確認できませんでした。')
  return `${PREFIX}${originalTransactionId}-${sign(originalTransactionId, key)}`
}

/** 署名が合えば購入の番号を返す（Apple にはまだ聞かない） */
export function parseAppleKey(input: string): string | null {
  const key = secret()
  const match = KEY_PATTERN.exec(input.trim().toUpperCase())
  if (!key || !match) return null
  const [, id, sig] = match
  const expected = Buffer.from(sign(id, key))
  const actual = Buffer.from(sig)
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? id : null
}

function clients(): AppStoreServerAPIClient[] {
  const keyId = process.env.APPLE_IAP_KEY_ID?.trim()
  const issuerId = process.env.APPLE_IAP_ISSUER_ID?.trim()
  const privateKey = process.env.APPLE_IAP_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()
  if (!keyId || !issuerId || !privateKey) return []
  return [Environment.PRODUCTION, Environment.SANDBOX].map(
    (environment) => new AppStoreServerAPIClient(privateKey, keyId, issuerId, BUNDLE_ID, environment),
  )
}

export interface AppleKeyState {
  paid: boolean
  expiresAt: string | null
}

const CACHE_MS = 10 * 60 * 1000
const cache = new Map<string, { state: AppleKeyState; expires: number }>()

/** Apple に「いま有効か」を聞く。問い合わせられないときは例外（PC 側は期限まで今の状態を保つ） */
export async function checkAppleKey(input: string): Promise<AppleKeyState> {
  const id = parseAppleKey(input)
  if (!id) return { paid: false, expiresAt: null }
  const cacheKey = createHash('sha256').update(id).digest('hex')
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.state

  const list = clients()
  if (!list.length) throw new Error('サーバーの準備ができていません。')
  let state: AppleKeyState | null = null
  let reached = false
  for (const client of list) {
    try {
      const response = await client.getAllSubscriptionStatuses(id)
      reached = true
      for (const group of response.data ?? []) {
        for (const last of group.lastTransactions ?? []) {
          if (last.originalTransactionId !== id || !last.signedTransactionInfo) continue
          const active = last.status === Status.ACTIVE || last.status === Status.BILLING_GRACE_PERIOD
          let expiresAt: string | null = null
          for (const verifier of verifiers) {
            try {
              const tx = await verifier.verifyAndDecodeTransaction(last.signedTransactionInfo)
              if (tx.productId !== PLUS_PRODUCT_ID) break
              expiresAt = typeof tx.expiresDate === 'number' ? new Date(tx.expiresDate).toISOString() : null
              state = { paid: active && !tx.revocationDate, expiresAt }
              break
            } catch {
              // 次の環境の証明書で試す
            }
          }
        }
      }
      if (state) break
    } catch (error) {
      // 404（この環境にない購入）なら次の環境へ。それ以外の失敗も次へ回し、最後にまとめて判断する
      const status = (error as { httpStatusCode?: number }).httpStatusCode
      if (status === 404 || status === 400) reached = true
    }
  }
  if (!state && !reached) throw new Error('Apple に確認できませんでした。')
  const result = state ?? { paid: false, expiresAt: null }
  if (cache.size > 5000) cache.clear()
  cache.set(cacheKey, { state: result, expires: Date.now() + (result.paid ? CACHE_MS : 60_000) })
  return result
}
