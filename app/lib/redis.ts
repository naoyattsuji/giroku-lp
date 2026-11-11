/**
 * Upstash（Vercel から足した Redis）に、REST で命令を送る。
 * つながっていない・答えないときは null を返し、呼んだ側が代わりの動きをする（AI 機能は止めない）。
 */
function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

export function redisAvailable(): boolean {
  return redisConfig() !== null
}

/** 命令をまとめて送り、それぞれの結果を返す */
export async function redisPipeline(commands: Array<Array<string | number>>): Promise<unknown[] | null> {
  const config = redisConfig()
  if (!config) return null
  try {
    const res = await fetch(`${config.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(2_000)
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ result?: unknown }>
    return Array.isArray(data) ? data.map((d) => d?.result) : null
  } catch {
    return null
  }
}

/** 日本時間の日付（YYYYMMDD） */
export function jstDay(now = Date.now()): string {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '')
}

/** 日本時間の年月（YYYYMM） */
export function jstMonth(now = Date.now()): string {
  return jstDay(now).slice(0, 6)
}
