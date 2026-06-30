"use client";

import { notFound } from "next/navigation";
import { mockPrompts } from "@/data/mock-prompts";
import { PromptTester } from "@/components/PromptTester";
import { CATEGORY_LABELS, MODEL_LABELS, DIFFICULTY_LABELS } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";
import {
  Eye, Heart, Star, Copy, Check, Tag, Calendar, User, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function PromptDetail({ id }: { id: string }) {
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, [id]);

  const fetchPrompt = async () => {
    // 先尝试从 Supabase 获取
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        // 获取作者信息
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", data.author_id)
          .single();
        setPrompt({
          ...data,
          author_name: profile?.display_name || profile?.username || "匿名",
        });
        setLoading(false);
        return;
      }
    } catch (err) {
      // 回退到 Mock 数据
    }
    // Mock 数据回退
    const mock = mockPrompts.find((p) => p.id === id);
    setPrompt(mock || null);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">加载中...</div>;
  if (!prompt) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
            {CATEGORY_LABELS[prompt.category as keyof typeof CATEGORY_LABELS] || prompt.category}
          </span>
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
            {DIFFICULTY_LABELS[prompt.difficulty as keyof typeof DIFFICULTY_LABELS] || prompt.difficulty}
          </span>
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
            {MODEL_LABELS[prompt.model_type as keyof typeof MODEL_LABELS] || prompt.model_type}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{prompt.title}</h1>
        <p className="text-muted-foreground text-lg">{prompt.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-3">
        <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{prompt.author_name}</span>
        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(prompt.created_at)}</span>
        <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{formatNumber(prompt.views || 0)} 次浏览</span>
        <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{(prompt.rating_avg || 0).toFixed(1)} ({prompt.rating_count || 0} 评分)</span>
        <button onClick={() => setLiked(!liked)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors ml-auto">
          <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          {formatNumber((prompt.likes || 0) + (liked ? 1 : 0))}
        </button>
        <button onClick={handleCopy} className="flex items-center gap-1.5 hover:text-primary transition-colors">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(prompt.tags || []).map((tag: string) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
            <Tag className="h-3 w-3" />{tag}
          </span>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Prompt 内容</h2>
        <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-6 text-sm font-mono leading-relaxed">{prompt.content}</pre>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">在线测试</h2>
        <div className="rounded-xl border p-6">
          <PromptTester content={prompt.content} />
        </div>
      </div>
    </div>
  );
}
