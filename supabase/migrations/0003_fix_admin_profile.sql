-- 修复：添加新用户自动创建profile的触发器
-- 这个触发器在 auth.users 有新用户注册时，自动在 profiles 表创建记录

-- 1. 创建自动创建profile的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 创建触发器（如果不存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 为已存在但没有profile记录的用户补创建profile（关键！）
INSERT INTO public.profiles (id, email, nickname, role)
SELECT
  au.id,
  au.email,
  split_part(au.email, '@', 1) as nickname,
  'user' as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 4. 将指定邮箱设置为管理员（替换成你的邮箱）
-- 执行完上面语句后，再执行下面这行（把邮箱改成你的管理员邮箱）：
-- UPDATE public.profiles SET role = 'admin' WHERE email = '你的邮箱@example.com';
