-- =====================================================
-- 修复注册时报 duplicate key value violates unique constraint "profiles_pkey"
-- =====================================================
-- 问题原因：
--   某些 Supabase 项目会在 auth.users 上配置触发器，在新用户注册时
--   自动在 public.profiles 表中插入一条默认记录。注册 API 此前使用
--   INSERT 再次插入同一 user id，触发 profiles_pkey 唯一约束冲突。
--
-- 修复方案（双保险）：
--   1. 删除 auth.users 上自动创建 profiles 的触发器，避免重复创建
--   2. 应用层已由 INSERT 改为 UPSERT，即使有触发器也能兼容
-- =====================================================

-- 1) 列出 auth.users 上的触发器（供排查）
-- SELECT tgname, tgenabled
-- FROM pg_trigger
-- WHERE tgrelid = 'auth.users'::regclass
--   AND NOT tgisinternal;

-- 2) 删除常见的自动创建 profiles 触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_after_user ON auth.users;

-- 3) 删除对应触发器函数
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE;
