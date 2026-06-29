# 注册报错：duplicate key value violates unique constraint "profiles_pkey"

## 现象
用户在注册时，后端返回错误：

```
duplicate key value violates unique constraint "profiles_pkey"
重复的键值违反了唯一性约束“profiles_pkey”
```

## 根本原因

`public.profiles` 表的 `id` 字段是主键，同时外键关联 `auth.users(id)`：

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
);
```

注册流程分为两步：
1. 调用 `supabase.auth.admin.createUser({ email, password })` 创建 `auth.users` 记录。
2. 用返回的 `authData.user.id` 手动 `INSERT INTO profiles`。

**冲突点**：某些 Supabase 项目（或历史迁移）在 `auth.users` 表上配置了触发器（trigger），当 `auth.users` 插入新行时，**自动在 `public.profiles` 中插入一条默认记录**。随后应用代码再次手动 `INSERT` 同一 `id`，于是触发 `profiles_pkey` 唯一约束。

## 修复方案

### 方案 1：应用层兼容（推荐，已实施）

将手动 `INSERT` 改为 `UPSERT`（即 `INSERT ... ON CONFLICT UPDATE`）：

```ts
const { error: profileError } = await supabase.from('profiles').upsert({
  id: authData.user.id,
  email,
  nickname,
  company,
  city: null,
  invite_code_id: null,
}, {
  onConflict: 'id',
  ignoreDuplicates: false,
})
```

- 如果数据库触发器已创建 profiles 记录，则更新 `nickname`、`company`、`email` 等字段。
- 如果没有触发器，则正常插入新记录。

**优点**：代码健壮，不依赖数据库是否配置触发器。

### 方案 2：数据库层清理

在 Supabase SQL Editor 中执行迁移脚本 `supabase/migrations/0007_fix_profiles_pkey_duplicate.sql`：

```sql
-- 查看 auth.users 上所有非内部触发器
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND NOT tgisinternal;

-- 删除常见的自动创建 profiles 触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_after_user ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE;
```

**注意**：应用层已改为 `UPSERT`，即使保留触发器也不会再报错。但如果你希望数据库结构清晰，建议删除冗余触发器。

## 如何排查

如果以后再遇到类似问题，按以下步骤排查：

1. **查看 auth.users 上的触发器**：
   ```sql
   SELECT tgname, tgenabled, pg_get_triggerdef(oid)
   FROM pg_trigger
   WHERE tgrelid = 'auth.users'::regclass
     AND NOT tgisinternal;
   ```

2. **检查 profiles 表中是否已存在该 user 的记录**：
   ```sql
   SELECT id, email, nickname, created_at
   FROM profiles
   WHERE id = '<报错中的 user id>';
   ```

3. **查看 Supabase Auth 日志**：在 Supabase Dashboard → Authentication → Logs 中查看触发器执行顺序。

4. **本地测试注册**：用不同的新邮箱调用 `/api/auth/register`，看是否仍能复现。

## 当前状态

- 应用层：`app/api/auth/register/route.ts` 已使用 `upsert` 代替 `insert`。
- 数据库层：`supabase/migrations/0007_fix_profiles_pkey_duplicate.sql` 已创建，用于清理冗余触发器。
- 部署：代码已推送 GitHub，Vercel 会自动部署。

## 上线后必做

请在 Supabase SQL Editor 中执行：

```sql
\i supabase/migrations/0007_fix_profiles_pkey_duplicate.sql
```

或复制其中 SQL 语句执行，确保数据库中不再存在自动创建 profiles 的触发器。
