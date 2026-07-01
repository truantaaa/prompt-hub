import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase 浏览器客户端
 * 用于客户端组件中的数据操作
 * 如果环境变量未配置，返回 null（使用 mock 数据模式）
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === "https://your-project.supabase.co" || !key || key === "your-anon-key") {
    console.warn("Supabase 环境变量未配置，使用 mock 数据模式");
    return null as any;
  }

  return createBrowserClient(url, key);
}
