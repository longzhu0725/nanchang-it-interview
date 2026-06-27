import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import type { Company } from '@/types/database'

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium truncate">{company.name}</h3>
              <p className="text-xs text-muted-foreground">{company.industry} · {company.size}</p>
            </div>
          </div>
          {company.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{company.description}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {company.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
