/**
 * 简单的内存级请求限流器
 * 基于 IP + 操作类型做滑动窗口限制
 * 注意：Vercel Serverless 无状态，实例重启/扩容时限制会重置
 * 如需更严格防护，建议后续接入 Redis（如 Upstash Redis）
 */

type WindowEntry = {
  count: number
  resetAt: number
}

const windows = new Map<string, WindowEntry>()

export type RateLimitConfig = {
  /** 时间窗口，单位毫秒 */
  windowMs: number
  /** 窗口内最大请求次数 */
  maxRequests: number
}

export function rateLimit(
  key: string,
  { windowMs, maxRequests }: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const existing = windows.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    const entry: WindowEntry = { count: 1, resetAt }
    windows.set(key, entry)
    return { success: true, remaining: maxRequests - 1, resetAt }
  }

  if (existing.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { success: true, remaining: maxRequests - existing.count, resetAt: existing.resetAt }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown'
}
