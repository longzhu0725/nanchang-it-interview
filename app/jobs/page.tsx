import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { category?: string; company?: string; q?: string }
}) {
  const supabase = createClient()
  let query = supabase
    .from('jobs')
    .select('*, companies(name)')

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.company) {
    query = query.eq('company_id', searchParams.company)
  }
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data: jobs } = await query.order('created_at', { ascending: false })

  const categories = ['前端', '后端', '测试', '产品', '运维', '算法', '其他']

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">南昌 IT 岗位</h1>
      <p className="text-muted-foreground mb-6">了解南昌本地 IT 岗位的面试流程和考察重点</p>
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer">全部</Badge>
        {categories.map((category) => (
          <Badge key={category} variant="outline" className="cursor-pointer">{category}</Badge>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs?.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4">
                <div className="font-medium mb-1">{job.title}</div>
                <p className="text-sm text-muted-foreground mb-2">
                  <Link href={`/companies/${job.company_id}`} className="hover:underline">
                    {job.companies?.name}
                  </Link>
                </p>
                <Badge variant="secondary">{job.category}</Badge>
                {job.interview_rounds && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{job.interview_rounds}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {!jobs?.length && (
        <div className="text-center py-12 text-muted-foreground">暂无岗位数据</div>
      )}
    </div>
  )
}
