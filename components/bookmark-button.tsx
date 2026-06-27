'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked?: boolean
}

export function BookmarkButton({
  postId,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    // Optimistic UI update
    const newBookmarked = !bookmarked
    setBookmarked(newBookmarked)

    startTransition(async () => {
      try {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })

        if (res.status === 401) {
          // Not logged in — revert and redirect to login
          setBookmarked(initialBookmarked)
          router.push('/login')
          return
        }

        if (!res.ok) {
          // Revert optimistic update on error
          setBookmarked(initialBookmarked)
          return
        }

        const data = await res.json()
        setBookmarked(data.bookmarked)
        router.refresh()
      } catch {
        // Revert on network error
        setBookmarked(initialBookmarked)
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn(bookmarked && 'text-yellow-600 border-yellow-500/50 bg-yellow-50')}
    >
      <Bookmark
        className="h-4 w-4 mr-1"
        fill={bookmarked ? 'currentColor' : 'none'}
      />
      {bookmarked ? '已收藏' : '收藏'}
    </Button>
  )
}
