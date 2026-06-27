'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
