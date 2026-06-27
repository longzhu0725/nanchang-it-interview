import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

async function updateQuestionStatus(formData: FormData) {
  'use server'
  const supabase = createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await supabase.from('questions').update({ status }).eq('id', id)
  revalidatePath('/admin/questions')
}

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const statusFilter = searchParams?.status

  let query = supabase
    .from('questions')
    .select('*, profiles(nickname)')
    .order('created_at', { ascending: false })

  if (statusFilter && ['pending', 'published', 'resolved', 'rejected'].includes(statusFilter)) {
    query = query.eq('status', statusFilter)
  }

  const { data: questions } = await query

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    published: { label: '已发布', variant: 'default' },
    pending: { label: '待审核', variant: 'secondary' },
    resolved: { label: '已解决', variant: 'default' },
    rejected: { label: '已拒绝', variant: 'destructive' },
  }

  const filters = [
    { key: undefined, label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'published', label: '已发布' },
    { key: 'resolved', label: '已解决' },
    { key: 'rejected', label: '已拒绝' },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">问答管理</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.key || 'all'}
            href={f.key ? `/admin/questions?status=${f.key}` : '/admin/questions'}
          >
            <Button
              variant={statusFilter === f.key || (!statusFilter && !f.key) ? 'default' : 'outline'}
              size="sm"
            >
              {f.label}
            </Button>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>问题列表（共 {questions?.length || 0} 条）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions?.map((question) => (
              <Card key={question.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/questions/${question.id}`} className="font-medium hover:underline block">
                        {question.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {question.content}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {question.profiles?.nickname || '匿名用户'} · {new Date(question.created_at).toLocaleDateString('zh-CN')}
                      </p>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {question.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusMap[question.status]?.variant || 'outline'}>
                        {statusMap[question.status]?.label || question.status}
                      </Badge>
                      {question.status === 'pending' ? (
                        <>
                          <form action={updateQuestionStatus}>
                            <input type="hidden" name="id" value={question.id} />
                            <input type="hidden" name="status" value="published" />
                            <Button type="submit" size="sm" variant="default">通过</Button>
                          </form>
                          <form action={updateQuestionStatus}>
                            <input type="hidden" name="id" value={question.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <Button type="submit" size="sm" variant="destructive">拒绝</Button>
                          </form>
                        </>
                      ) : (
                        <form action={updateQuestionStatus} className="flex gap-1">
                          <input type="hidden" name="id" value={question.id} />
                          <select name="status" defaultValue={question.status} className="text-xs border rounded px-2 py-1">
                            <option value="published">已发布</option>
                            <option value="pending">待审核</option>
                            <option value="resolved">已解决</option>
                            <option value="rejected">已拒绝</option>
                          </select>
                          <Button type="submit" size="sm" variant="outline">更新</Button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!questions?.length && (
              <p className="text-muted-foreground text-center py-8">暂无问题</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
