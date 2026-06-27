import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import type { Company } from '@/types/database'

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/companies/${company.id}`} className="block h-full">
      <Card className="h-full cursor-pointer">
        <CardContent className="py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-foreground/70">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-medium tracking-tight text-foreground">
                {company.name}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {company.industry}{company.size ? ` · ${company.size}` : ''}
              </p>
            </div>
          </div>
          {company.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {company.description}
            </p>
          )}
          {company.tags && company.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {company.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
