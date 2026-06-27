import { createClient } from '@/lib/supabase/server'
import { PostForm } from '@/components/post-form'

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { company?: string; job?: string }
}) {
  const supabase = createClient()
  const { data: companies } = await supabase.from('companies').select('*').eq('status', 'published')
  const { data: jobs } = await supabase.from('jobs').select('*')

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">分享面经/笔经</h1>
      <PostForm
        companies={companies || []}
        jobs={jobs || []}
        defaultCompanyId={searchParams.company}
        defaultJobId={searchParams.job}
      />
    </div>
  )
}
