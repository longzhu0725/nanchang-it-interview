import { createClient } from '@/lib/supabase/server'
import { CompanyCard } from '@/components/company-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { q?: string; industry?: string }
}) {
  const supabase = createClient()
  let query = supabase
    .from('companies')
    .select('*')
    .eq('status', 'published')
    .eq('city', '南昌')

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }
  if (searchParams.industry) {
    query = query.eq('industry', searchParams.industry)
  }

  const { data: companies } = await query.order('name')

  const industries = ['互联网', '软件开发', '系统集成', 'IT服务', '企业软件', '运营商IT']

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">南昌 IT 企业</h1>
      <p className="text-muted-foreground mb-6">了解南昌本地 IT 企业信息和招聘流程</p>
      <form action="/companies" method="get" className="mb-6 max-w-md">
        <Input
          name="q"
          placeholder="搜索企业名称..."
          defaultValue={searchParams.q || ''}
        />
      </form>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/companies">
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer',
              !searchParams.industry && 'border-primary text-primary bg-primary/5'
            )}
          >
            全部
          </Badge>
        </Link>
        {industries.map((industry) => (
          <Link key={industry} href={`/companies?industry=${encodeURIComponent(industry)}`}>
            <Badge
              variant="outline"
              className={cn(
                'cursor-pointer',
                searchParams.industry === industry && 'border-primary text-primary bg-primary/5'
              )}
            >
              {industry}
            </Badge>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies?.map((company) => <CompanyCard key={company.id} company={company} />)}
      </div>
      {!companies?.length && (
        <div className="text-center py-12 text-muted-foreground">
          暂无企业数据
        </div>
      )}
    </div>
  )
}
