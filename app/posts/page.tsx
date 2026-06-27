import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/post-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string }
}) {
  const supabase = createClient()
  let query = supabase
    .from('posts')
    .select('*, companies(name), jobs(title)')
    .eq('status', 'published')

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,content.ilike.%${searchParams.q}%`)
  }
  if (searchParams.type) {
    query = query.eq('type', searchParams.type)
  }

  const { data: posts } = await query.order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">面经/笔经</h1>
          <p className="text-muted-foreground text-sm mt-1">分享真实面试笔试经历，帮助更多人</p>
        </div>
        <Link href="/posts/new"><Button>分享面经</Button></Link>
      </div>
      <form action="/posts" method="get" className="mb-6 max-w-md">
        <Input
          name="q"
          placeholder="搜索面经..."
          defaultValue={searchParams.q || ''}
        />
      </form>
      <div className="mb-6 flex gap-2">
        <Link href="/posts">
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer',
              !searchParams.type && 'border-primary text-primary bg-primary/5'
            )}
          >
            全部
          </Badge>
        </Link>
        <Link href="/posts?type=面经">
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer',
              searchParams.type === '面经' && 'border-primary text-primary bg-primary/5'
            )}
          >
            面经
          </Badge>
        </Link>
        <Link href="/posts?type=笔经">
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer',
              searchParams.type === '笔经' && 'border-primary text-primary bg-primary/5'
            )}
          >
            笔经
          </Badge>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
      {!posts?.length && (
        <div className="text-center py-12 text-muted-foreground">
          暂无面经，<Link href="/posts/new" className="text-primary hover:underline">分享第一篇</Link>
        </div>
      )}
    </div>
  )
}
