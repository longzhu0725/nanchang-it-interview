import { createClient } from '@/lib/supabase/server'
import { SearchBox } from '@/components/search-box'
import { PostCard } from '@/components/post-card'
import { QuestionCard } from '@/components/question-card'
import { CompanyCard } from '@/components/company-card'
import Link from 'next/link'
import { Building2, FileText, MessageCircle, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, companies(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('status', 'published')
    .limit(6)

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

      {/* Stats - minimal inline */}
      <section className="mb-16">
        <div className="flex items-center justify-center gap-8 border-y border-border/60 py-6 text-center sm:gap-16">
          <div>
            <p className="text-lg font-semibold tracking-tight">{companies?.length || 0}+</p>
            <p className="mt-0.5 text-xs text-muted-foreground">本地企业</p>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div>
            <p className="text-lg font-semibold tracking-tight">{posts?.length || 0}+</p>
            <p className="mt-0.5 text-xs text-muted-foreground">面经笔经</p>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div>
            <p className="text-lg font-semibold tracking-tight">{questions?.length || 0}+</p>
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
          {questions?.map((question) => <QuestionCard key={question.id} question={question} />)}
        </div>
      </section>
    </div>
  )
}
