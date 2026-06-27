-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  city TEXT DEFAULT '南昌',
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  invite_code_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邀请码表
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles
  ADD CONSTRAINT fk_invite_code
  FOREIGN KEY (invite_code_id) REFERENCES invite_codes(id);

-- 企业表
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT DEFAULT '南昌',
  industry TEXT,
  size TEXT,
  logo_url TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 岗位表
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  interview_rounds TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 经验帖表
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),
  type TEXT NOT NULL CHECK (type IN ('笔经', '面经')),
  tags TEXT[] DEFAULT '{}',
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  report_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 问答表
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'resolved', 'rejected')),
  report_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  is_best BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 互动表
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'answer', 'question')),
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知表
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'answer', 'follow')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 举报表
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'answer', 'comment', 'question')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 触发器：自动更新 posts.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 点赞数增减函数
CREATE OR REPLACE FUNCTION increment_likes(target_type TEXT, target_id UUID)
RETURNS VOID AS $$
BEGIN
  IF target_type = 'post' THEN
    UPDATE posts SET likes = likes + 1 WHERE id = target_id;
  ELSIF target_type = 'answer' THEN
    UPDATE answers SET likes = likes + 1 WHERE id = target_id;
  ELSIF target_type = 'question' THEN
    UPDATE questions SET likes = likes + 1 WHERE id = target_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes(target_type TEXT, target_id UUID)
RETURNS VOID AS $$
BEGIN
  IF target_type = 'post' THEN
    UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = target_id;
  ELSIF target_type = 'answer' THEN
    UPDATE answers SET likes = GREATEST(likes - 1, 0) WHERE id = target_id;
  ELSIF target_type = 'question' THEN
    UPDATE questions SET likes = GREATEST(likes - 1, 0) WHERE id = target_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建索引
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_company_id ON posts(company_id);
CREATE INDEX idx_posts_job_id ON posts(job_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_questions_author_id ON questions(author_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_comments_post ON comments(post_id);

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- invite_codes
CREATE POLICY "Invite codes are manageable by admins" ON invite_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- companies
CREATE POLICY "Published companies are viewable" ON companies
  FOR SELECT USING (status = 'published' OR auth.uid() = created_by);
CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- jobs
CREATE POLICY "Jobs of published companies are viewable" ON jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM companies WHERE id = jobs.company_id AND status = 'published')
    OR auth.uid() = created_by
  );
CREATE POLICY "Admins can manage jobs" ON jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- posts
CREATE POLICY "Published posts are viewable" ON posts
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "Authors can manage own posts" ON posts
  FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage posts" ON posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- questions
CREATE POLICY "Published questions are viewable" ON questions
  FOR SELECT USING (status IN ('published', 'resolved') OR auth.uid() = author_id);
CREATE POLICY "Authors can manage own questions" ON questions
  FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- answers
CREATE POLICY "Answers are viewable" ON answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM questions WHERE id = answers.question_id AND status IN ('published', 'resolved'))
    OR auth.uid() = author_id
  );
CREATE POLICY "Authors can manage own answers" ON answers
  FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage answers" ON answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- likes, bookmarks, comments
CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own comments" ON comments
  FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Comments are viewable" ON comments
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage comments" ON comments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- reports
CREATE POLICY "Reporters can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 插入初始南昌 IT 企业测试数据
INSERT INTO companies (name, city, industry, size, description, tags, status) VALUES
('江西用友', '南昌', '企业软件', '500人以上', '用友网络在南昌的分公司，主要做企业管理软件', '{"Java","ERP","企业服务"}', 'published'),
('江西思创数码', '南昌', '系统集成', '500人以上', '本地老牌IT企业，专注于智慧城市和系统集成', '{"系统集成","Java","智慧城市"}', 'published'),
('南昌腾讯云基地', '南昌', '互联网', '150-500人', '腾讯在南昌的云服务和产业互联网基地', '{"云计算","腾讯","互联网"}', 'published'),
('泰豪集团信息板块', '南昌', 'IT服务', '500人以上', '泰豪集团旗下信息技术板块，涉及智慧能源、智慧城市等', '{"Java","智慧能源","智慧城市"}', 'published'),
('江西联通产业互联网', '南昌', '运营商IT', '150-500人', '江西联通旗下产业互联网公司', '{"Java","云计算","运营商"}', 'published'),
('本地互联网创业公司', '南昌', '互联网', '15-50人', '南昌本地小型互联网创业团队，涵盖前端后端开发', '{"React","Vue","Node.js"}', 'published');
