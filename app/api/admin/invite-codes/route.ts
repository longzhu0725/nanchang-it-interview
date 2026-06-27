import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { count = 1 } = await request.json()
  const codes = Array.from({ length: Math.min(count, 50) }, () => ({
    code: randomBytes(6).toString('hex').toUpperCase(),
    created_by: user.id,
  }))

  const { data, error } = await supabase.from('invite_codes').insert(codes).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
