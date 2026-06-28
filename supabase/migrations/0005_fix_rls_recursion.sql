-- =====================================================
-- 修复 RLS 无限递归问题
-- ============================================
-- 问题原因：
--   "Admins can manage profiles" 策略在 profiles 表上
--   执行 SELECT ... FROM profiles，而 profiles 启用了 RLS，
--   导致策略自我引用、无限递归，波及所有有 admin 策略的表。
--
-- 修复方案：
--   1. 删除递归策略
--   2. 创建 SECURITY DEFINER 函数 is_admin() 绕过 RLS
--   3. 重建所有 admin 策略使用 is_admin()
-- =====================================================

-- 第一步：删除导致递归的策略
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

-- 第二步：创建 SECURITY DEFINER 函数判断是否管理员
-- SECURITY DEFINER 函数以函数所有者权限执行，绕过 RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 第三步：用 is_admin() 替换所有 admin 策略中的内联查询
-- 先删除旧的，再创建新的

-- companies
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (public.is_admin());

-- jobs
DROP POLICY IF EXISTS "Admins can manage jobs" ON jobs;
CREATE POLICY "Admins can manage jobs" ON jobs
  FOR ALL USING (public.is_admin());

-- posts
DROP POLICY IF EXISTS "Admins can manage posts" ON posts;
CREATE POLICY "Admins can manage posts" ON posts
  FOR ALL USING (public.is_admin());

-- questions
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (public.is_admin());

-- answers
DROP POLICY IF EXISTS "Admins can manage answers" ON answers;
CREATE POLICY "Admins can manage answers" ON answers
  FOR ALL USING (public.is_admin());

-- comments
DROP POLICY IF EXISTS "Admins can manage comments" ON comments;
CREATE POLICY "Admins can manage comments" ON comments
  FOR ALL USING (public.is_admin());

-- invite_codes
DROP POLICY IF EXISTS "Invite codes are manageable by admins" ON invite_codes;
CREATE POLICY "Invite codes are manageable by admins" ON invite_codes
  FOR ALL USING (public.is_admin());

-- reports
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (public.is_admin());
