import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { targetType, targetId, action } = await request.json()

  if (!targetType || !targetId || !action) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  if (targetType !== 'post' && targetType !== 'question') {
    return NextResponse.json({ error: '不支持的内容类型' }, { status: 400 })
  }

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: '无效的操作类型' }, { status: 400 })
  }

  const tableName = targetType === 'post' ? 'posts' : 'questions'
  const status = action === 'approve' ? 'published' : 'rejected'

  const { data, error } = await supabase
    .from(tableName)
    .update({ status })
    .eq('id', targetId)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data[0])
}
