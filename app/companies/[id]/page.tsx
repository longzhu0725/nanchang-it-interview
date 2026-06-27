import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Users, FileText, MessageCircle } from 'lucide-react'

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', params.id)

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(nickname, company)')
    .eq('company_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('company_id', params.id)
    .in('status', ['published', 'resolved'])
    .order('created_at', { ascending: false })
    .limit(10)

  if (!company) {
    return <div className="container mx-auto px-4 py-8">企业不存在</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-start gap-4">
        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">{company.industry} · {company.size} · {company.city}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {(company.tags as string[])?.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>企业介绍</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{company.description || '暂无介绍'}</p>
        </CardContent>
      </Card>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />招聘岗位
          </h2>
        </div>
        <div className="grid gap-3">
          {jobs?.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <p className="text-sm text-muted-foreground">{job.category}</p>
                  </div>
                  <Button variant="ghost" size="sm">查看</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!jobs?.length && <p className="text-muted-foreground text-sm">暂无岗位信息</p>}
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />相关面经
          </h2>
          <Link href="/posts/new"><Button size="sm">分享面经</Button></Link>
        </div>
        <div className="grid gap-3">
          {posts?.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{post.type}</Badge>
                    <span className="font-medium">{post.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post.is_anonymous ? '匿名用户' : post.profiles?.nickname} · {post.profiles?.company}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!posts?.length && <p className="text-muted-foreground text-sm">暂无面经，快来分享第一篇吧</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />相关问答
          </h2>
          <Link href="/questions/new"><Button size="sm">提问</Button></Link>
        </div>
        <div className="grid gap-3">
          {questions?.map((question) => (
            <Link key={question.id} href={`/questions/${question.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-4 font-medium">{question.title}</CardContent>
              </Card>
            </Link>
          ))}
          {!questions?.length && <p className="text-muted-foreground text-sm">暂无问答</p>}
        </div>
      </section>
    </div>
  )
}
