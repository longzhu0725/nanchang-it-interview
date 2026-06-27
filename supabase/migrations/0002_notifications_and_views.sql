-- 迁移 0002: 通知触发器、浏览量统计、Storage 策略说明

-- 自动创建通知的触发器函数
CREATE OR REPLACE FUNCTION create_notification_on_like()
RETURNS TRIGGER AS $$
DECLARE
  target_author_id UUID;
  target_title TEXT;
  notif_content TEXT;
BEGIN
  -- 获取被点赞内容的作者
  IF NEW.target_type = 'post' THEN
    SELECT author_id, title INTO target_author_id, target_title FROM posts WHERE id = NEW.target_id;
    notif_content := '有人点赞了你的面经《' || COALESCE(target_title, '') || '》';
  ELSIF NEW.target_type = 'answer' THEN
    SELECT author_id INTO target_author_id FROM answers WHERE id = NEW.target_id;
    notif_content := '有人点赞了你的回答';
  ELSIF NEW.target_type = 'question' THEN
    SELECT author_id, title INTO target_author_id, target_title FROM questions WHERE id = NEW.target_id;
    notif_content := '有人点赞了你的问题《' || COALESCE(target_title, '') || '》';
  END IF;

  IF target_author_id IS NOT NULL AND target_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, content, link)
    VALUES (
      target_author_id,
      'like',
      notif_content,
      CASE NEW.target_type
        WHEN 'post' THEN '/posts/' || NEW.target_id
        WHEN 'answer' THEN '/questions/' || (SELECT question_id FROM answers WHERE id = NEW.target_id)
        WHEN 'question' THEN '/questions/' || NEW.target_id
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_notification_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_title TEXT;
BEGIN
  SELECT author_id, title INTO post_author_id, post_title FROM posts WHERE id = NEW.post_id;

  IF post_author_id IS NOT NULL AND post_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, content, link)
    VALUES (
      post_author_id,
      'comment',
      '有人评论了你的面经《' || COALESCE(post_title, '') || '》',
      '/posts/' || NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_notification_on_answer()
RETURNS TRIGGER AS $$
DECLARE
  question_author_id UUID;
  question_title TEXT;
BEGIN
  SELECT author_id, title INTO question_author_id, question_title FROM questions WHERE id = NEW.question_id;

  IF question_author_id IS NOT NULL AND question_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, type, content, link)
    VALUES (
      question_author_id,
      'answer',
      '有人回答了你的问题《' || COALESCE(question_title, '') || '》',
      '/questions/' || NEW.question_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_notify_on_like ON likes;
CREATE TRIGGER trigger_notify_on_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_like();

DROP TRIGGER IF EXISTS trigger_notify_on_comment ON comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_comment();

DROP TRIGGER IF EXISTS trigger_notify_on_answer ON answers;
CREATE TRIGGER trigger_notify_on_answer
  AFTER INSERT ON answers
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_answer();

-- 浏览量递增函数
CREATE OR REPLACE FUNCTION increment_views(target_type TEXT, target_id UUID)
RETURNS VOID AS $$
BEGIN
  IF target_type = 'post' THEN
    UPDATE posts SET views = views + 1 WHERE id = target_id;
  ELSIF target_type = 'question' THEN
    UPDATE questions SET views = views + 1 WHERE id = target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为 answers 表添加 is_anonymous 的更新权限（用户可编辑自己的回答匿名状态）
-- 已在初始迁移的 "Authors can manage own answers" 策略中覆盖

-- 创建索引优化通知查询
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

-- Storage Bucket 说明：
-- 请在 Supabase Dashboard 中手动创建以下 Storage Bucket：
-- 1. "avatars" - 用于存储用户头像（公开读）
-- 2. "images" - 用于存储帖子/问题中的图片（公开读）
--
-- Avatars bucket 的 RLS 策略建议：
-- INSERT: auth.uid() = (storage.foldername(name))[1]::uuid  (用户只能上传到自己的文件夹)
-- SELECT: true  (公开读)
-- UPDATE/DELETE: auth.uid() = (storage.foldername(name))[1]::uuid
