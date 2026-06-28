import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function createCompany(formData: FormData) {
  'use server'
  const supabase = createClient()
  const name = formData.get('name') as string
  const industry = formData.get('industry') as string
  const size = formData.get('size') as string
  const description = formData.get('description') as string
  const tagsStr = formData.get('tags') as string
  const city = formData.get('city') as string

  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []

  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('companies').insert({
    name,
    industry,
    size,
    description,
    tags,
    city: city || null,
    status: 'published',
    created_by: user?.id,
  })

  revalidatePath('/admin/companies')
  redirect('/admin/companies')
}

async function updateCompanyStatus(formData: FormData) {
  'use server'
  const supabase = createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await supabase.from('companies').update({ status }).eq('id', id)
  revalidatePath('/admin/companies')
}

export default async function AdminCompaniesPage() {
  const supabase = createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    published: { label: '已发布', variant: 'default' },
    pending: { label: '待审核', variant: 'secondary' },
    rejected: { label: '已拒绝', variant: 'destructive' },
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">企业管理</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新增企业</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCompany} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">企业名称 *</Label>
                <Input id="name" name="name" required placeholder="请输入企业名称" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Input id="city" name="city" placeholder="请输入城市，如：南昌" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">行业</Label>
                <Input id="industry" name="industry" placeholder="如：互联网、企业软件" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">规模</Label>
                <Input id="size" name="size" placeholder="如：15-50人、150-500人、500人以上" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">企业描述</Label>
              <Input id="description" name="description" placeholder="请输入企业描述" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">标签（逗号分隔）</Label>
              <Input id="tags" name="tags" placeholder="如：Java, React, 云计算" />
            </div>
            <Button type="submit">创建企业</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>企业列表（共 {companies?.length || 0} 家）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companies?.map((company) => (
              <div key={company.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{company.name}</p>
                      <Badge variant={statusMap[company.status]?.variant || 'outline'}>
                        {statusMap[company.status]?.label || company.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {company.industry || '未设置行业'} · {company.size || '未设置规模'} · {company.city || '未设置城市'}
                    </p>
                    {company.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{company.description}</p>
                    )}
                    {company.tags && company.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {company.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      创建时间: {new Date(company.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {company.status === 'pending' && (
                      <>
                        <form action={updateCompanyStatus}>
                          <input type="hidden" name="id" value={company.id} />
                          <input type="hidden" name="status" value="published" />
                          <Button type="submit" size="sm" variant="default">通过</Button>
                        </form>
                        <form action={updateCompanyStatus}>
                          <input type="hidden" name="id" value={company.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <Button type="submit" size="sm" variant="destructive">拒绝</Button>
                        </form>
                      </>
                    )}
                    {company.status !== 'pending' && (
                      <form action={updateCompanyStatus} className="flex gap-1">
                        <input type="hidden" name="id" value={company.id} />
                        <select name="status" defaultValue={company.status} className="text-xs border rounded px-2 py-1">
                          <option value="published">已发布</option>
                          <option value="pending">待审核</option>
                          <option value="rejected">已拒绝</option>
                        </select>
                        <Button type="submit" size="sm" variant="outline">更新</Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!companies?.length && (
              <p className="text-muted-foreground text-center py-8">暂无企业</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
