"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { CATEGORIES, CATEGORY_LABELS, MODEL_LABELS, DIFFICULTY_LABELS, type Category, type ModelType, type Difficulty } from "@/lib/types";
import { extractVariables } from "@/lib/utils";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditPromptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "writing" as Category,
    model_type: "universal" as ModelType,
    difficulty: "beginner" as Difficulty,
    tags: "",
    is_published: true,
  });

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    if (!supabase) {
      setError("Supabase 未配置，无法编辑");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error || !data) {
      setError("提示词不存在");
      setLoading(false);
      return;
    }
    setForm({
      title: data.title,
      description: data.description || "",
      content: data.content,
      category: data.category,
      model_type: data.model_type,
      difficulty: data.difficulty,
      tags: (data.tags || []).join(", "),
      is_published: data.is_published,
    });
    setLoading(false);
  };

  const variables = extractVariables(form.content);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("标题和内容不能为空");
      return;
    }
    setSaving(true);
    setError("");

    if (!supabase) {
      setError("Supabase 未配置，无法保存");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("prompts")
      .update({
        title: form.title,
        description: form.description,
        content: form.content,
        category: form.category,
        model_type: form.model_type,
        difficulty: form.difficulty,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      router.push("/admin/prompts");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!supabase) {
      alert("Supabase 未配置，无法删除");
      return;
    }
    if (!confirm("确定删除？此操作不可撤销。")) return;
    const { error } = await supabase.from("prompts").delete().eq("id", params.id);
    if (!error) {
      router.push("/admin/prompts");
      router.refresh();
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">加载中...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/prompts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">编辑提示词</h1>
        <button onClick={handleDelete} className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:underline">
          <Trash2 className="h-4 w-4" />
          删除
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">标题 *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">描述</label>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">分类</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">模型</label>
            <select value={form.model_type} onChange={(e) => setForm({ ...form, model_type: e.target.value as ModelType })}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
              {Object.entries(MODEL_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">难度</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
              {Object.entries(DIFFICULTY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">标签（逗号分隔）</label>
          <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Prompt 内容 *</label>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12}
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20 resize-y" />
        </div>
        {variables.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <span className="text-sm font-medium">检测到的变量：</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {variables.map((v) => (
                <code key={v} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{"{{"}{v}{"}}"}</code>
              ))}
            </div>
          </div>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
          <span className="text-sm">已发布</span>
        </label>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存
          </button>
          <Link href="/admin/prompts" className="inline-flex items-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm hover:bg-accent">取消</Link>
        </div>
      </div>
    </div>
  );
}
