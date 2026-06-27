import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LikeButton } from '@/components/like-button'
import { BookmarkButton } from '@/components/bookmark-button'
import { ReportButton } from '@/components/report-button'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { MessageCircle, Star, User as UserIcon } from 'lucide-react'

async function addComment(formData: FormData) {
  'use server'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const postId = formData.get('post_id') as string
  const content = formData.get('content') as string

  await supabase.from('comments').insert({
    post_id: postId,
    content,
    author_id: user.id,
  })

  revalidatePath(`/posts/${postId}`)
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select('*, companies(name), jobs(title), profiles(nickname, company)')
    .eq('id', params.id)
    .single()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(nickname)')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  // Check if current user has liked this post
  let userLiked = false
  if (user) {
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', 'post')
      .eq('target_id', params.id)
      .maybeSingle()
    userLiked = !!existingLike
  }

  // Check if current user has bookmarked this post
  let userBookmarked = false
  if (user) {
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', params.id)
      .maybeSingle()
    userBookmarked = !!existingBookmark
  }

  if (!post) {
    return <div className="container mx-auto px-4 py-8">面经不存在</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant={post.type === '面经' ? 'default' : 'secondary'}>{post.type}</Badge>
          {post.difficulty && (
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <Star className="h-4 w-4 fill-yellow-500" />
              难度 {post.difficulty}/5
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {post.companies?.name && (
            <Link href={`/companies/${post.company_id}`} className="hover:underline font-medium">
              {post.companies.name}
            </Link>
          )}
          {post.jobs?.title && (
            <Link href={`/jobs/${post.job_id}`} className="hover:underline">
              {post.jobs.title}
            </Link>
          )}
          <span className="flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            {post.is_anonymous ? '匿名用户' : post.profiles?.nickname}
          </span>
          {!post.is_anonymous && post.profiles?.company && (
            <span className="text-xs">({post.profiles.company})</span>
          )}
          <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <MarkdownRenderer content={post.content} />
        </CardContent>
      </Card>

      <div className="flex gap-3 mb-6 items-center">
        <LikeButton
          targetType="post"
          targetId={post.id}
          initialLikes={post.likes || 0}
          initialLiked={userLiked}
        />
        <BookmarkButton
          postId={post.id}
          initialBookmarked={userBookmarked}
        />
        <ReportButton
          targetType="post"
          targetId={post.id}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            评论 ({comments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <form action={addComment} className="space-y-3">
              <input type="hidden" name="post_id" value={post.id} />
              <Textarea name="content" rows={3} placeholder="写下你的评论..." required />
              <Button type="submit" size="sm">发表评论</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">登录</Link>后发表评论
            </p>
          )}
          {comments?.map((comment) => (
            <div key={comment.id} className="border-b pb-3 last:border-0">
              <p className="text-sm font-medium mb-1">{comment.profiles?.nickname}</p>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(comment.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          ))}
          {!comments?.length && (
            <p className="text-sm text-muted-foreground text-center py-4">暂无评论</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
