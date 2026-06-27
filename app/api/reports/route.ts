import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { targetType, targetId, reason } = await request.json()

  if (!targetType || !targetId || !reason) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  if (targetType !== 'post' && targetType !== 'question') {
    return NextResponse.json({ error: '不支持的举报类型' }, { status: 400 })
  }

  const { data, error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
  }).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Increment report count (read-modify-write, acceptable for non-critical counter)
  const tableName = targetType === 'post' ? 'posts' : 'questions'
  const { data: current } = await supabase
    .from(tableName)
    .select('report_count')
    .eq('id', targetId)
    .single()

  if (current) {
    await supabase
      .from(tableName)
      .update({ report_count: (current.report_count || 0) + 1 })
      .eq('id', targetId)
  }

  return NextResponse.json(data[0])
}
