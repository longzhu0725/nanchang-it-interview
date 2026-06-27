import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-muted-foreground sm:flex-row">
        <p className="text-[13px]">
          <span className="font-medium text-foreground/80">本地 IT 面经圈</span>
          <span className="mx-2 text-border">·</span>
          南昌 IT 求职者互助公益平台
        </p>
        <div className="flex items-center gap-4">
          <Link href="/companies" className="hover:text-foreground">企业</Link>
          <Link href="/posts" className="hover:text-foreground">面经</Link>
          <Link href="/questions" className="hover:text-foreground">问答</Link>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
        公益项目，仅供学习交流使用，内容由用户贡献
      </p>
    </footer>
  )
}
