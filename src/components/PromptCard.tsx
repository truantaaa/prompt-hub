"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  Heart,
  Star,
  Copy,
  Check,
  Tag,
} from "lucide-react";
import type { Prompt } from "@/lib/types";
import { CATEGORY_LABELS, MODEL_LABELS, DIFFICULTY_LABELS } from "@/lib/types";
import { formatNumber, formatDate, cn } from "@/lib/utils";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function PromptCard({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <Link href={`/prompt/${prompt.id}`} className="group block">
      <div className="flex flex-col rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
        {/* 头部：分类 + 难度 */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {CATEGORY_LABELS[prompt.category]}
          </span>
          <span className={cn(
            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
            difficultyColors[prompt.difficulty]
          )}>
            {DIFFICULTY_LABELS[prompt.difficulty]}
          </span>
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-base mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
          {prompt.title}
        </h3>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {prompt.description}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>

        {/* 底部：作者 + 统计 + 操作 */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/60 to-primary/30 flex items-center justify-center text-xs font-medium text-primary-foreground">
              {prompt.author_name[0]}
            </div>
            <span className="text-xs text-muted-foreground">{prompt.author_name}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {prompt.rating_avg.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(prompt.views)}
            </span>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-red-500 text-red-500")} />
              {formatNumber(prompt.likes + (liked ? 1 : 0))}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* 模型类型 + 日期 */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground/70">
          <span>{MODEL_LABELS[prompt.model_type]}</span>
          <span>{formatDate(prompt.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
