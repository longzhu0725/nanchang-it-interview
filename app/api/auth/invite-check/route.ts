import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { code } = await request.json()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false, message: '邀请码不存在' }, { status: 400 })
  }

  if (data.is_used) {
    return NextResponse.json({ valid: false, message: '邀请码已被使用' }, { status: 400 })
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, message: '邀请码已过期' }, { status: 400 })
  }

  return NextResponse.json({ valid: true })
}
