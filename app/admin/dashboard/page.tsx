import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Total published companies
  const { count: publishedCompanyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Total posts
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  // Total questions
  const { count: questionCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })

  // Total users
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Pending posts
  const { count: pendingPostCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Pending questions
  const { count: pendingQuestionCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Pending companies
  const { count: pendingCompanyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Recent posts (latest 5)
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, type, status, created_at, profiles(nickname)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent questions (latest 5)
  const { data: recentQuestions } = await supabase
    .from('questions')
    .select('id, title, status, created_at, profiles(nickname)')
    .order('created_at', { ascending: false })
    .limit(5)

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    published: { label: '已发布', variant: 'default' },
    pending: { label: '待审核', variant: 'secondary' },
    rejected: { label: '已拒绝', variant: 'destructive' },
    resolved: { label: '已解决', variant: 'default' },
  }

  // Combine recent activity
  type ActivityItem = {
    id: string
    title: string
    type: 'post' | 'question'
    typeLabel: string
    status: string
    author: string
    created_at: string
    href: string
  }

  type PostActivity = { id: string; title: string; type: string; status: string; profiles: { nickname: string | null } | null; created_at: string }
  type QuestionActivity = { id: string; title: string; status: string; profiles: { nickname: string | null } | null; created_at: string }

  const recentPostsTyped = recentPosts as PostActivity[] | null
  const recentQuestionsTyped = recentQuestions as QuestionActivity[] | null

  const recentActivity: ActivityItem[] = [
    ...(recentPostsTyped?.map((p) => ({
      id: p.id,
      title: p.title,
      type: 'post' as const,
      typeLabel: p.type || '帖子',
      status: p.status,
      author: p.profiles?.nickname || '匿名',
      created_at: p.created_at,
      href: `/posts/${p.id}`,
    })) || []),
    ...(recentQuestionsTyped?.map((q) => ({
      id: q.id,
      title: q.title,
      type: 'question' as const,
      typeLabel: '问答',
      status: q.status,
      author: q.profiles?.nickname || '匿名',
      created_at: q.created_at,
      href: `/questions/${q.id}`,
    })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">数据概览</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">已发布企业</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{publishedCompanyCount || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">帖子总数</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{postCount || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">问答总数</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{questionCount || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">用户总数</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{userCount || 0}</p></CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">待处理事项</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/posts">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">待审核帖子</CardTitle></CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${(pendingPostCount || 0) > 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                {pendingPostCount || 0}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/questions">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">待审核问答</CardTitle></CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${(pendingQuestionCount || 0) > 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                {pendingQuestionCount || 0}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/companies">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">待审核企业</CardTitle></CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${(pendingCompanyCount || 0) > 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                {pendingCompanyCount || 0}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">最近动态</h2>
      <Card>
        <CardHeader>
          <CardTitle>最新内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 border-b last:border-0 pb-3 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={item.href} className="font-medium hover:underline truncate block">
                      {item.title}
                    </Link>
                    <Badge variant="outline" className="text-xs shrink-0">{item.typeLabel}</Badge>
                    <Badge variant={statusMap[item.status]?.variant || 'outline'} className="text-xs shrink-0">
                      {statusMap[item.status]?.label || item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.author} · {new Date(item.created_at).toLocaleDateString('zh-CN')} {new Date(item.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-muted-foreground text-center py-4">暂无动态</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
