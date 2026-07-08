-- ============================================
-- 更新 RLS 策略：让普通用户也能创建提示词
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 1. 删除旧的 prompts 策略
DROP POLICY IF EXISTS "prompts_insert_staff" ON public.prompts;
DROP POLICY IF EXISTS "prompts_update_staff" ON public.prompts;
DROP POLICY IF EXISTS "prompts_delete_admin" ON public.prompts;

-- 2. 创建新的策略：所有登录用户都能创建提示词
CREATE POLICY "prompts_insert_authenticated" ON public.prompts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. 创建新的策略：用户可以修改自己的提示词，admin/editor 可以修改所有
CREATE POLICY "prompts_update_own_or_staff" ON public.prompts
  FOR UPDATE USING (
    auth.uid() = author_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- 4. 创建新的策略：用户可以删除自己的提示词，admin/editor 可以删除所有
CREATE POLICY "prompts_delete_own_or_staff" ON public.prompts
  FOR DELETE USING (
    auth.uid() = author_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ============================================
-- 可选：把现有所有用户设为可正常使用（如果不是 admin/editor）
-- ============================================
-- UPDATE public.profiles SET role = 'user' WHERE role IS NULL;
