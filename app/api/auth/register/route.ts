import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { email, password, nickname, company, inviteCode } = await request.json()

  const supabase = createAdminClient()

  // 验证邀请码
  const { data: inviteData, error: inviteError } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', inviteCode)
    .single()

  if (inviteError || !inviteData || inviteData.is_used) {
    return NextResponse.json({ error: '邀请码无效或已被使用' }, { status: 400 })
  }

  if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
    return NextResponse.json({ error: '邀请码已过期' }, { status: 400 })
  }

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
    invite_code_id: inviteData.id,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  // 标记邀请码已使用
  await supabase
    .from('invite_codes')
    .update({ is_used: true, used_by: authData.user.id })
    .eq('id', inviteData.id)

  return NextResponse.json({ success: true })
}
