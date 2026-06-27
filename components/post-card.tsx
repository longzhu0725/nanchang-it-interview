import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, ThumbsUp, Star } from 'lucide-react'
import type { Post } from '@/types/database'

export function PostCard({ post }: { post: Post & { companies?: { name: string } | null; jobs?: { title: string } | null } }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={post.type === '面经' ? 'default' : 'secondary'}>{post.type}</Badge>
            {post.difficulty && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <Star className="h-3 w-3 fill-yellow-500" />
                {post.difficulty}/5
              </div>
            )}
          </div>
          <h3 className="font-medium line-clamp-2 mb-2">{post.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {post.companies?.name && (
              <Badge variant="outline" className="text-xs">{post.companies.name}</Badge>
            )}
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
            <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
            {post.is_anonymous ? (
              <span className="text-muted-foreground">匿名用户</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
