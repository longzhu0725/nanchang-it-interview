import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

async function updatePostStatus(formData: FormData) {
  'use server'
  const supabase = createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await supabase.from('posts').update({ status }).eq('id', id)
  revalidatePath('/admin/posts')
}

export default async function AdminPostsPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(nickname)')
    .order('created_at', { ascending: false })

  // Count pending posts
  const pendingCount = posts?.filter(p => p.status === 'pending').length || 0

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    published: { label: '已发布', variant: 'default' },
    pending: { label: '待审核', variant: 'secondary' },
    rejected: { label: '已拒绝', variant: 'destructive' },
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">帖子审核</h2>

      {pendingCount > 0 && (
        <Card className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="py-3">
            <p className="text-sm">
              <Badge variant="secondary" className="mr-2">待审核</Badge>
              当前有 <span className="font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</span> 篇帖子等待审核
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>帖子列表（共 {posts?.length || 0} 篇）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts?.map((post) => (
              <Card key={post.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
                          {post.title}
                        </Link>
                        <Badge variant="outline" className="text-xs">{post.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.profiles?.nickname || '匿名用户'} · {new Date(post.created_at).toLocaleDateString('zh-CN')}
                        {post.difficulty && ` · 难度: ${post.difficulty}/5`}
                        {post.likes > 0 && ` · 点赞: ${post.likes}`}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {post.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusMap[post.status]?.variant || 'outline'}>
                        {statusMap[post.status]?.label || post.status}
                      </Badge>
                      {post.status === 'pending' ? (
                        <>
                          <form action={updatePostStatus}>
                            <input type="hidden" name="id" value={post.id} />
                            <input type="hidden" name="status" value="published" />
                            <Button type="submit" size="sm" variant="default">通过</Button>
                          </form>
                          <form action={updatePostStatus}>
                            <input type="hidden" name="id" value={post.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <Button type="submit" size="sm" variant="destructive">拒绝</Button>
                          </form>
                        </>
                      ) : (
                        <form action={updatePostStatus} className="flex gap-1">
                          <input type="hidden" name="id" value={post.id} />
                          <select name="status" defaultValue={post.status} className="text-xs border rounded px-2 py-1">
                            <option value="published">已发布</option>
                            <option value="pending">待审核</option>
                            <option value="rejected">已拒绝</option>
                          </select>
                          <Button type="submit" size="sm" variant="outline">更新</Button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!posts?.length && <p className="text-muted-foreground text-center py-8">暂无内容</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
