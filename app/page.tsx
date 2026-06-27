import { createClient } from '@/lib/supabase/server'
import { SearchBox } from '@/components/search-box'
import { PostCard } from '@/components/post-card'
import { QuestionCard } from '@/components/question-card'
import { CompanyCard } from '@/components/company-card'
import Link from 'next/link'
import { Building2, FileText, MessageCircle, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()

  // 并行查询：最新列表 + 真实总数
  const [
    { count: companiesCount },
    { count: postsCount },
    { count: questionsCount },
    { data: posts },
    { data: questions },
    { data: companies }
  ] = await Promise.all([
    // 企业总数
    supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    // 面经总数
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    // 问答总数（包含已解决的）
    supabase.from('questions').select('*', { count: 'exact', head: true }).in('status', ['published', 'resolved']),
    // 最新面经6条
    supabase
      .from('posts')
      .select('*, companies(name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6),
    // 最新问答6条（包含已解决）
    supabase
      .from('questions')
      .select(`
        *,
        answers:answers(count)
      `)
      .in('status', ['published', 'resolved'])
      .order('created_at', { ascending: false })
      .limit(6),
    // 热门企业6条（按创建时间）
    supabase
      .from('companies')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6)
  ])

  // 处理问答数据，提取answer_count
  const questionsWithAnswerCount = questions?.map(q => ({
    ...q,
    answer_count: q.answers?.[0]?.count || 0
  })) || []

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          南昌 IT 求职者互助公益平台
        </div>
        <h1 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          提前了解本地企业<span className="text-muted-foreground">笔试面试</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          分享真实经验，互助前行，让求职路上不再信息不对称
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <SearchBox />
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16">
        <div className="flex items-center justify-center gap-8 border-y border-border/60 py-6 text-center sm:gap-16">
          <div>
            <p className="text-lg font-semibold tracking-tight">{companiesCount || 0}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">本地企业</p>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div>
            <p className="text-lg font-semibold tracking-tight">{postsCount || 0}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">面经笔经</p>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div>
            <p className="text-lg font-semibold tracking-tight">{questionsCount || 0}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">真实问答</p>
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="mb-16">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />企业
            </div>
            <h2 className="text-lg font-semibold tracking-tight">热门企业</h2>
          </div>
          <Link href="/companies" className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            查看全部 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies?.map((company) => <CompanyCard key={company.id} company={company} />)}
        </div>
      </section>

      {/* Posts */}
      <section className="mb-16">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />面经
            </div>
            <h2 className="text-lg font-semibold tracking-tight">最新面经</h2>
          </div>
          <Link href="/posts" className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            查看更多 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </section>

      {/* Questions */}
      <section className="mb-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />问答
            </div>
            <h2 className="text-lg font-semibold tracking-tight">最新问答</h2>
          </div>
          <Link href="/questions" className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            查看更多 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {questionsWithAnswerCount?.map((question) => <QuestionCard key={question.id} question={question} />)}
        </div>
      </section>
    </div>
  )
}
