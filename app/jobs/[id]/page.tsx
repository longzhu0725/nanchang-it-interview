import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('*, companies(*)')
    .eq('id', params.id)
    .single()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('job_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('job_id', params.id)
    .in('status', ['published', 'resolved'])
    .order('created_at', { ascending: false })

  if (!job) {
    return <div className="container mx-auto px-4 py-8">岗位不存在</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <Link href={`/companies/${job.company_id}`} className="text-muted-foreground hover:underline">
          {job.companies?.name}
        </Link>
        <Badge variant="secondary" className="ml-2">{job.category}</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>岗位介绍</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{job.description || '暂无介绍'}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>面试轮次</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{job.interview_rounds || '暂无信息'}</p>
        </CardContent>
      </Card>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">相关面经</h2>
          <Link href={`/posts/new?job=${job.id}`}><Button size="sm">分享面经</Button></Link>
        </div>
        {posts?.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <Card className="mb-2 hover:bg-muted/50">
              <CardContent className="py-3 flex items-center justify-between">
                <span className="font-medium">{post.title}</span>
                <Badge>{post.type}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
        {!posts?.length && <p className="text-muted-foreground text-sm">暂无相关面经</p>}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">相关问答</h2>
          <Link href={`/questions/new?job=${job.id}`}><Button size="sm">提问</Button></Link>
        </div>
        {questions?.map((question) => (
          <Link key={question.id} href={`/questions/${question.id}`}>
            <Card className="mb-2 hover:bg-muted/50">
              <CardContent className="py-3 font-medium">{question.title}</CardContent>
            </Card>
          </Link>
        ))}
        {!questions?.length && <p className="text-muted-foreground text-sm">暂无相关问答</p>}
      </section>
    </div>
  )
}
