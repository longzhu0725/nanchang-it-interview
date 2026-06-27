'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyPage() {
  const email = useSearchParams().get('email')

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>请验证邮箱</CardTitle>
          <CardDescription>完成验证后即可登录</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            我们已向 <span className="font-medium">{email}</span> 发送验证邮件，请点击邮件中的链接完成验证后登录。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
