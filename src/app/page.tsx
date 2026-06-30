"use client";

import { useState, useMemo, useEffect } from "react";
import { PromptCard } from "@/components/PromptCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { mockPrompts } from "@/data/mock-prompts";
import { createClient } from "@/lib/supabase-browser";
import type { Category, Prompt } from "@/lib/types";
import { Search, TrendingUp, Clock, ArrowUpDown } from "lucide-react";

type SortOption = "popular" | "newest" | "rating";

export default function HomePage() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortOption>("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        // 将 Supabase 数据转换为 Prompt 类型
        const mapped: Prompt[] = data.map((p: any) => ({
          ...p,
          author_name: p.author_id,
        }));
        // 获取作者信息
        const authorIds = Array.from(new Set(data.map((p: any) => p.author_id)));
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, username")
          .in("id", authorIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.display_name || p.username]));
        mapped.forEach((p) => {
          p.author_name = profileMap.get(p.author_id) || "匿名";
        });
        setPrompts(mapped);
      }
    } catch (err) {
      // Supabase 未配置时使用 Mock 数据
    }
    setLoading(false);
  };

  const filteredPrompts = useMemo(() => {
    let result: Prompt[] = [...prompts];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "popular":
        result.sort((a, b) => b.likes - a.likes);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
        result.sort((a, b) => b.rating_avg - a.rating_avg);
        break;
    }

    return result;
  }, [prompts, category, sort, searchQuery]);

  const sortOptions: { key: SortOption; label: string; icon: typeof TrendingUp }[] = [
    { key: "popular", label: "最多收藏", icon: TrendingUp },
    { key: "newest", label: "最新发布", icon: Clock },
    { key: "rating", label: "评分最高", icon: ArrowUpDown },
  ];

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">发现优质 AI 提示词</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          浏览、搜索、分享高质量的提示词，让 AI 更好地为你工作
        </p>
        <div className="max-w-xl mx-auto mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索提示词、标签、关键词..."
              className="w-full rounded-xl border bg-muted/50 py-3 pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </section>

      <section>
        <CategoryFilter selected={category} onSelect={setCategory} />
      </section>

      <section className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {loading ? "加载中..." : `共 ${filteredPrompts.length} 个提示词`}
        </span>
        <div className="flex items-center gap-1">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                onClick={() => setSort(option.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  sort === option.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">{loading ? "正在加载..." : "没有找到匹配的提示词"}</p>
        </div>
      )}
    </div>
  );
}
