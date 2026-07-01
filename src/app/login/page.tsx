"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!supabase) {
      setError("Supabase 未配置，无法使用登录功能。请先配置环境变量。");
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setError("注册成功！请检查邮箱确认邮件，确认后登录。");
          setMode("login");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirect);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Prompt Hub
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "登录管理后台" : "注册新账号"}
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <div className={`rounded-lg p-3 text-sm ${
              error.includes("成功")
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "登录" : "注册"}
          </button>

          <div className="text-center text-sm">
            {mode === "login" ? (
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                没有账号？点击注册
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                已有账号？点击登录
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          注册后需要在 Supabase 中将角色设为 admin 才能访问管理后台
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
