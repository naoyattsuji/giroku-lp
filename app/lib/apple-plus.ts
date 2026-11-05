import { createHash } from 'crypto'
import { Environment, SignedDataVerifier } from '@apple/app-store-server-library'

/**
 * iPhone のアプリ内課金の Plus（年額の自動更新サブスクリプション）を確かめる。
 * アプリは StoreKit 2 の署名つきの購入記録（JWS）をそのまま送ってくる。Apple のルート証明書から
 * 署名をたどって本物か確かめ、商品・アプリ・期限・返金を見る。アカウントもデータベースも使わない。
 * TestFlight・開発版の購入は Sandbox の記録になるので、本番で確かめられなければ Sandbox でも確かめる。
 */
export const BUNDLE_ID = 'app.giroku.mobile'
const APP_APPLE_ID = 6826128219
export const PLUS_PRODUCT_ID = 'app.giroku.mobile.plus.yearly'

// Apple Root CA - G3（https://www.apple.com/certificateauthority/AppleRootCA-G3.cer、公開されている証明書）
// SHA-256 63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79
const APPLE_ROOT_CA_G3 = 'MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtfTjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySrMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gAMGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM6BgD56KyKA=='

const roots = [Buffer.from(APPLE_ROOT_CA_G3, 'base64')]
// 署名のたびに Apple へ失効確認を問い合わせると遅くなるため、手元の証明書だけで確かめる
export const verifiers = [
  new SignedDataVerifier(roots, false, Environment.PRODUCTION, BUNDLE_ID, APP_APPLE_ID),
  new SignedDataVerifier(roots, false, Environment.SANDBOX, BUNDLE_ID),
]

const CACHE_MS = 10 * 60 * 1000
const cache = new Map<string, { paid: boolean; expires: number }>()

export function isPlausibleSignedTransaction(value: unknown): value is string {
  return typeof value === 'string' && value.length > 100 && value.length < 20_000 && value.split('.').length === 3
}

export async function isPaidAppleTransaction(signedTransaction: unknown): Promise<boolean> {
  if (!isPlausibleSignedTransaction(signedTransaction)) return false
  const key = createHash('sha256').update(signedTransaction).digest('hex')
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.paid
  let paid = false
  for (const verifier of verifiers) {
    try {
      const tx = await verifier.verifyAndDecodeTransaction(signedTransaction)
      paid =
        tx.bundleId === BUNDLE_ID &&
        tx.productId === PLUS_PRODUCT_ID &&
        !tx.revocationDate &&
        typeof tx.expiresDate === 'number' &&
        tx.expiresDate > Date.now()
      break
    } catch {
      // この環境の記録ではない・署名が合わない → 次の環境で試す
    }
  }
  if (cache.size > 5000) cache.clear()
  cache.set(key, { paid, expires: Date.now() + CACHE_MS })
  return paid
}

/** 確かめた上で、購入の大もとの番号（更新しても変わらない）を返す。有効でなければ null */
export async function paidOriginalTransactionId(signedTransaction: unknown): Promise<string | null> {
  if (!isPlausibleSignedTransaction(signedTransaction)) return null
  for (const verifier of verifiers) {
    try {
      const tx = await verifier.verifyAndDecodeTransaction(signedTransaction)
      const paid =
        tx.bundleId === BUNDLE_ID &&
        tx.productId === PLUS_PRODUCT_ID &&
        !tx.revocationDate &&
        typeof tx.expiresDate === 'number' &&
        tx.expiresDate > Date.now()
      return paid && tx.originalTransactionId ? tx.originalTransactionId : null
    } catch {
      // 次の環境で試す
    }
  }
  return null
}
