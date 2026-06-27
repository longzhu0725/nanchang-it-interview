# 南昌 IT 面经圈 - 本地 IT 岗位面试经验分享平台

一个专注于南昌 IT 行业的面试/笔试经验分享公益平台，帮助求职者提前了解本地企业面试流程，节约准备时间。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 在线访问

- **主站地址**：https://ncbyteinterview.dpdns.org （Cloudflare CDN加速，国内访问友好）
- **备用地址**：https://nanchang-it-interview.vercel.app
- **部署教程**：参见 CSDN 完整部署教程（零成本方案，含Cloudflare CDN配置）

## 技术栈

- **前端框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui (Base UI)
- **后端/数据库**: Supabase (PostgreSQL + Auth + Storage)
- **托管**: Vercel（免费）
- **CDN加速**: Cloudflare（免费）
- **域名**: dpdns.org免费域名（DigitalPlat提供，支持NS托管到Cloudflare）
- **Markdown**: react-markdown + remark-gfm

## 功能特性

- 邮箱 + 邀请码注册认证（确保社区质量）
- 南昌本地 IT 企业库（含行业、规模、标签分类，30+家企业）
- 岗位库（关联企业，支持分类浏览）
- 面经/笔经分享（支持 Markdown、匿名发布、难度评分）
- 问答社区（支持提问、回答、最佳答案标记）
- 互动功能（点赞、收藏、评论、举报）
- 用户中心（个人资料编辑、我的发布/提问/收藏）
- 管理后台（邀请码生成、内容审核、企业/岗位管理、数据统计、举报处理）
- 通知系统（点赞/评论/回答自动通知）
- 搜索功能（支持面经/企业/问答搜索与筛选）
- Cloudflare CDN加速（零成本，国内访问友好）

---

## 零成本部署方案（推荐）⭐

使用 dpdns.org 免费域名 + Cloudflare CDN + Vercel + Supabase，**全部免费**，国内访问友好。

### 需要的账号（全部免费）

| 平台 | 用途 | 官网 |
|------|------|------|
| GitHub | 代码托管 | https://github.com |
| Supabase | 数据库+认证 | https://supabase.com |
| Vercel | 网站托管 | https://vercel.com |
| Cloudflare | CDN加速+DNS | https://cloudflare.com |
| DigitalPlat | 免费域名(dpdns.org) | https://dash.domain.digitalplat.org |

### 快速部署步骤

#### 1. Fork项目
https://github.com/longzhu0725/nanchang-it-interview → Fork到你账号

#### 2. 创建Supabase项目
- 新建Project，区域选Tokyo或Singapore
- Settings → API 复制Project URL、anon key、service_role key
- SQL Editor按顺序执行3个迁移文件（必须执行0003_fix_admin_profile.sql！）：
  - `supabase/migrations/0001_initial.sql`
  - `supabase/migrations/0002_notifications_and_views.sql`
  - `supabase/migrations/0003_fix_admin_profile.sql`

#### 3. 部署到Vercel
- vercel.com/new → Import你的Fork仓库
- 添加3个环境变量（Supabase密钥）
- Deploy

#### 4. 申请免费dpdns.org域名（已有可跳过）
- 注册DigitalPlat，GitHub账号认证
- Domain Registration → 选dpdns.org后缀 → 输入前缀注册

#### 5. Cloudflare配置（核心！国内访问关键）
- Cloudflare添加站点（你的dpdns.org域名），选Free计划
- 复制Cloudflare给的两个Nameserver地址
- 去DigitalPlat → My Domains → 你的域名 → 修改Nameservers为Cloudflare的NS
- 等待NS生效（状态变Active，几分钟）
- Cloudflare DNS添加记录：
  - CNAME @ → cname.vercel-dns.com（🟠橙色云朵，Proxied）
  - 如果Vercel要求TXT验证，添加TXT _vercel → 验证值（⚪灰色云朵，DNS only）
- SSL/TLS设置为**Full**（不要选Flexible！）
- 开启Auto Minify、Brotli、HTTP/3优化

#### 6. Vercel添加域名验证
- Vercel项目 → Settings → Domains → 添加你的域名
- 等待验证通过（绿色✓）

#### 7. 更新Supabase回调
- Supabase → Authentication → URL Configuration
- Site URL: `https://你的域名`
- Redirect URLs: `https://你的域名/auth/callback`

#### 8. 设置管理员
- Supabase Auth → Users → Add user创建账号
- SQL Editor执行：
```sql
INSERT INTO profiles (id, email, nickname, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = '你的邮箱'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```
- 登录后访问 `/admin/invite-codes` 生成邀请码

🎉 完成！详细图文教程见CSDN部署文档。

---

## 本地开发

```bash
git clone https://github.com/你的用户名/nanchang-it-interview.git
cd nanchang-it-interview
cp .env.local.example .env.local
# 编辑.env.local填入三个Supabase密钥
npm install
npm run dev
```

打开 http://localhost:3000 访问。

推送更新：
```bash
git add .
git commit -m "修改说明"
git push
```
Vercel自动部署。如果Cloudflare缓存没更新，去Cloudflare → Caching → Purge Everything。

---

## 项目结构

```
nanchang-it-interview/
├── app/                          # Next.js App Router页面
│   ├── (auth)/                   # 登录/注册
│   ├── admin/                    # 管理后台
│   ├── api/                      # API路由
│   ├── companies/                # 企业库
│   ├── posts/                    # 面经
│   ├── questions/                # 问答
│   └── profile/                  # 个人中心
├── components/                   # React组件
│   └── ui/                       # shadcn/ui基础组件
├── lib/supabase/                 # Supabase客户端
├── supabase/migrations/          # 数据库SQL迁移
├── types/database.ts             # TypeScript类型定义
└── middleware.ts                 # 路由保护中间件
```

## 数据库表

| 表名 | 说明 |
|------|------|
| profiles | 用户资料 |
| invite_codes | 邀请码 |
| companies | 企业信息 |
| jobs | 岗位信息 |
| posts | 面经/笔经 |
| questions | 问答帖子 |
| answers | 回答 |
| comments | 评论 |
| likes | 点赞 |
| bookmarks | 收藏 |
| notifications | 通知 |
| reports | 举报 |

## 常见问题

### 管理员页面跳回首页？
执行 `0003_fix_admin_profile.sql` 中的触发器创建和管理员设置SQL，退出重新登录。

### Cloudflare后重定向过多？
SSL/TLS模式改为**Full**，不要用Flexible。

### Vercel域名TXT验证失败？
确认TXT记录代理状态是**灰色云朵（DNS only）**，橙色云朵会拦截TXT查询。

### 更新后网站没变化？
Cloudflare缓存了旧版本，去Caching → Purge Everything清缓存。

### dpdns.org域名靠谱吗？
DigitalPlat是非营利组织运营的免费域名服务，支持自定义NS到Cloudflare，免费续期一年一次，轻量使用完全够用。推荐dpdns.org而非qzz.io，证书申请更稳定。

## 技术亮点

- Cloudflare CDN + dpdns.org免费域名，零成本国内访问加速
- Row Level Security数据库级权限控制
- 邀请码注册保证社区质量
- 匿名发布保护用户隐私
- Next.js SSR服务端渲染，首屏快SEO好
- TypeScript全栈类型安全
- 响应式设计，手机/PC完美适配
- shadcn/ui极简UI设计

## License

MIT
