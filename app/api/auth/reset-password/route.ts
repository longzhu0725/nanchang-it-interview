import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const RESET_LIMIT = {
  windowMs: 60 * 1000, // 1 分钟
  maxRequests: 3,
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`reset-password:${ip}`, RESET_LIMIT)

  if (!limit.success) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: `发送过于频繁，请在 ${retryAfter} 秒后再试` },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  const { email, redirectTo } = await request.json()

  if (!email) {
    return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, message: '重置密码邮件已发送，请查收' })
}
