import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, MessageCircle, CheckCircle2 } from 'lucide-react'
import type { Question } from '@/types/database'

export function QuestionCard({ question }: { question: Question & { companies?: { name: string } | null; jobs?: { title: string } | null; answer_count?: number } }) {
  return (
    <Link href={`/questions/${question.id}`}>
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-2">
            {question.status === 'resolved' && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />已解决
              </Badge>
            )}
          </div>
          <h3 className="font-medium line-clamp-2 mb-2">{question.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{question.content}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {question.views || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 回答</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
