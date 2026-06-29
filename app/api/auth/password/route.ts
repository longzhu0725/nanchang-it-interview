import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: '当前密码和新密码不能为空' }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: '新密码至少 6 位' }, { status: 400 })
  }

  // 1. 验证当前密码：用当前邮箱和密码尝试登录
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
  }

  // 2. 更新密码
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, message: '密码修改成功' })
}
