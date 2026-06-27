import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { Building2, FileText, MessageCircle, User, LogOut, PenSquare } from 'lucide-react'

export async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          <span className="hidden sm:inline">本地 IT 面经圈</span>
          <span className="sm:hidden">面经圈</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/companies"
            className="hidden md:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Building2 className="h-3.5 w-3.5" />企业
          </Link>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">面经</span>
          </Link>
          <Link
            href="/questions"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">问答</span>
          </Link>

          <div className="mx-2 hidden h-4 w-px bg-border sm:block" />

          {user ? (
            <>
              <Link href="/posts/new">
                <Button size="sm" className="gap-1.5 px-3">
                  <PenSquare className="h-3.5 w-3.5" />发布
                </Button>
              </Link>
              <Link href="/profile" className="ml-1">
                <Button variant="ghost" size="icon-sm" aria-label="个人中心">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <form action="/auth/logout" method="POST" className="ml-0.5">
                <Button variant="ghost" size="icon-sm" type="submit" aria-label="退出登录">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground px-2 py-1.5">
                登录
              </Link>
              <Link href="/register" className="ml-1">
                <Button size="sm" variant="outline">注册</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
