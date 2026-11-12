import { NextRequest, NextResponse } from 'next/server'
import { appleQuotaSubject, licenseQuotaSubject, paidAppleOriginalId } from '../../lib/apple-key'
import {
  allowApiRequest,
  isPaidLicense,
  isPaidMobileAccount,
  isPaidMobileDevice,
  isPaidPortableInstance,
  isValidAnonymousDeviceId,
  LicenseUnavailableError
} from '../../lib/license'
import { clientPlatform, nextResetDate, peekQuota, rewardCredits } from '../../lib/dailyLimit'

/**
 * 今月の AI の回数の残りを返す（回数は減らさない）。アプリが残りのバーを出すため（2026-11-11）。
 * 送るものは /api/summarize と同じ（無料版は端末の匿名 ID、Pro は購入キーか iPhone の購入記録）。
 * 返すもの：plan（free/pro）、kinds（summary/chat/polish ごとの上限・使った数・残り）、
 * rewardCredits（iPhone の無料版で、広告で足してまだ使っていない回数）、resetsOn（もとに戻る日）
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!allowApiRequest(req, 30)) {
    return NextResponse.json({ error: 'リクエストが多すぎます。1分後にお試しください。' }, { status: 429 })
  }
  let body: { deviceId?: string; licenseKey?: string; licenseInstanceId?: string; appleSignedTransaction?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
  }
  const hasKey = typeof body.licenseKey === 'string' && body.licenseKey.trim().length > 0 && body.licenseKey.length <= 256
  const hasDevice = isValidAnonymousDeviceId(body.deviceId)
  if (!hasKey && !hasDevice) {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
  }

  let licensePaid = false
  try {
    licensePaid = hasKey
      ? typeof body.licenseInstanceId === 'string' && body.licenseInstanceId.length <= 100
        ? await isPaidPortableInstance(body.licenseKey!, body.licenseInstanceId)
        : await isPaidLicense(body.licenseKey)
      : false
  } catch (error) {
    // 招待コードの鍵が未設定で判定できない → 503（summarize・polish と同じ。2026-11-12 の点検）
    if (error instanceof LicenseUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    throw error
  }
  // 購入キーが通らないときは、端末の ID で iPhone の Pro か無料版として見る（summarize と同じ。2026-11-12）
  const useDevice = !licensePaid && hasDevice
  const appleId = useDevice ? await paidAppleOriginalId(body.appleSignedTransaction) : null
  const mobilePaid = useDevice
    ? appleId !== null ||
      (await isPaidMobileAccount(req, body.deviceId!)) ||
      (await isPaidMobileDevice(body.deviceId!))
    : false
  const paid = licensePaid || mobilePaid

  const plan = paid ? 'pro' : 'free'
  const platform = clientPlatform(req.headers.get('user-agent'))
  // 数える相手は summarize・polish と同じ（iPhone で買った Pro は元の購入の番号。2026-11-12 の点検）
  const subject = licensePaid || !hasDevice
    ? licenseQuotaSubject(body.licenseKey!)
    : appleId
      ? appleQuotaSubject(appleId)
      : body.deviceId!
  const kinds = await peekQuota(subject, plan, platform)
  const credits = !paid && platform === 'iphone' && hasDevice ? await rewardCredits(body.deviceId!) : 0
  return NextResponse.json({ plan, platform, kinds, rewardCredits: credits, resetsOn: nextResetDate() })
}
