# 南昌 IT 面经圈 - 本地 IT 岗位面试经验分享平台

一个专注于南昌 IT 行业的面试/笔试经验分享公益平台，帮助求职者提前了解本地企业面试流程，节约准备时间。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 在线访问

- **主站地址**：https://ncbyteinterview.dpdns.org （Cloudflare CDN加速，国内访问友好）
- **备用地址**：https://nanchang-it-interview.vercel.app
- **部署教程**：参见 CSDN 完整部署文档（含Cloudflare CDN配置）

## 技术栈

- **前端框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui (Base UI)
- **后端/数据库**: Supabase (PostgreSQL + Auth + Storage)
- **托管**: Vercel
- **CDN加速**: Cloudflare（免费，国内访问优化）
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
- Cloudflare CDN加速（国内访问友好）

---

## 推荐部署方案：Vercel + Cloudflare CDN ⭐

这是国内访问最稳定的方案，全部用免费服务即可。

### 准备账号

| 平台 | 用途 | 费用 |
|------|------|------|
| GitHub | 代码托管 | 免费 |
| Supabase | 数据库+认证 | 免费 |
| Vercel | 网站托管 | 免费 |
| Cloudflare | CDN加速+DNS | 免费 |
| 自有域名 | .xyz/.top/.cn等 | 几元/年 |

### 快速部署步骤

#### 1. Fork项目
打开 https://github.com/longzhu0725/nanchang-it-interview → Fork到你账号

#### 2. 创建Supabase项目
- 新建Project，区域选Tokyo或Singapore
- Settings → API 复制Project URL、anon key、service_role key
- SQL Editor按顺序执行3个迁移文件：
  - `supabase/migrations/0001_initial.sql`
  - `supabase/migrations/0002_notifications_and_views.sql`
  - `supabase/migrations/0003_fix_admin_profile.sql`（必须执行！）

#### 3. 部署到Vercel
- vercel.com/new → Import你的Fork仓库
- 添加3个环境变量（Supabase的三个密钥）
- Deploy，得到Vercel默认域名

#### 4. 配置Cloudflare CDN（关键！）
- Cloudflare添加站点（你的域名），选Free计划
- 复制Cloudflare给的两个NS地址，去域名商修改Nameserver
- NS生效后，Cloudflare DNS添加CNAME记录：
  - 类型：CNAME
  - Name：@（或子域名如nc）
  - Content：`cname.vercel-dns.com`
  - 代理状态：🟠 Proxied（橙色云朵，必须开启！）
- SSL/TLS设置为**Full**模式（不要选Flexible，否则重定向循环）
- 优化建议：开启Auto Minify、Brotli、HTTP/3

#### 5. Vercel添加域名
- Vercel项目 → Settings → Domains → 添加你的域名
- 如果验证不通过，临时把Cloudflare云朵点成灰色，验证通过再切回橙色

#### 6. 更新Supabase回调
- Supabase → Authentication → URL Configuration
- Site URL改为 `https://你的域名`
- Redirect URLs添加 `https://你的域名/auth/callback`

#### 7. 设置管理员
- Supabase Auth → Users → Add user创建你的账号
- SQL Editor执行：
```sql
INSERT INTO profiles (id, email, nickname, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = '你的邮箱'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```
- 登录网站，访问 `/admin/invite-codes` 生成邀请码

🎉 完成！

---

## 免费域名方案（dpdns.org等）

如果你用dpdns.org这类无法修改NS的免费域名：
1. 在dpdns.org后台直接添加CNAME记录到 `cname.vercel-dns.com`
2. 不用Cloudflare（因为无法改NS）
3. 国内访问速度取决于Vercel节点，时好时坏
4. 建议还是花几块钱买个域名用Cloudflare方案，体验好很多

---

## 本地开发

```bash
# 克隆项目
git clone https://github.com/你的用户名/nanchang-it-interview.git
cd nanchang-it-interview

# 配置环境变量
cp .env.local.example .env.local
# 编辑.env.local填入三个Supabase密钥

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可访问。

### 推送更新

```bash
git add .
git commit -m "修改说明"
git push
```

Vercel自动部署，1-2分钟线上更新。Cloudflare缓存如果没更新，去Cloudflare Purge Everything即可。

---

## 项目结构

```
nanchang-it-interview/
├── app/                          # Next.js App Router页面
│   ├── (auth)/                   # 登录/注册/验证
│   ├── admin/                    # 管理后台（仅管理员）
│   │   ├── dashboard/
│   │   ├── invite-codes/
│   │   ├── companies/
│   │   ├── posts/
│   │   └── reports/
│   ├── api/                      # API路由
│   ├── companies/                # 企业库
│   ├── posts/                    # 面经
│   ├── questions/                # 问答
│   ├── profile/                  # 个人中心
│   └── page.tsx                  # 首页
├── components/                   # React组件
│   ├── ui/                       # shadcn/ui基础组件
│   └── ...                       # 业务组件
├── lib/supabase/                 # Supabase客户端配置
├── supabase/migrations/          # 数据库SQL迁移
│   ├── 0001_initial.sql
│   ├── 0002_notifications_and_views.sql
│   └── 0003_fix_admin_profile.sql
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
执行 `0003_fix_admin_profile.sql`，或手动执行：
```sql
INSERT INTO profiles (id, email, nickname, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = '你的邮箱'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Cloudflare后重定向过多？
SSL/TLS模式改为**Full**，不要用Flexible。

### Vercel域名验证失败？
Cloudflare DNS临时切灰色云朵（DNS only），验证通过再切回橙色。

### 更新后网站没变化？
Cloudflare缓存了旧版本，去Caching → Purge Everything清缓存。

## 技术亮点

- Cloudflare CDN全球加速，国内访问友好
- Row Level Security数据库级权限控制
- 邀请码注册保证社区质量
- 匿名发布保护用户隐私
- Next.js SSR服务端渲染，首屏快SEO好
- TypeScript全栈类型安全
- 响应式设计，手机/PC完美适配
- shadcn/ui极简UI设计

## License

MIT
