'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ReportButtonProps {
  targetType: 'post' | 'question'
  targetId: string
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!reason.trim()) return

    startTransition(async () => {
      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId, reason: reason.trim() }),
        })

        if (res.status === 401) {
          setOpen(false)
          router.push('/login')
          return
        }

        if (!res.ok) {
          return
        }

        setSubmitted(true)
        // Close dialog after showing thank you message
        setTimeout(() => {
          setOpen(false)
          setSubmitted(false)
          setReason('')
        }, 2000)
        router.refresh()
      } catch {
        // Handle network error silently
      }
    })
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset state when closing
      setTimeout(() => {
        setSubmitted(false)
        setReason('')
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4 mr-1" />
            举报
          </Button>
        }
      />
      <DialogContent>
        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium">感谢您的举报</p>
            <p className="text-sm text-muted-foreground mt-1">
              我们会尽快处理您反馈的内容。
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>举报内容</DialogTitle>
              <DialogDescription>
                请说明举报原因，我们会认真审核处理。
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请描述举报原因..."
              rows={4}
              className="resize-none"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason.trim() || isPending}
              >
                {isPending ? '提交中...' : '提交举报'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
