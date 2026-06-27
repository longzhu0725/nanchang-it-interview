import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export default async function AdminReportsPage() {
  const supabase = createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">举报处理</h2>
      <div className="space-y-3">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardContent className="py-4">
              <p className="font-medium">{report.reason}</p>
              <p className="text-sm text-muted-foreground mt-1">
                目标类型: {report.target_type} · 状态: {report.status}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(report.created_at).toLocaleDateString('zh-CN')}
              </p>
            </CardContent>
          </Card>
        ))}
        {!reports?.length && <p className="text-muted-foreground text-center py-8">暂无举报</p>}
      </div>
    </div>
  )
}
