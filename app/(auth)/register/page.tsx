'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

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
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">创建账户</h1>
          <p className="mt-1 text-sm text-muted-foreground">加入南昌 IT 面经圈，分享真实经验</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" name="password" type="password" minLength={6} required placeholder="至少 6 位" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input id="nickname" name="nickname" required placeholder="你的显示名称" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">所在公司 <span className="text-muted-foreground font-normal text-xs">(选填)</span></Label>
                <Input id="company" name="company" placeholder="如：腾讯、华为、学生、待业、自由职业" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteCode">邀请码</Label>
                <Input id="inviteCode" name="inviteCode" required placeholder="请输入邀请码" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          已有账号？
          <Link href="/login" className="ml-1 font-medium text-foreground hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
