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
import { User as UserIcon, FileText, MessageCircle, Bookmark, LogOut, Pencil } from 'lucide-react'

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">用户中心</h1>
        <form action="/auth/logout" method="post">
          <Button type="submit" variant="outline" size="sm" className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </form>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />个人资料
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="text-muted-foreground">昵称：</span>{profile?.nickname || '未设置'}</p>
          <p><span className="text-muted-foreground">邮箱：</span>{profile?.email}</p>
          <p><span className="text-muted-foreground">公司：</span>{profile?.company || '未填写'}</p>
          <p><span className="text-muted-foreground">城市：</span>{profile?.city || '南昌'}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />编辑资料
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                name="nickname"
                defaultValue={profile?.nickname || ''}
                placeholder="请输入昵称"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">公司</Label>
              <Input
                id="company"
                name="company"
                defaultValue={profile?.company || ''}
                placeholder="请输入公司名称"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">城市</Label>
              <Input
                id="city"
                name="city"
                defaultValue={profile?.city || ''}
                placeholder="请输入所在城市"
                maxLength={50}
              />
            </div>
            <Button type="submit">保存修改</Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />我的发布
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />我的提问
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-1">
            <Bookmark className="h-4 w-4" />我的收藏
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {posts?.map((post) => <PostCard key={post.id} post={post} />)}
            {!posts?.length && <p className="text-muted-foreground col-span-2 text-center py-8">暂无发布</p>}
          </div>
        </TabsContent>
        <TabsContent value="questions" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {questions?.map((question) => <QuestionCard key={question.id} question={question} />)}
            {!questions?.length && <p className="text-muted-foreground col-span-2 text-center py-8">暂无提问</p>}
          </div>
        </TabsContent>
        <TabsContent value="bookmarks" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(bookmarks as unknown as Array<{ posts: (Post & { companies?: { name: string } | null }) | null }>)?.map((bookmark) =>
              bookmark.posts && <PostCard key={bookmark.posts.id} post={bookmark.posts} />
            )}
            {!bookmarks?.length && <p className="text-muted-foreground col-span-2 text-center py-8">暂无收藏</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
