"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { CATEGORIES, CATEGORY_LABELS, MODEL_LABELS, DIFFICULTY_LABELS, type Category, type ModelType, type Difficulty } from "@/lib/types";
import { extractVariables } from "@/lib/utils";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewPromptPage() {
  const router = useRouter();
  const supabase = createClient();
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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("prompts")
      .insert({
        title: form.title,
        description: form.description,
        content: form.content,
        category: form.category,
        model_type: form.model_type,
        difficulty: form.difficulty,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: form.is_published,
        author_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      router.push("/admin/prompts");
      router.refresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/prompts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <h1 className="text-2xl font-bold">新建提示词</h1>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">标题 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="提示词名称..."
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">描述</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="简单描述用途..."
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">分类</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">模型</label>
            <select
              value={form.model_type}
              onChange={(e) => setForm({ ...form, model_type: e.target.value as ModelType })}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(MODEL_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">难度</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">标签（逗号分隔）</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="如：写作, 营销, 小红书"
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium">Prompt 内容 *</label>
            <span className="text-xs text-muted-foreground">使用 {"{{variable}}"} 语法定义变量</span>
          </div>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            placeholder="输入 Prompt 内容..."
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20 resize-y"
          />
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
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">立即发布（取消则保存为草稿）</span>
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存
          </button>
          <Link href="/admin/prompts" className="inline-flex items-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm hover:bg-accent">
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
