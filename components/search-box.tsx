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
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
      <Select value={scope} onValueChange={(val) => setScope(val || 'posts')}>
        <SelectTrigger className="w-full sm:w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="posts">面经</SelectItem>
          <SelectItem value="companies">企业</SelectItem>
          <SelectItem value="questions">问答</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex flex-1 gap-2">
        <Input
          placeholder="搜索面经、企业、问答..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
        <Button type="submit"><Search className="h-4 w-4" /></Button>
      </div>
    </form>
  )
}
