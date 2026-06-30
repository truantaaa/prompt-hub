// TypeScript 类型定义

export type Category =
  | "writing"
  | "coding"
  | "marketing"
  | "design"
  | "education"
  | "business"
  | "other";

export type ModelType =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-3.5-turbo"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "midjourney"
  | "dall-e-3"
  | "universal";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  category: Category;
  model_type: ModelType;
  difficulty: Difficulty;
  tags: string[];
  author_id: string;
  author_name: string;
  views: number;
  likes: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromptWithVariables extends Prompt {
  variables: string[];
}

export interface CategoryMeta {
  key: Category;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "writing", label: "写作", icon: "PenLine" },
  { key: "coding", label: "编程", icon: "Code" },
  { key: "marketing", label: "营销", icon: "Megaphone" },
  { key: "design", label: "设计", icon: "Palette" },
  { key: "education", label: "教育", icon: "GraduationCap" },
  { key: "business", label: "商业", icon: "Briefcase" },
  { key: "other", label: "其他", icon: "Sparkles" },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  writing: "写作",
  coding: "编程",
  marketing: "营销",
  design: "设计",
  education: "教育",
  business: "商业",
  other: "其他",
};

export const MODEL_LABELS: Record<ModelType, string> = {
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "claude-3-opus": "Claude 3 Opus",
  "claude-3-sonnet": "Claude 3 Sonnet",
  "claude-3-haiku": "Claude 3 Haiku",
  midjourney: "Midjourney",
  "dall-e-3": "DALL-E 3",
  universal: "通用",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
};
