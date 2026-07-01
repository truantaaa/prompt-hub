import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase 服务端客户端
 * 用于 Server Components 和 Server Actions
 * 如果环境变量未配置，返回 null（使用 mock 数据模式）
 */
export function createServerClientInstance() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === "https://your-project.supabase.co" || !key || key === "your-anon-key") {
    console.warn("Supabase 环境变量未配置，使用 mock 数据模式");
    return null as any;
  }

  const cookieStore = cookies();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // 在 Server Component 中调用 setAll 会被忽略
            // 因为它只能在 Server Action 或 Route Handler 中使用
          }
        },
      },
    }
  );
}
