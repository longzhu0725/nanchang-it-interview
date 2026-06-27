import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, ThumbsUp, Star } from 'lucide-react'
import type { Post } from '@/types/database'

export function PostCard({ post }: { post: Post & { companies?: { name: string } | null; jobs?: { title: string } | null } }) {
  return (
    <Link href={`/posts/${post.id}`} className="block h-full">
      <Card className="h-full cursor-pointer">
        <CardContent className="py-4">
          <div className="mb-2.5 flex items-center gap-2">
            <Badge
              variant={post.type === '面经' ? 'default' : 'secondary'}
              className="font-normal"
            >
              {post.type}
            </Badge>
            {post.difficulty && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {post.difficulty}/5
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug tracking-tight text-foreground">
            {post.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.content}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {post.companies?.name && (
              <span className="text-foreground/70">{post.companies.name}</span>
            )}
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
            <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.likes}</span>
            {post.is_anonymous && (
              <span className="text-muted-foreground/80">匿名</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
