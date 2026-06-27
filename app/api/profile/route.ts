import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const { nickname, company, city, avatar_url } = body

  const updates: Record<string, unknown> = {}
  if (nickname !== undefined) updates.nickname = nickname
  if (company !== undefined) updates.company = company
  if (city !== undefined) updates.city = city
  if (avatar_url !== undefined) updates.avatar_url = avatar_url

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '没有提供要更新的字段' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data[0])
}
