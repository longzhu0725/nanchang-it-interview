import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <Link href="/"><Button variant="ghost" size="sm">返回前台</Button></Link>
      </div>
      <nav className="flex gap-2 mb-6 border-b pb-4 flex-wrap">
        <Link href="/admin/dashboard"><Button variant="ghost" size="sm">仪表盘</Button></Link>
        <Link href="/admin/users"><Button variant="ghost" size="sm">用户管理</Button></Link>
        <Link href="/admin/invite-codes"><Button variant="ghost" size="sm">邀请码</Button></Link>
        <Link href="/admin/companies"><Button variant="ghost" size="sm">企业管理</Button></Link>
        <Link href="/admin/jobs"><Button variant="ghost" size="sm">岗位管理</Button></Link>
        <Link href="/admin/posts"><Button variant="ghost" size="sm">帖子审核</Button></Link>
        <Link href="/admin/questions"><Button variant="ghost" size="sm">问答管理</Button></Link>
        <Link href="/admin/reports"><Button variant="ghost" size="sm">举报处理</Button></Link>
      </nav>
      {children}
    </div>
  )
}
