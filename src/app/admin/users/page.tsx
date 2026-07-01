"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { mockPrompts } from "@/data/mock-prompts";
import { Loader2, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!supabase) {
      setUsers([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!supabase) {
      alert("Supabase 未配置，无法更新");
      return;
    }
    setUpdating(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } else {
      alert("更新失败: " + error.message);
    }
    setUpdating(null);
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">加载中...</div>;
  }

  const roleLabels: Record<string, string> = {
    admin: "管理员",
    editor: "编辑",
    user: "普通用户",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    editor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    user: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Shield className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
        角色说明：
        <span className="ml-2 text-red-500">管理员</span> - 可以管理所有提示词和用户角色
        <span className="ml-2 text-blue-500">编辑</span> - 可以创建和编辑提示词，不能管理用户
        <span className="ml-2 text-gray-500">普通用户</span> - 只能浏览和收藏
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">用户名</th>
              <th className="text-left px-4 py-3 font-medium">邮箱</th>
              <th className="text-left px-4 py-3 font-medium">注册时间</th>
              <th className="text-left px-4 py-3 font-medium">当前角色</th>
              <th className="text-left px-4 py-3 font-medium">修改角色</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.display_name || u.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.username}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${roleColors[u.role] || roleColors.user}`}>
                    {roleLabels[u.role] || "普通用户"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={updating === u.id}
                    className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="user">普通用户</option>
                    <option value="editor">编辑</option>
                    <option value="admin">管理员</option>
                  </select>
                  {updating === u.id && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
