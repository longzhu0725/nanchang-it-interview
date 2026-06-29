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

  // 创建/更新用户资料
  // 说明：某些 Supabase 项目中会配置 auth.users 触发器自动在 public.profiles 插入记录，
  // 直接使用 insert 会导致 profiles_pkey 主键冲突。这里使用 upsert：
  // - 如果触发器已创建记录，则更新昵称/公司/城市等信息
  // - 如果没有触发器，则插入新记录
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: authData.user.id,
    email,
    nickname,
    company,
    city: null,
    invite_code_id: null,
  }, {
    onConflict: 'id',
    ignoreDuplicates: false,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
