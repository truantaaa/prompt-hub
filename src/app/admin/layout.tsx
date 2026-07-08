"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      // Supabase 未配置，允许访问 admin（开发模式）
      setUser({ role: "admin", display_name: "开发者", username: "dev" });
      setLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?redirect=/admin");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    setUser(profile);
    setLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) {
      router.push("/");
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

    const isAdmin = user?.role === "admin";
    const isEditor = user?.role === "editor";
    const isStaff = isAdmin || isEditor;

    const navItems = [
      { href: "/admin", label: isStaff ? "仪表盘" : "我的提示词", icon: LayoutDashboard },
      { href: "/admin/prompts", label: "提示词管理", icon: FileText },
      ...(isAdmin
        ? [{ href: "/admin/users", label: "用户管理", icon: Users }]
        : []),
    ];

    return (
      <div className="flex gap-6">
        {/* 侧边栏 */}
        <aside className="w-56 shrink-0 space-y-1">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground">{isStaff ? "管理后台" : "个人中心"}</p>
            <p className="text-sm font-medium">{user?.display_name || user?.username}</p>
            <span className={`inline-block mt-1 rounded px-1.5 py-0.5 text-xs ${
              isAdmin 
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : isEditor
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}>
              {isAdmin ? "管理员" : isEditor ? "编辑" : "用户"}
            </span>
          </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 border-t mt-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <ExternalLink className="h-4 w-4" />
            查看网站
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
