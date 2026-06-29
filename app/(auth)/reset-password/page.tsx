'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)

  // 从 URL hash 中恢复 Supabase session（邮件链接带 access_token）
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    setReady(true)
  }, [supabase])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password.length < 6) {
      setStatus('error')
      setMessage('密码至少 6 位')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('两次输入的密码不一致')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setStatus('error')
      setMessage(error.message)
      return
    }

    setStatus('success')
    setMessage('密码重置成功，即将跳转到登录页')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>重置密码</CardTitle>
          <CardDescription>请设置新密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">新密码</Label>
              <Input id="password" name="password" type="password" minLength={6} required placeholder="至少 6 位" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" minLength={6} required placeholder="再次输入新密码" />
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

            <Button type="submit" className="w-full" disabled={loading || !ready}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存新密码'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
