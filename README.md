# 南昌 IT 面经圈 - 本地 IT 岗位面试经验分享平台

一个专注于南昌 IT 行业的面试/笔试经验分享公益平台，帮助求职者提前了解本地企业面试流程，节约准备时间。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 在线访问

- **主站地址**：https://ncbyteinterview.dpdns.org （自定义域名，国内访问友好）
- **备用地址**：https://nanchang-it-interview.vercel.app
- **部署教程**：参见 CSDN 完整部署文档

## 技术栈

- **前端框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui (Base UI)
- **后端/数据库**: Supabase (PostgreSQL + Auth + Storage)
- **部署**: Vercel + 自定义域名（国内访问优化）
- **Markdown**: react-markdown + remark-gfm

## 功能特性

- 邮箱 + 邀请码注册认证（确保社区质量）
- 南昌本地 IT 企业库（含行业、规模、标签分类）
- 岗位库（关联企业，支持分类浏览）
- 面经/笔经分享（支持 Markdown、匿名发布、难度评分）
- 问答社区（支持提问、回答、最佳答案标记）
- 互动功能（点赞、收藏、评论、举报）
- 用户中心（个人资料编辑、我的发布/提问/收藏）
- 管理后台（邀请码生成、内容审核、企业/岗位管理、数据统计、举报处理）
- 通知系统（点赞/评论/回答自动通知）
- 搜索功能（支持面经/企业/问答搜索与筛选）
- 自定义域名支持（优化国内访问体验）

---

## GitHub 用户 5 步极速部署

> 有 GitHub 账号？按这 5 步走，最快 15 分钟上线。

### 第 1 步：创建 Supabase 项目（5 分钟）

1. 打开 [supabase.com](https://supabase.com/)，点击 "Start your project"，用 **GitHub 账号登录**（不用单独注册）
2. 点击 "New Project"，填写项目名、数据库密码（自动生成即可），区域选 **Singapore** 或 **Tokyo**
3. 等 1-2 分钟初始化完成
4. 进入 **Settings > API**，复制以下三个值到记事本：
   - `Project URL`（类似 `https://xxxx.supabase.co`）
   - `anon public` key（一长串 `eyJ...`）
   - `service_role` secret（另一长串，保密）

### 第 2 步：初始化数据库（3 分钟）

1. Supabase 左侧菜单点击 **SQL Editor** → **New query**
2. 按顺序执行以下 3 个 SQL 文件（都在 `supabase/migrations/` 目录下）：
   - ① `0001_initial.sql` - 初始表结构、RLS策略、初始企业数据
   - ② `0002_notifications_and_views.sql` - 通知、视图
   - ③ `0003_fix_admin_profile.sql` - 管理员修复补丁（**必须执行！**）
3. 每个文件复制全部内容粘贴进去，点 **Run**，看到 "Success" 就成功了

> SQL文件地址：https://github.com/longzhu0725/nanchang-it-interview/tree/main/supabase/migrations

### 第 3 步：Fork 项目并部署到 Vercel（5 分钟）

1. 打开项目仓库 https://github.com/longzhu0725/nanchang-it-interview
2. 点击右上角 **Fork** 到你自己的账号
3. 打开 [vercel.com/new](https://vercel.com/new)，用 **GitHub 账号登录**
4. 选择你刚才 Fork 的仓库，点击 **Import**
5. 在 "Environment Variables" 里添加三个变量（就是第 1 步复制的那三个）：
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
6. 点击 **Deploy**，等 1-2 分钟

### 第 4 步：配置自定义域名 + 回调地址（可选但推荐）

Vercel默认域名在国内访问可能不稳定，建议绑定自定义域名：

1. 进入Vercel项目 → **Settings** → **Domains**
2. 输入你的域名（如 `ncbyteinterview.dpdns.org`），点击 **Add**
3. 去你的域名服务商配置DNS：
   - 二级域名：添加 **CNAME** 记录指向 `cname.vercel-dns.com`
   - 一级域名：添加 **A** 记录指向 `76.76.21.21`
4. 等待SSL证书签发（几分钟）
5. 回到 Supabase → **Authentication > URL Configuration**：
   - Site URL 填你的自定义域名：`https://ncbyteinterview.dpdns.org`
   - Redirect URLs 添加：
     - `https://ncbyteinterview.dpdns.org/auth/callback`
     - `https://你的项目.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
   - 点 **Save**

### 第 5 步：设置管理员账号（2 分钟）

1. Supabase → **Authentication > Users** → **Add user**，填你的邮箱和密码创建用户
2. 回到 **SQL Editor**，执行（**换成你的邮箱！**）：

```sql
-- 补建profile并设置为管理员
INSERT INTO profiles (id, email, nickname, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = '你的邮箱@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

3. 打开你的网站，用管理员账号登录，进入 `/admin/invite-codes` 生成邀请码，分享给朋友注册

完成！🎉

---

## 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/longzhu0725/nanchang-it-interview.git
cd nanchang-it-interview

# 2. 复制环境变量文件
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Supabase 三个密钥

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

### 推送更新到线上

```bash
git add .
git commit -m "你的修改说明"
git push
```

推送后Vercel会自动部署，1-2分钟线上更新。

## 项目结构

```
nanchang-it-interview/
├── app/                          # Next.js App Router 页面
│   ├── (auth)/                   # 认证页面组（登录/注册/验证）
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/
│   ├── admin/                    # 管理后台
│   │   ├── dashboard/            # 数据概览
│   │   ├── invite-codes/         # 邀请码管理
│   │   ├── companies/            # 企业管理
│   │   ├── jobs/                 # 岗位管理
│   │   ├── posts/                # 帖子审核
│   │   ├── questions/            # 问答管理
│   │   └── reports/              # 举报处理
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证相关 API
│   │   ├── admin/                # 管理员 API
│   │   ├── posts/                # 帖子 CRUD
│   │   ├── questions/            # 问题 CRUD
│   │   ├── likes/                # 点赞
│   │   ├── bookmarks/            # 收藏
│   │   ├── comments/             # 评论
│   │   ├── reports/              # 举报
│   │   └── profile/              # 个人资料
│   ├── companies/                # 企业列表/详情
│   ├── jobs/                     # 岗位列表/详情
│   ├── posts/                    # 面经列表/详情/发布
│   ├── questions/                # 问答列表/详情/提问
│   ├── profile/                  # 用户中心
│   ├── auth/                     # Auth 回调/登出
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── navbar.tsx                # 导航栏
│   ├── footer.tsx                # 页脚
│   ├── post-card.tsx             # 面经卡片
│   ├── question-card.tsx         # 问题卡片
│   ├── company-card.tsx          # 企业卡片
│   ├── post-form.tsx             # 面经发布表单
│   ├── question-form.tsx         # 提问表单
│   ├── search-box.tsx            # 搜索框
│   ├── like-button.tsx           # 点赞按钮（带交互）
│   ├── bookmark-button.tsx       # 收藏按钮（带交互）
│   ├── report-button.tsx         # 举报按钮（带弹窗）
│   └── markdown-renderer.tsx     # Markdown 渲染器
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 浏览器端 Supabase 客户端
│   │   ├── server.ts             # 服务端 Supabase 客户端
│   │   └── admin.ts              # Admin Supabase 客户端（service role）
│   └── utils.ts                  # 工具函数
├── supabase/
│   └── migrations/               # 数据库迁移文件
│       ├── 0001_initial.sql      # 初始 schema（表/索引/RLS/初始数据）
│       ├── 0002_notifications_and_views.sql  # 通知触发器/浏览量
│       └── 0003_fix_admin_profile.sql        # 管理员修复补丁（必须执行）
├── types/
│   └── database.ts               # TypeScript 类型定义
├── middleware.ts                 # Next.js 中间件（路由保护）
└── public/                       # 静态资源
```

## 数据库表结构

| 表名 | 说明 |
|------|------|
| profiles | 用户资料（昵称/公司/城市/角色） |
| invite_codes | 邀请码（注册凭证） |
| companies | 企业信息（名称/行业/规模/标签） |
| jobs | 岗位信息（关联企业/类别/面试轮次） |
| posts | 面经/笔经帖子（标题/内容/类型/难度/匿名） |
| questions | 问答帖子（标题/内容/状态/匿名） |
| answers | 问题回答（内容/点赞/最佳答案标记） |
| comments | 面经评论 |
| likes | 点赞记录（支持帖子/回答/问题） |
| bookmarks | 收藏记录 |
| notifications | 通知（点赞/评论/回答自动触发） |
| reports | 举报记录 |

## 常见问题

### Q: 管理员页面访问不了，跳回首页？
A: 这是因为profiles表中没有你的记录。请执行 `0003_fix_admin_profile.sql`，或在SQL Editor手动执行：
```sql
INSERT INTO profiles (id, email, nickname, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = '你的邮箱'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Q: 国内访问Vercel默认域名慢/打不开？
A: 绑定自定义域名解决。参见部署第4步。也可以使用Cloudflare CDN加速，或换用国内部署平台（如IGA Pages/火山引擎）。

### Q: 如何改成其他城市？
A: 修改 `0001_initial.sql` 中的初始企业数据，全局搜索"南昌"替换为你的城市名即可。

## 安全说明

- **Row Level Security (RLS)**: 所有表都启用了行级安全策略，用户只能访问/修改自己的数据
- **Service Role Key**: 仅在服务端 API 路由中使用，不会暴露给客户端
- **邀请码注册**: 防止垃圾注册，确保社区用户质量
- **内容审核**: 新发布的帖子/问题默认为待审核状态，管理员审核后才公开
- **匿名发布**: 支持用户选择匿名发布，不显示昵称和公司

## 常用操作指南

### 生成邀请码
管理员登录后进入「管理后台 > 邀请码」，选择数量后点击生成。生成的邀请码需要及时复制保存。

### 审核内容
管理员进入「管理后台 > 帖子审核」或「问答管理」，对待审核内容点击"通过"或"拒绝"。

### 添加企业/岗位
管理员进入「管理后台 > 企业管理」或「岗位管理」，使用表单添加新企业或岗位。

### 处理举报
管理员进入「管理后台 > 举报处理」，查看举报内容并做出相应处理。

## 本地开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm start        # 运行生产版本
npm run lint     # 代码检查
```

## 技术细节

- **认证流程**: 邮箱密码注册（需邀请码）-> 邮箱验证 -> 登录 -> Session Cookie
- **自动触发器**: 新用户创建时自动在profiles表创建记录
- **服务端渲染**: 列表页和详情页使用 Server Components 直接从 Supabase 获取数据
- **交互组件**: 点赞/收藏/举报等交互使用 Client Components + API Routes
- **实时更新**: 使用 `revalidatePath` 实现 Server Action 提交后的页面刷新
- **Markdown**: 使用 react-markdown + remark-gfm 渲染帖子和回答内容
- **UI设计**: 极简风格，shadcn/ui组件库，响应式适配手机/平板/PC

## License

MIT
