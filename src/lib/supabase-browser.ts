import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase 浏览器客户端
 * 用于客户端组件中的数据操作
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
