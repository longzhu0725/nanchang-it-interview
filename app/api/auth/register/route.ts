import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const REGISTER_LIMIT = {
  windowMs: 5 * 60 * 1000, // 5 分钟
  maxRequests: 5, // 每个 IP 最多 5 次注册尝试
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`register:${ip}`, REGISTER_LIMIT)

  if (!limit.success) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: `注册尝试过于频繁，请在 ${Math.ceil(retryAfter / 60)} 分钟后再试` },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(REGISTER_LIMIT.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(limit.resetAt / 1000)),
          'Retry-After': String(retryAfter),
        },
      }
    )
  }

  const { email, password, nickname, company } = await request.json()

  if (!email || !password || !nickname) {
    return NextResponse.json({ error: '邮箱、密码和昵称为必填项' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 创建用户
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || '注册失败' }, { status: 400 })
  }

  // 创建用户资料
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email,
    nickname,
    company,
    city: '南昌',
    invite_code_id: null,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
