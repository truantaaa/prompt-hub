"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { mockPrompts } from "@/data/mock-prompts";
import type { Prompt } from "@/lib/types";
import Link from "next/link";
import { FileText, Users, Eye, Heart, Plus, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalUsers: 0,
  });
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchUser().then(() => fetchData());
  }, []);

  const fetchUser = async () => {
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

  const fetchData = async () => {
    if (!supabase) {
      const allPrompts = mockPrompts;
      setStats({
        totalPrompts: allPrompts.length,
        totalViews: allPrompts.reduce((sum: number, p: Prompt) => sum + (p.views || 0), 0),
        totalLikes: allPrompts.reduce((sum: number, p: Prompt) => sum + (p.likes || 0), 0),
        totalUsers: 1,
      });
      setRecentPrompts(allPrompts.slice(0, 5));
      setLoading(false);
      return;
    }

    const isStaff = user?.role === 'admin' || user?.role === 'editor';
    
    let query = supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });
    
    // 普通用户只能看到自己的数据
    if (!isStaff && user) {
      query = query.eq("author_id", user.id);
    }

    const { data: prompts } = await query;
    
    let userCount = 0;
    if (isStaff) {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      userCount = count || 0;
    } else {
      userCount = 1;
    }

    const allPrompts = prompts || [];
    setStats({
      totalPrompts: allPrompts.length,
      totalViews: allPrompts.reduce((sum: number, p: Prompt) => sum + (p.views || 0), 0),
      totalLikes: allPrompts.reduce((sum: number, p: Prompt) => sum + (p.likes || 0), 0),
      totalUsers: userCount,
    });
    setRecentPrompts(allPrompts.slice(0, 5));
    setLoading(false);
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">加载中...</div>;
  }

  const statCards = [
    { label: "提示词总数", value: stats.totalPrompts, icon: FileText },
    { label: "总浏览量", value: stats.totalViews, icon: Eye },
    { label: "总收藏数", value: stats.totalLikes, icon: Heart },
    { label: "注册用户", value: stats.totalUsers, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <Link
          href="/admin/prompts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          新建提示词
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* 最近提示词 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4" />
          <h2 className="text-lg font-semibold">最近添加</h2>
        </div>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">标题</th>
                <th className="text-left px-4 py-3 font-medium">分类</th>
                <th className="text-left px-4 py-3 font-medium">浏览</th>
                <th className="text-left px-4 py-3 font-medium">收藏</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {recentPrompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    还没有提示词，点击右上角"新建提示词"开始添加
                  </td>
                </tr>
              ) : (
                recentPrompts.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium line-clamp-1">{p.title}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3">{p.views || 0}</td>
                    <td className="px-4 py-3">{p.likes || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-1.5 py-0.5 text-xs ${
                        p.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {p.is_published ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/prompts/${p.id}`}
                        className="text-primary hover:underline"
                      >
                        编辑
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
