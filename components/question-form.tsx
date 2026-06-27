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

export function QuestionForm({
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
    const res = await fetch('/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        title: formData.get('title'),
        content: formData.get('content'),
        company_id: formData.get('company_id') || null,
        job_id: formData.get('job_id') || null,
        is_anonymous: formData.get('is_anonymous') === 'on',
        tags: [],
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    setLoading(false)

    if (res.ok) {
      router.push('/questions')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || '提问失败')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div>
        <Label htmlFor="title">问题标题</Label>
        <Input id="title" name="title" required placeholder="例如：XX公司后端二面会问什么？" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_id">关联企业（可选）</Label>
          <Select name="company_id" defaultValue={defaultCompanyId} onValueChange={(val) => setSelectedCompany(val || '')}>
            <SelectTrigger><SelectValue placeholder="选择企业" /></SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="job_id">关联岗位（可选）</Label>
          <Select name="job_id" defaultValue={defaultJobId}>
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
        <Label htmlFor="content">问题详情</Label>
        <Textarea id="content" name="content" rows={8} required placeholder="详细描述你的问题（支持 Markdown 格式）..." />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="is_anonymous" name="is_anonymous" />
        <Label htmlFor="is_anonymous" className="text-sm text-muted-foreground">匿名提问</Label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? '提交中...' : '提交问题'}</Button>
    </form>
  )
}
