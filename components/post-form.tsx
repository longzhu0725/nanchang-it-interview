'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { Company, Job } from '@/types/database'

export function PostForm({
  companies,
  jobs,
  defaultCompanyId,
  defaultJobId,
}: {
  companies: Company[]
  jobs: Job[]
  defaultCompanyId?: string
  defaultJobId?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(defaultCompanyId || '')
  const [error, setError] = useState('')

  const filteredJobs = selectedCompany
    ? jobs.filter((job) => job.company_id === selectedCompany)
    : jobs

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        company_id: formData.get('company_id'),
        job_id: formData.get('job_id'),
        difficulty: formData.get('difficulty') ? Number(formData.get('difficulty')) : null,
        is_anonymous: formData.get('is_anonymous') === 'on',
        tags: [],
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    setLoading(false)

    if (res.ok) {
      router.push('/posts')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || '发布失败')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div>
        <Label htmlFor="title">标题</Label>
        <Input id="title" name="title" required placeholder="一句话概括你的面试/笔试经历" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">类型</Label>
          <Select name="type" defaultValue="面经" required>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="面经">面经</SelectItem>
              <SelectItem value="笔经">笔经</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="difficulty">难度（1-5）</Label>
          <Input id="difficulty" name="difficulty" type="number" min={1} max={5} placeholder="3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_id">企业</Label>
          <Select name="company_id" defaultValue={defaultCompanyId} onValueChange={(val) => setSelectedCompany(val || '')} required>
            <SelectTrigger><SelectValue placeholder="选择企业" /></SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="job_id">岗位</Label>
          <Select name="job_id" defaultValue={defaultJobId} required>
            <SelectTrigger><SelectValue placeholder="选择岗位" /></SelectTrigger>
            <SelectContent>
              {filteredJobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="content">内容</Label>
        <Textarea id="content" name="content" rows={12} required placeholder="详细描述你的笔试/面试经历，包括流程、题目、注意事项等（支持 Markdown 格式）..." />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="is_anonymous" name="is_anonymous" />
        <Label htmlFor="is_anonymous" className="text-sm text-muted-foreground">匿名发布（不显示昵称和公司）</Label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? '发布中...' : '发布'}</Button>
    </form>
  )
}
