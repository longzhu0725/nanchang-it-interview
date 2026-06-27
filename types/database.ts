export type Database = any

export type Profile = {
  id: string
  email: string
  nickname: string | null
  avatar_url: string | null
  city: string | null
  company: string | null
  role: 'user' | 'admin'
  invite_code_id: string | null
  created_at: string
}

export type Company = {
  id: string
  name: string
  city: string
  industry: string | null
  size: string | null
  logo_url: string | null
  description: string | null
  tags: string[]
  status: 'pending' | 'published' | 'rejected'
  created_by: string | null
  created_at: string
}

export type Job = {
  id: string
  company_id: string
  title: string
  category: string
  description: string | null
  interview_rounds: string | null
  tags: string[]
  created_by: string | null
  created_at: string
}

export type Post = {
  id: string
  title: string
  content: string
  author_id: string
  company_id: string | null
  job_id: string | null
  type: '笔经' | '面经'
  tags: string[]
  difficulty: number | null
  views: number
  likes: number
  status: 'pending' | 'published' | 'rejected'
  report_count: number
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  title: string
  content: string
  author_id: string
  company_id: string | null
  job_id: string | null
  tags: string[]
  views: number
  status: 'pending' | 'published' | 'resolved' | 'rejected'
  report_count: number
  is_anonymous: boolean
  created_at: string
}

export type Answer = {
  id: string
  question_id: string
  content: string
  author_id: string
  likes: number
  is_best: boolean
  is_anonymous: boolean
  created_at: string
}

export type Comment = {
  id: string
  post_id: string
  content: string
  author_id: string
  created_at: string
}

export type Like = {
  id: string
  user_id: string
  target_type: 'post' | 'answer' | 'question'
  target_id: string
  created_at: string
}

export type Bookmark = {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'answer' | 'follow'
  content: string
  is_read: boolean
  link: string | null
  created_at: string
}

export type Report = {
  id: string
  reporter_id: string
  target_type: 'post' | 'answer' | 'comment' | 'question'
  target_id: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
}

export type InviteCode = {
  id: string
  code: string
  is_used: boolean
  used_by: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
}
