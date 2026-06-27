import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, MessageCircle, CheckCircle2 } from 'lucide-react'
import type { Question } from '@/types/database'

export function QuestionCard({ question }: { question: Question & { companies?: { name: string } | null; jobs?: { title: string } | null; answer_count?: number } }) {
  return (
    <Link href={`/questions/${question.id}`} className="block h-full group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="mb-2.5 flex items-center gap-2">
            {question.status === 'resolved' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />已解决
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary/80 transition-colors">
            {question.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {question.content}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{question.views || 0}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{question.answer_count || 0} 回答</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
