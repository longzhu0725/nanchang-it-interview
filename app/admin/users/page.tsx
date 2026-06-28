import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Mail, Building2, CalendarDays, Shield, User, FileText, MessageCircle } from 'lucide-react'

async function updateUserRole(formData: FormData) {
  'use server'
  const supabase = createClient()
  const adminSupabase = createAdminClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const targetId = formData.get('id') as string
  const role = formData.get('role') as string

  if (!currentUser) redirect('/login')

  // 防止管理员误操作把自己降级，导致无法进入后台
  if (currentUser.id === targetId && role !== 'admin') {
    revalidatePath('/admin/users')
    return
  }

  await adminSupabase
    .from('profiles')
    .update({ role })
    .eq('id', targetId)

  revalidatePath('/admin/users')
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const keyword = searchParams.q?.trim() || ''

  let query = supabase
    .from('profiles')
    .select('id, email, nickname, company, city, role, created_at')
    .order('created_at', { ascending: false })

  if (keyword) {
    query = query.or(`email.ilike.%${keyword}%,nickname.ilike.%${keyword}%,company.ilike.%${keyword}%`)
  }

  const { data: users } = await query

  // 统计每个用户的发帖和提问数
  const userIds = users?.map((u) => u.id) || []
  const [{ data: postsCount }, { data: questionsCount }] = await Promise.all([
    supabase.from('posts').select('author_id').in('author_id', userIds),
    supabase.from('questions').select('author_id').in('author_id', userIds),
  ])

  const postCountMap = new Map<string, number>()
  postsCount?.forEach((p) => {
    postCountMap.set(p.author_id, (postCountMap.get(p.author_id) || 0) + 1)
  })

  const questionCountMap = new Map<string, number>()
  questionsCount?.forEach((q) => {
    questionCountMap.set(q.author_id, (questionCountMap.get(q.author_id) || 0) + 1)
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">用户管理</h2>
        <form action="/admin/users" method="GET" className="flex gap-2">
          <Input
            name="q"
            defaultValue={keyword}
            placeholder="搜索邮箱、昵称、公司..."
            className="w-full sm:w-64"
          />
          <Button type="submit" size="sm">搜索</Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表（共 {users?.length || 0} 人）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => {
              const isSelf = currentUser?.id === user.id
              return (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-base">
                          {user.nickname || '未设置昵称'}
                        </span>
                        {user.role === 'admin' ? (
                          <Badge className="bg-purple-600 hover:bg-purple-600">
                            <Shield className="h-3 w-3 mr-1" />
                            管理员
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <User className="h-3 w-3 mr-1" />
                            普通用户
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </span>
                        {user.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {user.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(user.created_at).toLocaleDateString('zh-CN')} 注册
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          面经/笔经 {postCountMap.get(user.id) || 0}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-3.5 w-3.5" />
                          问答 {questionCountMap.get(user.id) || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <form action={updateUserRole} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          disabled={isSelf}
                          className="text-sm border rounded-md px-2 py-1.5 bg-background disabled:opacity-50"
                        >
                          <option value="user">普通用户</option>
                          <option value="admin">管理员</option>
                        </select>
                        <Button type="submit" size="sm" variant="outline" disabled={isSelf}>
                          更新
                        </Button>
                      </form>
                    </div>
                  </div>
                  {isSelf && (
                    <p className="text-xs text-muted-foreground mt-2">
                      当前登录的管理员账号，不能降级自己的权限。
                    </p>
                  )}
                </div>
              )
            })}
            {!users?.length && (
              <p className="text-muted-foreground text-center py-8">未找到用户</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
