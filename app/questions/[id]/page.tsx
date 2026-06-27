import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LikeButton } from '@/components/like-button'
import { ReportButton } from '@/components/report-button'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { CheckCircle2, MessageCircle, User as UserIcon } from 'lucide-react'

async function submitAnswer(formData: FormData) {
  'use server'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const questionId = formData.get('question_id') as string
  const content = formData.get('content') as string

  await supabase.from('answers').insert({
    question_id: questionId,
    content,
    author_id: user.id,
  })

  revalidatePath(`/questions/${questionId}`)
}

export default async function QuestionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: question } = await supabase
    .from('questions')
    .select('*, companies(name), jobs(title), profiles(nickname, company)')
    .eq('id', params.id)
    .single()

  const { data: answers } = await supabase
    .from('answers')
    .select('*, profiles(nickname, company)')
    .eq('question_id', params.id)
    .order('is_best', { ascending: false })
    .order('likes', { ascending: false })
    .order('created_at', { ascending: true })

  // Check which answers the current user has liked
  const likedAnswerIds = new Set<string>()
  if (user && answers && answers.length > 0) {
    const answerIds = answers.map((a) => a.id)
    const { data: userLikes } = await supabase
      .from('likes')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('target_type', 'answer')
      .in('target_id', answerIds)
    if (userLikes) {
      userLikes.forEach((like: { target_id: string }) => likedAnswerIds.add(like.target_id))
    }
  }

  if (!question) {
    return <div className="container mx-auto px-4 py-8">问题不存在</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {question.status === 'resolved' && (
            <Badge className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />已解决
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">{question.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            {question.is_anonymous ? '匿名用户' : question.profiles?.nickname}
          </span>
          {question.companies?.name && (
            <Link href={`/companies/${question.company_id}`} className="hover:underline">
              {question.companies.name}
            </Link>
          )}
          {question.jobs?.title && (
            <Link href={`/jobs/${question.job_id}`} className="hover:underline">
              {question.jobs.title}
            </Link>
          )}
          <span>{new Date(question.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
        <div className="mt-3">
          <ReportButton targetType="question" targetId={question.id} />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <MarkdownRenderer content={question.content} />
        </CardContent>
      </Card>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          回答 ({answers?.length || 0})
        </h2>
        <div className="space-y-4">
          {answers?.map((answer) => (
            <Card key={answer.id} className={answer.is_best ? 'border-green-500 bg-green-50/50' : ''}>
              <CardContent className="pt-4">
                {answer.is_best && (
                  <Badge className="bg-green-600 mb-2">
                    <CheckCircle2 className="h-3 w-3 mr-1" />最佳答案
                  </Badge>
                )}
                <div className="mb-3">
                  <MarkdownRenderer content={answer.content} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {answer.is_anonymous ? '匿名用户' : answer.profiles?.nickname}
                    {!answer.is_anonymous && answer.profiles?.company && ` (${answer.profiles.company})`}
                    {' · '}
                    {new Date(answer.created_at).toLocaleDateString('zh-CN')}
                  </p>
                  <LikeButton
                    targetType="answer"
                    targetId={answer.id}
                    initialLikes={answer.likes || 0}
                    initialLiked={likedAnswerIds.has(answer.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {!answers?.length && (
            <p className="text-muted-foreground text-center py-8">暂无回答，快来第一个回答吧</p>
          )}
        </div>
      </section>

      {user ? (
        <Card>
          <CardHeader><CardTitle className="text-lg">我要回答</CardTitle></CardHeader>
          <CardContent>
            <form action={submitAnswer} className="space-y-3">
              <input type="hidden" name="question_id" value={question.id} />
              <Textarea name="content" rows={5} placeholder="写下你的回答（支持 Markdown 格式）..." required />
              <Button type="submit">提交回答</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">登录</Link>后才能回答问题
          </CardContent>
        </Card>
      )}
    </div>
  )
}
