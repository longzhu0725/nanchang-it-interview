import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { Building2, MessageCircle, FileText, User, LogOut } from 'lucide-react'

export async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Building2 className="h-6 w-6" />
          <span className="hidden sm:inline">本地 IT 面经圈</span>
          <span className="sm:hidden">面经圈</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link href="/companies" className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Building2 className="h-4 w-4" />企业
          </Link>
          <Link href="/posts" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="h-4 w-4" /><span className="hidden sm:inline">面经</span>
          </Link>
          <Link href="/questions" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="h-4 w-4" /><span className="hidden sm:inline">问答</span>
          </Link>
          {user ? (
            <>
              <Link href="/posts/new">
                <Button size="sm">发布</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <form action="/auth/logout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
