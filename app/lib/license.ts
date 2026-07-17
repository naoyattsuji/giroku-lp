// Giroku アプリからのAPIリクエストを、LemonSqueezyの有料ライセンスキーで検証する。
// Geminiキーはこのサーバー側にのみ置き、アプリ本体には一切含めない構成にするための検証ヘルパー。

import { createHash } from 'node:crypto'

const GIROKU_STORE_ID = 410452
const GIROKU_PRODUCT_ID = 1153138
const LICENSE_CACHE_MS = 5 * 60 * 1000
const licenseCache = new Map<string, { paid: boolean; expires: number }>()
const rateBuckets = new Map<string, { count: number; resetAt: number }>()
const licenseMinuteBuckets = new Map<string, { count: number; resetAt: number }>()
const licenseHourBuckets = new Map<string, { count: number; resetAt: number }>()
const anonymousMinuteBuckets = new Map<string, { count: number; resetAt: number }>()
const anonymousHourBuckets = new Map<string, { count: number; resetAt: number }>()
const mobilePaidMinuteBuckets = new Map<string, { count: number; resetAt: number }>()
const mobilePaidHourBuckets = new Map<string, { count: number; resetAt: number }>()
const revenueCatCache = new Map<string, { paid: boolean; expires: number }>()

/**
 * Geminiが一時的に混雑(429/503)を返すことがあるため、短い間隔で自動リトライする。
 * それ以外のエラー(4xx等)は即座に返す。
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 2
): Promise<Response> {
  let lastRes: Response | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const timeoutSignal = AbortSignal.timeout(45_000)
    const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal
    const res = await fetch(url, { ...init, signal })
    if (res.ok || (res.status !== 429 && res.status !== 503)) return res
    lastRes = res
    if (attempt < maxRetries) {
      const delay = 400 * Math.pow(2, attempt) // 400ms, 800ms, 1600ms
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  return lastRes as Response
}

export async function isPaidLicense(licenseKey: string | undefined | null): Promise<boolean> {
  if (!licenseKey) return false
  const cacheKey = createHash('sha256').update(licenseKey).digest('hex')
  const cached = licenseCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.paid
  try {
    const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ license_key: licenseKey }).toString()
    })
    if (!res.ok) return false
    const data = (await res.json()) as {
      valid?: boolean
      license_key?: { status?: string; expires_at?: string | null }
      meta?: { store_id?: number; product_id?: number }
    }
    // API利用にもアプリ側での端末アクティベーションを必須にし、端末数制限を迂回できないようにする。
    if (
      !data.valid ||
      data.license_key?.status !== 'active' ||
      data.meta?.store_id !== GIROKU_STORE_ID ||
      data.meta?.product_id !== GIROKU_PRODUCT_ID
    ) {
      licenseCache.set(cacheKey, { paid: false, expires: Date.now() + 60_000 })
      return false
    }
    const expiresAt = data.license_key?.expires_at
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return false
    licenseCache.set(cacheKey, { paid: true, expires: Date.now() + LICENSE_CACHE_MS })
    return true
  } catch {
    return false
  }
}

/** Vercelインスタンス単位の軽量な濫用防止。永続ストアなしでも突発的な連打を抑える。 */
export function allowApiRequest(req: Request, limit = 12): boolean {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const key = forwarded || req.headers.get('x-real-ip') || 'unknown'
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
  return take(licenseMinuteBuckets, 6, 60_000) && take(licenseHourBuckets, 30, 60 * 60_000)
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
  return take(anonymousMinuteBuckets, 4, 60_000) && take(anonymousHourBuckets, 24, 60 * 60_000)
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
  return take(mobilePaidMinuteBuckets, 6, 60_000) && take(mobilePaidHourBuckets, 30, 60 * 60_000)
}

export function requestBodyIsTooLarge(req: Request, maxBytes = 2_000_000): boolean {
  const declared = Number(req.headers.get('content-length'))
  return Number.isFinite(declared) && declared > maxBytes
}

export function validTranscriptSegments(
  segments: Array<{ speaker?: unknown; text?: unknown }>,
  maxCharacters = 250_000
): boolean {
  if (segments.length > 5000) return false
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
