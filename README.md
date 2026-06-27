# 南昌 IT 面经圈 - 本地 IT 岗位面试经验分享平台

一个专注于南昌 IT 行业的面试/笔试经验分享公益平台，帮助求职者提前了解本地企业面试流程，节约准备时间。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

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

---

## GitHub 用户 4 步极速部署

> 有 GitHub 账号？按这 4 步走，最快 15 分钟上线。

### 第 1 步：创建 Supabase 项目（5 分钟）

1. 打开 [supabase.com](https://supabase.com/)，点击 "Start your project"，用 **GitHub 账号登录**（不用单独注册）
2. 点击 "New Project"，填写项目名、数据库密码（自动生成即可），区域选 **Singapore**
3. 等 1-2 分钟初始化完成
4. 进入 **Settings > API**，复制以下三个值到记事本：
   - `Project URL`（类似 `https://xxxx.supabase.co`）
   - `anon public` key（一长串 `eyJ...`）
   - `service_role` secret（另一长串，保密）

### 第 2 步：初始化数据库（3 分钟）

1. Supabase 左侧菜单点击 **SQL Editor** → **New query**
2. 打开本地项目里的 `supabase/migrations/0001_initial.sql`，复制全部内容粘贴进去，点 **Run**
3. 再打开 `supabase/migrations/0002_notifications_and_views.sql`，同样复制粘贴执行
4. 看到 "Success" 就成功了

### 第 3 步：推送到 GitHub 并部署到 Vercel（5 分钟）

1. 在 GitHub 上创建一个**空仓库**（不要勾选 README/.gitignore），名字随便起，比如 `nanchang-it-interview`
2. 在本地项目文件夹里执行（把下面的地址换成你自己的仓库地址）：

```bash
git remote add origin https://github.com/你的用户名/nanchang-it-interview.git
git push -u origin main
```

3. 打开 [vercel.com/new](https://vercel.com/new)，用 **GitHub 账号登录**
4. 选择刚才推送的仓库，点击 **Import**
5. 在 "Environment Variables" 里添加三个变量（就是第 1 步复制的那三个）：
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
6. 点击 **Deploy**，等 1-2 分钟

### 第 4 步：配置登录回调 + 设管理员（2 分钟）

1. Vercel 部署成功后，会给你一个域名（类似 `https://xxx.vercel.app`），复制它
2. 回到 Supabase → **Authentication > URL Configuration**：
   - Site URL 填你的 Vercel 域名
   - Redirect URLs 添加：`https://xxx.vercel.app/auth/callback` 和 `http://localhost:3000/auth/callback`
   - 点 **Save**
3. 设管理员：Supabase → **Authentication > Users** → **Add user**，填你的邮箱和密码创建用户
4. 回到 **SQL Editor**，执行（换成你的邮箱）：

```sql
UPDATE profiles SET role = 'admin' WHERE email = '你的邮箱@example.com';
```

5. 打开你的网站，用管理员账号登录，进入 `/admin/invite-codes` 生成邀请码，分享给朋友注册

完成！🎉

---

## 本地开发

```bash
# 1. 复制环境变量文件
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Supabase 三个密钥

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

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
