import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function createJob(formData: FormData) {
  'use server'
  const supabase = createClient()
  const company_id = formData.get('company_id') as string
  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const interview_rounds = formData.get('interview_rounds') as string
  const tagsStr = formData.get('tags') as string

  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []

  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('jobs').insert({
    company_id,
    title,
    category,
    description,
    interview_rounds,
    tags,
    created_by: user?.id,
  })

  revalidatePath('/admin/jobs')
  redirect('/admin/jobs')
}

async function deleteJob(formData: FormData) {
  'use server'
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('jobs').delete().eq('id', id)
  revalidatePath('/admin/jobs')
}

export default async function AdminJobsPage() {
  const supabase = createClient()

  // Fetch all jobs with company info
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, companies(name)')
    .order('created_at', { ascending: false })

  // Fetch published companies for the select dropdown
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('status', 'published')
    .order('name', { ascending: true })

  const categoryMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    '技术': { label: '技术', variant: 'default' },
    '产品': { label: '产品', variant: 'secondary' },
    '设计': { label: '设计', variant: 'outline' },
    '运营': { label: '运营', variant: 'outline' },
    '市场': { label: '市场', variant: 'outline' },
    '其他': { label: '其他', variant: 'outline' },
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">岗位管理</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新增岗位</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createJob} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_id">所属企业 *</Label>
                <select
                  id="company_id"
                  name="company_id"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">请选择企业</option>
                  {companies?.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">岗位名称 *</Label>
                <Input id="title" name="title" required placeholder="如：Java开发工程师" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">岗位类别 *</Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">请选择类别</option>
                  <option value="技术">技术</option>
                  <option value="产品">产品</option>
                  <option value="设计">设计</option>
                  <option value="运营">运营</option>
                  <option value="市场">市场</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview_rounds">面试轮次</Label>
                <Input id="interview_rounds" name="interview_rounds" placeholder="如：3轮技术面+1轮HR面" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">岗位描述</Label>
              <Input id="description" name="description" placeholder="请输入岗位描述和要求" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">标签（逗号分隔）</Label>
              <Input id="tags" name="tags" placeholder="如：Java, Spring, 微服务" />
            </div>
            <Button type="submit">创建岗位</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>岗位列表（共 {jobs?.length || 0} 个）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs?.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{job.title}</p>
                      <Badge variant={categoryMap[job.category]?.variant || 'outline'}>
                        {job.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {job.companies?.name || '未知企业'}
                      {job.interview_rounds && ` · ${job.interview_rounds}`}
                    </p>
                    {job.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.description}</p>
                    )}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {job.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      创建时间: {new Date(job.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={deleteJob}>
                      <input type="hidden" name="id" value={job.id} />
                      <Button type="submit" size="sm" variant="destructive">删除</Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
            {!jobs?.length && (
              <p className="text-muted-foreground text-center py-8">暂无岗位</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
