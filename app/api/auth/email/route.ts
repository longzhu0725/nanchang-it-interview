import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { newEmail, password } = await request.json()

  if (!newEmail || !password) {
    return NextResponse.json({ error: '新邮箱和密码不能为空' }, { status: 400 })
  }

  // 1. 验证当前密码
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  })

  if (signInError) {
    return NextResponse.json({ error: '密码错误' }, { status: 400 })
  }

  // 2. 发起邮箱变更，Supabase 会向新邮箱发送确认邮件
  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: '已发送新邮箱确认邮件，请点击邮件中的链接完成换绑',
  })
}
