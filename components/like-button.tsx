'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  targetType: 'post' | 'answer' | 'question'
  targetId: string
  initialLikes: number
  initialLiked?: boolean
}

export function LikeButton({
  targetType,
  targetId,
  initialLikes,
  initialLiked = false,
}: LikeButtonProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    // Optimistic UI update
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1))

    startTransition(async () => {
      try {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId }),
        })

        if (res.status === 401) {
          // Not logged in — revert and redirect to login
          setLiked(initialLiked)
          setLikesCount(initialLikes)
          router.push('/login')
          return
        }

        if (!res.ok) {
          // Revert optimistic update on error
          setLiked(initialLiked)
          setLikesCount(initialLikes)
          return
        }

        const data = await res.json()
        setLiked(data.liked)
        setLikesCount((prev) => {
          if (data.liked && !initialLiked) return initialLikes + 1
          if (!data.liked && initialLiked) return initialLikes - 1
          return prev
        })
        router.refresh()
      } catch {
        // Revert on network error
        setLiked(initialLiked)
        setLikesCount(initialLikes)
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn(liked && 'text-primary border-primary/50 bg-primary/5')}
    >
      <ThumbsUp
        className="h-4 w-4 mr-1"
        fill={liked ? 'currentColor' : 'none'}
      />
      {likesCount}
    </Button>
  )
}
