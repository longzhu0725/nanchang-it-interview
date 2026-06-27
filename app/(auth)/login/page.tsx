'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const registered = searchParams.get('registered')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录本地 IT 面经圈</CardTitle>
          <CardDescription>南昌 IT 求职者互助平台</CardDescription>
        </CardHeader>
        <CardContent>
          {registered && (
            <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
              注册成功！请登录。
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              没有账号？<Link href="/register" className="text-primary hover:underline">注册</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
