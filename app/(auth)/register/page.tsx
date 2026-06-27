'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        nickname: formData.get('nickname'),
        company: formData.get('company'),
        inviteCode: formData.get('inviteCode'),
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || '注册失败')
      return
    }

    router.push('/login?registered=1')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册本地 IT 面经圈</CardTitle>
          <CardDescription>南昌 IT 求职者互助平台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" name="email" type="email" required placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input id="password" name="password" type="password" minLength={6} required placeholder="至少6位" />
            </div>
            <div>
              <Label htmlFor="nickname">昵称</Label>
              <Input id="nickname" name="nickname" required placeholder="显示名称" />
            </div>
            <div>
              <Label htmlFor="company">真实公司名称</Label>
              <Input id="company" name="company" required placeholder="用于可信度背书" />
            </div>
            <div>
              <Label htmlFor="inviteCode">邀请码</Label>
              <Input id="inviteCode" name="inviteCode" required placeholder="输入邀请码" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账号？<Link href="/login" className="text-primary hover:underline">登录</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
