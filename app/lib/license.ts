// Giroku アプリからのAPIリクエストを、LemonSqueezyの有料ライセンスキーで検証する。
// Geminiキーはこのサーバー側にのみ置き、アプリ本体には一切含めない構成にするための検証ヘルパー。

/**
 * Geminiが一時的に混雑(429/503)を返すことがあるため、短い間隔で自動リトライする。
 * それ以外のエラー(4xx等)は即座に返す。
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastRes: Response | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init)
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
    }
    // LemonSqueezyのstatusは購入直後は"inactive"（まだどの端末でも未アクティベート）になる。
    // 端末ごとのアクティベート管理はアプリ側(license.ts)が別途行うため、
    // ここでは「有効な購入キーか・期限内か」のみを見る。'disabled' は明示的に弾く。
    if (!data.valid || data.license_key?.status === 'disabled') return false
    const expiresAt = data.license_key?.expires_at
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return false
    return true
  } catch {
    return false
  }
}
