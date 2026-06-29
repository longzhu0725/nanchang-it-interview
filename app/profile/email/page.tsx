'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ChangeEmailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const newEmail = formData.get('newEmail') as string
    const password = formData.get('password') as string

    const res = await fetch('/api/auth/email', {
      method: 'PUT',
      body: JSON.stringify({ newEmail, password }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setStatus('error')
      setMessage(data.error || '修改失败')
      return
    }

    setStatus('success')
    setMessage(data.message || '已发送新邮箱确认邮件')
    setTimeout(() => router.push('/profile'), 2000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回用户中心
        </Link>
      </div>

      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>修改邮箱</CardTitle>
            <CardDescription>变更后需要点击新邮箱收到的确认链接完成换绑</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">新邮箱</Label>
                <Input id="newEmail" name="newEmail" type="email" required placeholder="new-email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">当前密码</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              {status === 'success' && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发送中...
                  </>
                ) : (
                  '确认修改'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
