"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, MODEL_LABELS, DIFFICULTY_LABELS, type Category, type ModelType, type Difficulty } from "@/lib/types";
import { extractVariables } from "@/lib/utils";

export default function NewPromptPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("writing");
  const [modelType, setModelType] = useState<ModelType>("universal");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [tags, setTags] = useState("");

  const variables = extractVariables(content);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("请填写标题和内容");
      return;
    }
    // 这里后续接入 Supabase 存储
    // 目前只是演示，保存后跳转首页
    console.log({
      title,
      description,
      content,
      category,
      modelType,
      difficulty,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      variables,
    });
    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>

      <h1 className="text-2xl font-bold">创建新提示词</h1>

      {/* 标题 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">标题 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给你的提示词起个名字..."
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">描述</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="简单描述这个提示词的用途..."
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* 分类 + 模型 + 难度 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">分类</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">适用模型</label>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as ModelType)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Object.entries(MODEL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">难度</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">标签（逗号分隔）</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="如：写作, 营销, 小红书"
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Prompt 内容编辑器 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">Prompt 内容 *</label>
          <span className="text-xs text-muted-foreground">
            使用 {"{{variable}}"} 语法定义变量
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          placeholder={`你是一位资深{{role}}，请帮我{{task}}...

要求：
1. ...
2. ...`}
          className="w-full rounded-lg border bg-background px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
        />
      </div>

      {/* 变量预览 */}
      {variables.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <span className="text-sm font-medium">检测到的变量：</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {variables.map((v) => (
              <code key={v} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {"{{"}{v}{"}}"}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4" />
          保存提示词
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          取消
        </Link>
      </div>
    </div>
  );
}
