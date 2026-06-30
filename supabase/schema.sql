-- ============================================
-- Prompt Hub 数据库 Schema v2
-- 支持：用户认证、角色管理、Prompt CRUD
-- ============================================

-- 用户表（扩展 Supabase auth.users）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 注册新用户时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 分类表
CREATE TABLE IF NOT EXISTS public.categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO public.categories (key, label, icon, sort_order) VALUES
  ('writing', '写作', 'PenLine', 1),
  ('coding', '编程', 'Code', 2),
  ('marketing', '营销', 'Megaphone', 3),
  ('design', '设计', 'Palette', 4),
  ('education', '教育', 'GraduationCap', 5),
  ('business', '商业', 'Briefcase', 6),
  ('other', '其他', 'Sparkles', 7)
ON CONFLICT (key) DO NOTHING;

-- Prompt 表
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL REFERENCES public.categories(key),
  model_type TEXT NOT NULL DEFAULT 'universal',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏表
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 评分表
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_author ON public.prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_likes ON public.prompts(likes DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_rating ON public.prompts(rating_avg DESC);

-- ============================================
-- 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 评分自动更新
CREATE OR REPLACE FUNCTION update_prompt_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.prompts
  SET
    rating_avg = (
      SELECT COALESCE(AVG(score), 0)
      FROM public.ratings
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    )
  WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ratings_insert_update
  AFTER INSERT OR UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION update_prompt_rating();

CREATE TRIGGER ratings_delete
  AFTER DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION update_prompt_rating();

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 判断是否为管理员/编辑
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- profiles 策略
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.is_staff());

-- prompts 策略
-- 所有人可读已发布的
CREATE POLICY "prompts_select_published" ON public.prompts
  FOR SELECT USING (is_published = true OR public.is_staff());
-- 管理员/编辑可创建
CREATE POLICY "prompts_insert_staff" ON public.prompts
  FOR INSERT WITH CHECK (public.is_staff());
-- 管理员/编辑可修改
CREATE POLICY "prompts_update_staff" ON public.prompts
  FOR UPDATE USING (public.is_staff());
-- 管理员可删除
CREATE POLICY "prompts_delete_admin" ON public.prompts
  FOR DELETE USING (public.is_staff());

-- favorites 策略
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ratings 策略
CREATE POLICY "ratings_select_all" ON public.ratings
  FOR SELECT USING (true);
CREATE POLICY "ratings_insert_own" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update_own" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 初始数据：插入示例 Prompt
-- 需要先注册一个账号，然后把下面的 author_id 替换为你的用户 ID
-- 或者通过管理后台手动添加
-- ============================================

-- ============================================
-- 管理员设置说明：
-- 1. 先在前台注册一个账号
-- 2. 在 Supabase Dashboard 的 SQL Editor 中执行：
--    UPDATE public.profiles SET role = 'admin' WHERE username = '你的用户名';
-- 3. 重新登录即可使用管理后台
-- ============================================
