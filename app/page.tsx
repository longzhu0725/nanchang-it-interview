import { createClient } from '@/lib/supabase/server'
import { SearchBox } from '@/components/search-box'
import { PostCard } from '@/components/post-card'
import { QuestionCard } from '@/components/question-card'
import { CompanyCard } from '@/components/company-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, FileText, MessageCircle, Users } from 'lucide-react'

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
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">南昌 IT 面经圈</h1>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          提前了解本地企业笔试面试，分享真实经验，互助前行
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBox />
        </div>
      </section>

      <section className="mb-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-medium">{companies?.length || 0}+</p>
          <p className="text-sm text-muted-foreground">本地企业</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-medium">{posts?.length || 0}+</p>
          <p className="text-sm text-muted-foreground">面经笔经</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-medium">{questions?.length || 0}+</p>
          <p className="text-sm text-muted-foreground">问答</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-medium">公益</p>
          <p className="text-sm text-muted-foreground">互助平台</p>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">热门企业</h2>
          <Link href="/companies">
            <Button variant="ghost" size="sm">查看全部</Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies?.map((company) => <CompanyCard key={company.id} company={company} />)}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最新面经</h2>
          <Link href="/posts">
            <Button variant="ghost" size="sm">查看更多</Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最新问答</h2>
          <Link href="/questions">
            <Button variant="ghost" size="sm">查看更多</Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions?.map((question) => <QuestionCard key={question.id} question={question} />)}
        </div>
      </section>
    </div>
  )
}
