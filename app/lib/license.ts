// Giroku アプリからのAPIリクエストを、Polar の購入キー（PC 版 Pro）・招待コード・iPhone のキーで検証する。
// Geminiキーはこのサーバー側にのみ置き、アプリ本体には一切含めない構成にするための検証ヘルパー。

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { checkAppleKey, isAppleKey } from './apple-key'
import { DeadlineError, remainingMs } from './deadline'
import { redisPipeline } from './redis'

// デスクトップ版のGIROKU-PROMO-招待コード（HMAC方式、Giroku/scripts/generate-promo-codes.mjs で発行）。
// 鍵（GIROKU_PROMO_SECRET）はこのサーバーの環境変数にだけ置く。デスクトップ版は 0.1.68 から
// 鍵を持たず、/api/license の action 'promo' でここへ問い合わせる（配布物から鍵を取り出して
// 招待コードを作られないようにするため）。AI機能（要約・文章整形）も同じ判定を使う。
const PROMO_PREFIX = 'GIROKU-PROMO-'

function signPromoCode(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex').slice(0, 8).toUpperCase()
}

export function isPromoCode(input: string): boolean {
  return input.trim().toUpperCase().startsWith(PROMO_PREFIX)
}

/** 鍵が設定されていなければ null（＝判定できない）。設定済みなら招待コードが正しいか。 */
export function checkPromoCode(input: string): boolean | null {
  const secret = process.env.GIROKU_PROMO_SECRET?.trim()
  if (!secret) return null
  const code = input.trim().toUpperCase()
  if (code.length > 64 || !code.startsWith(PROMO_PREFIX)) return false
  const parts = code.slice(PROMO_PREFIX.length).split('-')
  if (parts.length !== 2) return false
  const [id, sig] = parts
  if (!/^[A-Z0-9]{8}$/.test(id) || !/^[A-Z0-9]{8}$/.test(sig)) return false
  const expected = Buffer.from(signPromoCode(`${PROMO_PREFIX}${id}`, secret))
  return timingSafeEqual(expected, Buffer.from(sig))
}

/**
 * 招待コードを判定できない（鍵の環境変数が無い）ときの失敗。
 * 前は「無効」と同じ扱いで summarize・polish が 403 を返し、招待コードの人が「Pro ではない」と取り違えられた。
 * /api/license と同じく 503（確かめられなかった）にするため、呼び出し元へ投げる（2026-11-12 の点検）
 */
export class LicenseUnavailableError extends Error {
  constructor(message = '確認できませんでした。しばらくしてからお試しください。') {
    super(message)
    this.name = 'LicenseUnavailableError'
  }
}

function verifyPromoCode(input: string): boolean {
  const valid = checkPromoCode(input)
  if (valid === null) throw new LicenseUnavailableError()
  return valid
}

// PC 版 Pro の購入キーは Polar が出す（2026-11-20 Lemon Squeezy から切り替え。Lemon Squeezy は新しいお店を受け付けなくなった）。
// 確かめる窓口はお客さん向けの公開の窓口で、合言葉は要らない。組織の番号と特典（購入キー）の番号は公開してよい値
const POLAR_LICENSE_BASE = 'https://api.polar.sh/v1/customer-portal/license-keys'
const POLAR_ORGANIZATION_ID = process.env.POLAR_ORGANIZATION_ID?.trim() || '59dfc57b-e838-4299-a262-a0931f828062'
// 「Giroku Pro 購入キー（パソコン1台）」の特典。ほかの特典のキーは受け付けない
const POLAR_BENEFIT_IDS = new Set<string>([
  'cf15e1f1-03b5-4824-9df8-26aa76f978de',
  ...(process.env.POLAR_BENEFIT_IDS ?? '').split(',').map((v) => v.trim()).filter(Boolean),
])
// パソコンは1台まで（2026-11-12 本人の判断。Polar の特典の設定でも1台にしてある）
const LICENSE_CACHE_MS = 5 * 60 * 1000
const licenseCache = new Map<string, { paid: boolean; expires: number }>()
const portableInstanceCache = new Map<string, { paid: boolean; expires: number }>()
const rateBuckets = new Map<string, { count: number; resetAt: number }>()
const licenseMinuteBuckets = new Map<string, { count: number; resetAt: number }>()
const licenseHourBuckets = new Map<string, { count: number; resetAt: number }>()
const anonymousMinuteBuckets = new Map<string, { count: number; resetAt: number }>()
const anonymousHourBuckets = new Map<string, { count: number; resetAt: number }>()
const mobilePaidMinuteBuckets = new Map<string, { count: number; resetAt: number }>()
const mobilePaidHourBuckets = new Map<string, { count: number; resetAt: number }>()
const revenueCatCache = new Map<string, { paid: boolean; expires: number }>()

export interface PortableLicenseState {
  paid: boolean
  expiresAt: string | null
  instanceId: string | null
  instanceName: string | null
}

interface PolarLicenseKey {
  benefit_id?: string
  status?: string
  expires_at?: string | null
}

interface PolarActivation {
  id?: string
  label?: string
  license_key?: PolarLicenseKey
}

interface PolarValidated extends PolarLicenseKey {
  activation?: PolarActivation | null
}

export class PortableLicenseError extends Error {
  readonly upstream: boolean

  constructor(message: string, upstream = false) {
    super(message)
    this.name = 'PortableLicenseError'
    this.upstream = upstream
  }
}

function portableLicenseResponseError(status: number): PortableLicenseError {
  // Polar は台数の上限に届くと 403 を返す
  if (status === 403) {
    return new PortableLicenseError('この購入キーは、すでに別のパソコンで使われています。前のパソコンの設定で「この端末で解除」してから、もう一度登録してください。')
  }
  if (status === 404 || status === 422) return new PortableLicenseError('購入キーが見つかりません。入力内容をご確認ください。')
  if (status === 429 || status >= 500) return new PortableLicenseError('購入キーを確認するサーバーへ接続できませんでした。', true)
  return new PortableLicenseError('購入キーを確認できませんでした。')
}

function assertPortableLicenseInput(licenseKey: string, instanceName?: string, instanceId?: string): void {
  if (!licenseKey.trim() || licenseKey.length > 256) throw new Error('ライセンスキーを確認してください。')
  if (instanceName !== undefined && (!instanceName.trim() || instanceName.length > 100)) {
    throw new Error('端末情報を確認してください。')
  }
  if (instanceId !== undefined && (!instanceId.trim() || instanceId.length > 100)) {
    throw new Error('端末情報を確認してください。')
  }
}

/** Polar の公開の窓口を呼ぶ。204（解除）は本文なし。失敗は PortableLicenseError にする */
async function postPolarLicense<T>(
  action: 'activate' | 'validate' | 'deactivate',
  values: Record<string, string>,
  timeoutMs = 15_000,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${POLAR_LICENSE_BASE}/${action}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, organization_id: POLAR_ORGANIZATION_ID }),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch {
    throw new PortableLicenseError('購入キーを確認するサーバーへ接続できませんでした。', true)
  }
  if (!response.ok) throw portableLicenseResponseError(response.status)
  if (response.status === 204) return {} as T
  return (await response.json().catch(() => ({}))) as T
}

function assertGirokuLicense(key: PolarLicenseKey | undefined): void {
  if (!key?.benefit_id || !POLAR_BENEFIT_IDS.has(key.benefit_id)) {
    throw new PortableLicenseError('この購入キーはGiroku用ではありません。')
  }
}

function expiresInPast(expiresAt: string | null | undefined): boolean {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now())
}

/** 購入キーをこのパソコン（またはスマートフォン）に登録する。Polar では登録を activation と呼ぶ */
export async function activatePortableLicense(licenseKey: string, instanceName: string): Promise<PortableLicenseState> {
  const key = licenseKey.trim()
  const name = instanceName.trim()
  assertPortableLicenseInput(key, name)
  const data = await postPolarLicense<PolarActivation>('activate', { key, label: name })
  assertGirokuLicense(data.license_key)
  if (!data.id || data.license_key?.status !== 'granted' || expiresInPast(data.license_key?.expires_at)) {
    if (data.id) await postPolarLicense('deactivate', { key, activation_id: data.id }).catch(() => undefined)
    throw new PortableLicenseError('この購入キーは有効ではありません。')
  }
  licenseCache.delete(createHash('sha256').update(key).digest('hex'))
  portableInstanceCache.clear()
  return {
    paid: true,
    expiresAt: data.license_key?.expires_at ?? null,
    instanceId: data.id,
    instanceName: data.label ?? name,
  }
}

export async function validatePortableLicense(licenseKey: string, instanceId: string): Promise<PortableLicenseState> {
  const key = licenseKey.trim()
  const id = instanceId.trim()
  assertPortableLicenseInput(key, undefined, id)
  let data: PolarValidated
  try {
    data = await postPolarLicense<PolarValidated>('validate', { key, activation_id: id })
  } catch (error) {
    // 404 は「無い・取り消された・期限切れ・登録が無い」。無料として返す
    if (error instanceof PortableLicenseError && !error.upstream) {
      return { paid: false, expiresAt: null, instanceId: null, instanceName: null }
    }
    throw error
  }
  assertGirokuLicense(data)
  const paid = data.status === 'granted' && !expiresInPast(data.expires_at)
  return {
    paid,
    expiresAt: data.expires_at ?? null,
    instanceId: paid ? id : null,
    instanceName: data.activation?.label ?? null,
  }
}

/** モバイルのAI利用時に、キーだけでなく登録済み端末IDも検証して台数の制限の迂回を防ぐ。 */
export async function isPaidPortableInstance(licenseKey: string, instanceId: string): Promise<boolean> {
  const key = licenseKey.trim()
  const id = instanceId.trim()
  try {
    assertPortableLicenseInput(key, undefined, id)
  } catch {
    return false
  }
  const cacheKey = createHash('sha256').update(`${key}:${id}`).digest('hex')
  const cached = portableInstanceCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.paid
  try {
    const state = await validatePortableLicense(key, id)
    portableInstanceCache.set(cacheKey, { paid: state.paid, expires: Date.now() + (state.paid ? LICENSE_CACHE_MS : 60_000) })
    return state.paid
  } catch {
    return false
  }
}

export async function deactivatePortableLicense(licenseKey: string, instanceId: string): Promise<void> {
  const key = licenseKey.trim()
  const id = instanceId.trim()
  assertPortableLicenseInput(key, undefined, id)
  await postPolarLicense('deactivate', { key, activation_id: id })
  licenseCache.delete(createHash('sha256').update(key).digest('hex'))
  portableInstanceCache.clear()
}

/**
 * Geminiが一時的に混雑(429/503)を返すことがあるため、間隔を広げながら自動リトライする。
 * それ以外のエラー(4xx等)は即座に返す。
 *
 * 以前は0.4秒・0.8秒後の2回だけで、混雑が数秒続くと「要約に失敗しました (503)」が
 * そのまま利用者に出ていた（実機で発生し、押し直すと成功した）。混雑の断りはすぐ返るため、
 * 1秒・2秒・4秒と待っても合計7秒ほどで、関数の制限時間（60秒）には十分収まる。
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastRes: Response | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // リクエストの締め切り（app/lib/deadline.ts）が近ければ始めない。投げた失敗は呼び出し元が回数を返す
    const left = remainingMs()
    // 締め切りの失敗は DeadlineError にして、呼び出し元が 503 を返せるようにする（2026-11-12 の点検）
    if (left < 3000) throw new DeadlineError()
    const timeoutSignal = AbortSignal.timeout(Math.min(45_000, left - 1000))
    const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal
    const res = await fetch(url, { ...init, signal })
    if (res.ok || (res.status !== 429 && res.status !== 503)) return res
    lastRes = res
    if (attempt < maxRetries) {
      const delay = 1000 * Math.pow(2, attempt) // 1秒, 2秒, 4秒
      if (remainingMs() < delay + 3000) break
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  return lastRes as Response
}

/** 招待コードの鍵が無くて判定できないときは LicenseUnavailableError を投げる（呼び出し元で 503） */
export async function isPaidLicense(licenseKey: string | undefined | null): Promise<boolean> {
  if (!licenseKey) return false
  if (isPromoCode(licenseKey)) return verifyPromoCode(licenseKey)
  // iPhone で買った Pro を PC で使うキー（GIROKU-IOS-…）は Apple に有効か聞く
  if (isAppleKey(licenseKey)) return checkAppleKey(licenseKey).then((s) => s.paid).catch(() => false)
  const cacheKey = createHash('sha256').update(licenseKey).digest('hex')
  const cached = licenseCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.paid
  // Polar が遅い・答えないときは、24時間以内に「Pro」と確かめた結果を使う（Upstash に残す）。
  // 前は通信の失敗も「無料」と同じ扱いで、15秒待つ間にアプリが諦め、Pro の人の残り回数が消え、議事録も 403 になった（2026-11-12）
  const lastKnownPaid = async (): Promise<boolean> => {
    const result = await redisPipeline([['GET', `giroku:lic:ok:${cacheKey}`]])
    return result?.[0] === '1'
  }
  try {
    // アプリは残り回数を15秒で諦めるので、それより十分短く
    const data = await postPolarLicense<PolarValidated>('validate', { key: String(licenseKey).trim() }, 6_000)
    const paid =
      data.status === 'granted' &&
      Boolean(data.benefit_id && POLAR_BENEFIT_IDS.has(data.benefit_id)) &&
      !expiresInPast(data.expires_at)
    if (!paid) {
      licenseCache.set(cacheKey, { paid: false, expires: Date.now() + 60_000 })
      await redisPipeline([['DEL', `giroku:lic:ok:${cacheKey}`]])
      return false
    }
    licenseCache.set(cacheKey, { paid: true, expires: Date.now() + LICENSE_CACHE_MS })
    await redisPipeline([['SET', `giroku:lic:ok:${cacheKey}`, '1', 'EX', 24 * 60 * 60]])
    return true
  } catch (error) {
    // 「無い・取り消された」（404 など）ははっきり無料。混雑・故障・時間切れは前に確かめた結果に頼る
    if (error instanceof PortableLicenseError && !error.upstream) {
      licenseCache.set(cacheKey, { paid: false, expires: Date.now() + 60_000 })
      await redisPipeline([['DEL', `giroku:lic:ok:${cacheKey}`]])
      return false
    }
    return lastKnownPaid()
  }
}

/** Vercelインスタンス単位の軽量な濫用防止。永続ストアなしでも突発的な連打を抑える。 */
export function allowApiRequest(req: Request, limit = 12): boolean {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  // 窓口ごとに分けて数える。1つにまとめていたため、残り回数や購入キーの確認が、議事録・質問の枠を食っていた（2026-11-12 の点検）
  let path = ''
  try {
    path = new URL(req.url).pathname
  } catch {
    path = ''
  }
  const key = `${path}:${forwarded || req.headers.get('x-real-ip') || 'unknown'}`
  const now = Date.now()
  if (rateBuckets.size > 5000) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (bucket.resetAt <= now) rateBuckets.delete(bucketKey)
    }
  }
  const current = rateBuckets.get(key)
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (current.count >= limit) return false
  current.count++
  return true
}

export function allowLicenseRequest(licenseKey: string | undefined | null): boolean {
  if (!licenseKey) return false
  const key = createHash('sha256').update(licenseKey).digest('hex')
  const now = Date.now()
  const take = (
    buckets: Map<string, { count: number; resetAt: number }>,
    limit: number,
    windowMs: number
  ): boolean => {
    const current = buckets.get(key)
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    if (current.count >= limit) return false
    current.count++
    return true
  }
  // Pro も同じく、連打を防ぐだけ（月・1日の上限は dailyLimit.ts）
  return take(licenseMinuteBuckets, 12, 60_000) && take(licenseHourBuckets, 90, 60 * 60_000)
}

/** 登録不要の無料版を匿名端末IDで認可する。個人情報や端末名は受け取らない。 */
export function isValidAnonymousDeviceId(deviceId: unknown): deviceId is string {
  return typeof deviceId === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(deviceId)
}

/** RevenueCatで購入したモバイル端末のpro権利をサーバー側でも確認する。 */
export async function isPaidMobileDevice(deviceId: string): Promise<boolean> {
  if (!isValidAnonymousDeviceId(deviceId)) return false
  const secret = process.env.REVENUECAT_SECRET_API_KEY?.trim()
  if (!secret) return false
  const key = createHash('sha256').update(deviceId).digest('hex')
  const cached = revenueCatCache.get(key)
  if (cached && cached.expires > Date.now()) return cached.paid
  try {
    const appUserId = `device:${deviceId}`
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
      headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return false
    const data = await response.json() as {
      subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> }
    }
    const entitlement = data.subscriber?.entitlements?.pro
    const expiresAt = entitlement?.expires_date ? new Date(entitlement.expires_date).getTime() : null
    const paid = Boolean(entitlement && (expiresAt === null || expiresAt > Date.now()))
    revenueCatCache.set(key, { paid, expires: Date.now() + (paid ? LICENSE_CACHE_MS : 60_000) })
    return paid
  } catch {
    return false
  }
}

/** Supabaseログインと有効端末枠を検証し、共通アカウントのRevenueCat権利を確認する。 */
export async function isPaidMobileAccount(req: Request, deviceId: string): Promise<boolean> {
  if (!isValidAnonymousDeviceId(deviceId)) return false
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  const secret = process.env.REVENUECAT_SECRET_API_KEY?.trim()
  const authorization = req.headers.get('authorization')
  if (!supabaseUrl || !publishableKey || !secret || !authorization?.startsWith('Bearer ')) return false

  try {
    const authHeaders = { Authorization: authorization, apikey: publishableKey, Accept: 'application/json' }
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: authHeaders,
      signal: AbortSignal.timeout(10_000),
    })
    if (!userResponse.ok) return false
    const user = await userResponse.json() as { id?: string }
    if (!user.id || !/^[0-9a-f-]{36}$/i.test(user.id)) return false

    const query = new URLSearchParams({
      select: 'id',
      device_id: `eq.${deviceId}`,
      active: 'eq.true',
      limit: '1',
    })
    const deviceResponse = await fetch(`${supabaseUrl}/rest/v1/device_activations?${query}`, {
      headers: authHeaders,
      signal: AbortSignal.timeout(10_000),
    })
    if (!deviceResponse.ok) return false
    const devices = await deviceResponse.json() as Array<{ id?: string }>
    if (!devices.length) return false

    const cacheKey = createHash('sha256').update(`account:${user.id}`).digest('hex')
    const cached = revenueCatCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) return cached.paid
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
      headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return false
    const data = await response.json() as {
      subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> }
    }
    const entitlement = data.subscriber?.entitlements?.pro
    const expiresAt = entitlement?.expires_date ? new Date(entitlement.expires_date).getTime() : null
    const paid = Boolean(entitlement && (expiresAt === null || expiresAt > Date.now()))
    revenueCatCache.set(cacheKey, { paid, expires: Date.now() + (paid ? LICENSE_CACHE_MS : 60_000) })
    return paid
  } catch {
    return false
  }
}

/** 無料版の直接API濫用を抑える。月2件/各10回のUX上限は端末側でも管理する。 */
export function allowAnonymousRequest(deviceId: string): boolean {
  const key = createHash('sha256').update(deviceId).digest('hex')
  const now = Date.now()
  const take = (
    buckets: Map<string, { count: number; resetAt: number }>,
    limit: number,
    windowMs: number
  ): boolean => {
    const current = buckets.get(key)
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    if (current.count >= limit) return false
    current.count++
    return true
  }
  // 費用は月・1日の上限（dailyLimit.ts）で守るので、ここは連打を防ぐだけにする。
  // 前の「1分4回」は、議事録を作ってすぐ深掘りの質問を続けると当たっていた（2026-11-11）
  return take(anonymousMinuteBuckets, 10, 60_000) && take(anonymousHourBuckets, 60, 60 * 60_000)
}

/** 有料モバイル版にも不正な自動連打だけを止める安全上限を設ける。 */
export function allowMobilePaidRequest(deviceId: string): boolean {
  const key = createHash('sha256').update(deviceId).digest('hex')
  const now = Date.now()
  const take = (
    buckets: Map<string, { count: number; resetAt: number }>,
    limit: number,
    windowMs: number
  ): boolean => {
    const current = buckets.get(key)
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    if (current.count >= limit) return false
    current.count++
    return true
  }
  // 購入キーの Pro（1分12回・1時間90回）と同じにする。無料版（10回・60回）より厳しく残っていた（2026-11-12 の点検）
  return take(mobilePaidMinuteBuckets, 12, 60_000) && take(mobilePaidHourBuckets, 90, 60 * 60_000)
}

export function requestBodyIsTooLarge(req: Request, maxBytes = 2_000_000): boolean {
  const declared = Number(req.headers.get('content-length'))
  return Number.isFinite(declared) && declared > maxBytes
}

export function validTranscriptSegments(
  segments: Array<{ speaker?: unknown; text?: unknown }>,
  maxCharacters = 250_000
): boolean {
  // 区切りの数ではなく文字数で長さを見る（昔の録音は1行が短く、3時間で7,000区切りを超えて議事録を作れなかった）
  if (segments.length > 30000) return false
  let characters = 0
  for (const segment of segments) {
    if ((segment.speaker !== 'self' && segment.speaker !== 'other') || typeof segment.text !== 'string') {
      return false
    }
    if (segment.text.length > 10_000) return false
    characters += segment.text.length
    if (characters > maxCharacters) return false
  }
  return true
}
