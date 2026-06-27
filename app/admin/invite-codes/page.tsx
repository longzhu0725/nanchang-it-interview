'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminInviteCodesPage() {
  const [codes, setCodes] = useState<string[]>([])
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)

  async function generateCodes() {
    setLoading(true)
    const res = await fetch('/api/admin/invite-codes', {
      method: 'POST',
      body: JSON.stringify({ count }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json() as { code: string }[]
    setCodes(data.map((item) => item.code))
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">邀请码管理</h2>
      <Card className="mb-6">
        <CardHeader><CardTitle>生成邀请码</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-32"
          />
          <Button onClick={generateCodes} disabled={loading}>
            {loading ? '生成中...' : '生成邀请码'}
          </Button>
        </CardContent>
      </Card>
      {codes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>新生成的邀请码</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {codes.map((code) => (
                <li key={code} className="font-mono bg-muted p-3 rounded text-center sm:text-left">
                  {code}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-4">请及时复制保存，关闭页面后将无法再次查看这些邀请码。</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
