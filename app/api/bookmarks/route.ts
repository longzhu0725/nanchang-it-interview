import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { postId } = await request.json()

  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  if (existingBookmark) {
    await supabase.from('bookmarks').delete().eq('id', existingBookmark.id)
    return NextResponse.json({ bookmarked: false })
  }

  await supabase.from('bookmarks').insert({
    user_id: user.id,
    post_id: postId,
  })

  return NextResponse.json({ bookmarked: true })
}
