'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SearchBox() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [scope, setScope] = useState('posts')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (keyword.trim()) {
      router.push(`/${scope}?q=${encodeURIComponent(keyword)}`)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-lg border bg-background p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    >
      <Select value={scope} onValueChange={(val) => setScope(val || 'posts')}>
        <SelectTrigger className="h-auto w-[88px] shrink-0 border-0 bg-transparent px-2.5 py-2 text-sm shadow-none focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="posts">面经</SelectItem>
          <SelectItem value="companies">企业</SelectItem>
          <SelectItem value="questions">问答</SelectItem>
        </SelectContent>
      </Select>
      <div className="h-5 w-px shrink-0 bg-border" />
      <Input
        placeholder="搜索面经、企业、问答..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="h-auto flex-1 border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
      />
      <Button type="submit" size="sm" className="shrink-0 px-3">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
