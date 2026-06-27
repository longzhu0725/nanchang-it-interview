# 南昌 IT 面经圈 - 本地 IT 岗位面试经验分享平台

一个专注于南昌 IT 行业的面试/笔试经验分享公益平台，帮助求职者提前了解本地企业面试流程，节约准备时间。

## 技术栈

- **前端框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui (Base UI)
- **后端/数据库**: Supabase (PostgreSQL + Auth + Storage)
- **部署**: Vercel (推荐)
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

## 快速开始

### 前置准备

1. 注册 [Supabase](https://supabase.com/) 账号
2. 安装 [Node.js](https://nodejs.org/) 18+ 和 npm

### 第一步：创建 Supabase 项目

1. 登录 Supabase，点击 "New Project" 创建新项目
2. 记下项目的 **Project URL**、**anon public** 密钥和 **service_role** 密钥（在 Settings > API 中）
3. 等待项目初始化完成（约 2 分钟）

### 第二步：初始化数据库

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 复制 `supabase/migrations/0001_initial.sql` 的全部内容，粘贴到 SQL Editor 中执行
3. 再复制 `supabase/migrations/0002_notifications_and_views.sql` 的全部内容，粘贴执行
4. 这会创建所有表、索引、RLS 安全策略、触发器和初始南昌 IT 企业数据

### 第三步：配置认证

1. 进入 Supabase Dashboard > **Authentication > Providers**
2. 确认 **Email** 认证已启用
3. （可选）在 **Authentication > URL Configuration** 中设置 Site URL 为你的部署域名（本地开发为 `http://localhost:3000`）
4. 如果需要邮箱验证，保持 "Confirm email" 开启；如需关闭（开发阶段方便测试），可关闭

### 第四步：设置 Storage（可选，用于头像上传）

1. 进入 Supabase Dashboard > **Storage**
2. 创建一个名为 `avatars` 的 public bucket
3. 创建一个名为 `images` 的 public bucket
4. 为 avatars bucket 添加 RLS 策略（在 SQL Editor 中执行）：
```sql
-- Avatars bucket policies
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Post images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);
```

### 第五步：设置第一个管理员用户

方法一：通过邀请码注册后手动设置：
1. 先用邀请码注册一个用户
2. 在 SQL Editor 中执行：
```sql
UPDATE profiles SET role = 'admin' WHERE email = '你的邮箱@example.com';
```

方法二：直接在 Supabase Auth 中创建用户并设为管理员：
1. 在 Authentication > Users 中点击 "Add user"，创建用户
2. 在 SQL Editor 中执行上述 UPDATE 语句设置 admin 角色

### 第六步：配置本地环境变量

1. 复制环境变量模板：
```bash
cp .env.local.example .env.local
```
2. 编辑 `.env.local`，填入你的 Supabase 项目信息：
```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
```

### 第七步：安装依赖并运行

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可看到平台。

## 部署到 Vercel（推荐）

### 准备工作

1. 将代码推送到 GitHub/GitLab/Bitbucket 仓库
2. 注册 [Vercel](https://vercel.com/) 账号

### 部署步骤

1. 在 Vercel 中点击 "Add New Project"，导入你的代码仓库
2. 在 **Configure Project** 页面，展开 "Environment Variables"
3. 添加以下环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = 你的 Supabase service role key
4. 点击 "Deploy"，等待部署完成（约 1-2 分钟）
5. 部署完成后，Vercel 会给你一个域名（如 `xxx.vercel.app`）

### 配置 Supabase 回调地址

1. 回到 Supabase Dashboard > Authentication > URL Configuration
2. 将 **Site URL** 设置为你的 Vercel 域名（如 `https://xxx.vercel.app`）
3. 在 **Redirect URLs** 中添加：
   - `https://xxx.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`（本地开发用）
4. 保存设置

### 生成初始邀请码

1. 先用管理员账号登录平台
2. 进入「管理后台 > 邀请码」
3. 生成邀请码，分享给需要注册的用户

## 项目结构

```
my-app/
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
│       └── 0002_notifications_and_views.sql  # 通知触发器/浏览量/Storage说明
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

## 本地开发

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm start        # 运行生产版本
npm run lint     # 代码检查
```

## 技术细节

- **认证流程**: 邮箱密码注册（需邀请码）-> 邮箱验证 -> 登录 -> Session Cookie
- **服务端渲染**: 列表页和详情页使用 Server Components 直接从 Supabase 获取数据
- **交互组件**: 点赞/收藏/举报等交互使用 Client Components + API Routes
- **实时更新**: 使用 `revalidatePath` 实现 Server Action 提交后的页面刷新
- **Markdown**: 使用 react-markdown + remark-gfm 渲染帖子和回答内容

## License

MIT
