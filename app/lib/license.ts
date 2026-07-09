// Giroku アプリからのAPIリクエストを、LemonSqueezyの有料ライセンスキーで検証する。
// Geminiキーはこのサーバー側にのみ置き、アプリ本体には一切含めない構成にするための検証ヘルパー。

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
