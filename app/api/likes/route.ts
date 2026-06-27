import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { targetType, targetId } = await request.json()

  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle()

  if (existingLike) {
    await supabase.from('likes').delete().eq('id', existingLike.id)
    await supabase.rpc('decrement_likes', { target_type: targetType, target_id: targetId })
    return NextResponse.json({ liked: false })
  }

  await supabase.from('likes').insert({
    user_id: user.id,
    target_type: targetType,
    target_id: targetId,
  })

  await supabase.rpc('increment_likes', { target_type: targetType, target_id: targetId })

  return NextResponse.json({ liked: true })
}
