import { createClient } from '@/lib/supabase/server'
import { QuestionCard } from '@/components/question-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  let query = supabase
    .from('questions')
    .select(`
      *,
      answers:answers(count)
    `)
    .in('status', ['published', 'resolved'])

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,content.ilike.%${searchParams.q}%`)
  }

  const { data: questions } = await query.order('created_at', { ascending: false })

  // 处理answer_count
  const questionsWithAnswerCount = questions?.map(q => ({
    ...q,
    answer_count: q.answers?.[0]?.count || 0
  })) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">问答社区</h1>
          <p className="text-muted-foreground text-sm mt-1">有问题？在这里提问，大家一起帮忙解答</p>
        </div>
        <Link href="/questions/new"><Button>提问</Button></Link>
      </div>
      <form action="/questions" method="get" className="mb-6 max-w-md">
        <Input
          name="q"
          placeholder="搜索问题..."
          defaultValue={searchParams.q || ''}
        />
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {questionsWithAnswerCount?.map((question) => <QuestionCard key={question.id} question={question} />)}
      </div>
      {!questionsWithAnswerCount?.length && (
        <div className="text-center py-12 text-muted-foreground">
          暂无问题，<Link href="/questions/new" className="text-primary hover:underline">提出第一个问题</Link>
        </div>
      )}
    </div>
  )
}
