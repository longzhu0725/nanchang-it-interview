-- 允许管理员管理所有用户资料（修改角色、状态等）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Admins can manage profiles'
  ) THEN
    CREATE POLICY "Admins can manage profiles" ON profiles
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END
$$;
