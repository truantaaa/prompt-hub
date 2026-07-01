"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Search, Plus, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    checkUser();
  }, []);

  const checkUser = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setUser(profile);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const isStaff = user && ["admin", "editor"].includes(user.role);

  const navItems = [
    { href: "/", label: "探索" },
    { href: "/?sort=popular", label: "热门" },
    { href: "/?sort=newest", label: "最新" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Prompt Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent",
                pathname === item.href && "bg-accent"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索提示词..."
              className="w-full rounded-lg border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value;
                  window.location.href = `/?q=${encodeURIComponent(value)}`;
                }
              }}
            />
          </div>
        </div>

        {isStaff ? (
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">管理后台</span>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">退出</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">登录</span>
          </Link>
        )}
      </div>
    </header>
  );
}
