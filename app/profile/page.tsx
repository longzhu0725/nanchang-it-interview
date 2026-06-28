import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/post-card'
import { QuestionCard } from '@/components/question-card'
import type { Post } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import {
  FileText,
  MessageCircle,
  Bookmark,
  LogOut,
  Pencil,
  Building2,
  MapPin,
  CalendarDays,
} from 'lucide-react'

async function updateProfile(formData: FormData) {
  'use server'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const nickname = (formData.get('nickname') as string)?.trim() || null
  const company = (formData.get('company') as string)?.trim() || null
  const city = (formData.get('city') as string)?.trim() || null

  await supabase
    .from('profiles')
    .update({ nickname, company, city })
    .eq('id', user.id)

  revalidatePath('/profile')
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">请先登录</p>
        <Link href="/login"><Button>登录</Button></Link>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, companies(name)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('posts(*, companies(name))')
    .eq('user_id', user.id)

  const displayName = profile?.nickname || profile?.email?.split('@')[0] || '用户'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold">用户中心</h1>
          <p className="text-sm text-muted-foreground mt-1">管理你的资料和发布内容</p>
        </div>
        <form action="/auth/logout" method="post">
          <Button type="submit" variant="outline" size="sm" className="flex items-center gap-1.5">
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </form>
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* 个人资料卡 */}
        <Card>
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 md:gap-6">
              <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-2xl md:text-3xl shadow-sm shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-lg md:text-xl truncate">{displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {profile?.company || '未填写公司'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile?.city || '南昌'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      注册于 {new Date(profile?.created_at || Date.now()).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 编辑资料 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pencil className="h-5 w-5 text-primary" />
              编辑资料
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm">昵称</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  defaultValue={profile?.nickname || ''}
                  placeholder="请输入昵称"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm">公司</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={profile?.company || ''}
                  placeholder="请输入公司名称"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm">城市</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={profile?.city || ''}
                  placeholder="请输入所在城市"
                  maxLength={50}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Button type="submit" size="sm">保存修改</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 标签页 + 内容 */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11 max-w-md">
            <TabsTrigger value="posts" className="flex items-center gap-1.5 text-sm">
              <FileText className="h-4 w-4" />我的发布
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-1.5 text-sm">
              <MessageCircle className="h-4 w-4" />我的提问
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-1.5 text-sm">
              <Bookmark className="h-4 w-4" />我的收藏
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="pt-4 md:pt-5">
            <div className="flex flex-col gap-4">
              {posts?.map((post) => <PostCard key={post.id} post={post} showAnonymous={false} />)}
              {!posts?.length && (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">暂无发布</p>
                  <Link href="/posts/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                    去发布第一篇面经
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="questions" className="pt-4 md:pt-5">
            <div className="flex flex-col gap-4">
              {questions?.map((question) => <QuestionCard key={question.id} question={question} />)}
              {!questions?.length && (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">暂无提问</p>
                  <Link href="/questions/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                    去提第一个问题
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="bookmarks" className="pt-4 md:pt-5">
            <div className="flex flex-col gap-4">
              {(bookmarks as unknown as Array<{ posts: (Post & { companies?: { name: string } | null }) | null }>)?.map((bookmark) =>
                bookmark.posts && <PostCard key={bookmark.posts.id} post={bookmark.posts} />
              )}
              {!bookmarks?.length && (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">暂无收藏</p>
                  <Link href="/posts" className="text-sm text-primary hover:underline mt-1 inline-block">
                    去浏览面经
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
