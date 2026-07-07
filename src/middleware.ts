import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 认证中间件
 * 保护 /admin 路径，只有登录的管理员/编辑可以访问
 * 如果 Supabase 环境变量未配置，允许访问（开发模式）
 */
export async function middleware(request: NextRequest) {
  // 只保护 /admin 路径
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase 未配置时允许访问（开发模式）
  if (!url || url === "https://your-project.supabase.co" || !key || key === "your-anon-key") {
    console.warn("[middleware] Supabase 未配置，允许访问 admin 路径（开发模式）");
    return NextResponse.next();
  }

  // 创建 Supabase 客户端检查会话
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // 未登录 → 跳转登录页
  if (!session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 检查用户角色
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  // 非管理员/编辑 → 返回无权限提示
  if (!profile || !["admin", "editor"].includes(profile.role)) {
    return new NextResponse("无权限访问，需要管理员或编辑角色", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
