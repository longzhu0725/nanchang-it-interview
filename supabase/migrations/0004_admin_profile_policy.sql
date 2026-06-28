-- 允许管理员管理所有用户资料（修改角色、状态等）
CREATE POLICY IF NOT EXISTS "Admins can manage profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
