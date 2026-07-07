import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 从 prompt 内容中提取变量占位符 {{variableName}}
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}

/**
 * 将 prompt 内容中的变量占位符替换为实际值
 */
export function fillVariables(
  content: string,
  variables: Record<string, string>
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

/**
 * 将变量名转换为中文标签
 * 优先查常用映射表，找不到则将下划线转空格并首字母大写
 */
const COMMON_LABELS: Record<string, string> = {
  product_name: "产品名称",
  product: "产品",
  features: "产品特点",
  target_audience: "目标人群",
  audience: "受众",
  topic: "话题",
  tone: "语气风格",
  language: "语言",
  word_count: "字数",
  length: "长度",
  style: "风格",
  target: "目标",
  goal: "目标",
  scenario: "场景",
  context: "上下文",
  role: "角色",
  expertise: "专业领域",
  format: "格式",
  keywords: "关键词",
  input: "输入内容",
  output: "输出要求",
  code: "代码",
  framework: "框架",
  platform: "平台",
  brand: "品牌",
  price: "价格",
  discount: "折扣",
  budget: "预算",
  deadline: "截止日期",
  industry: "行业",
  company: "公司",
  position: "职位",
  experience: "经验",
  skill: "技能",
  tool: "工具",
  version: "版本",
  data: "数据",
  url: "链接",
  question: "问题",
  answer: "答案",
  description: "描述",
  title: "标题",
  content_text: "内容",
  summary: "摘要",
  outline: "大纲",
  theme: "主题",
  color: "颜色",
  design: "设计",
  name: "名称",
  type: "类型",
  status: "状态",
  category: "分类",
  tag: "标签",
  location: "地点",
  city: "城市",
  country: "国家",
  time: "时间",
  date: "日期",
  duration: "时长",
  user: "用户",
  customer: "客户",
  market: "市场",
  competitor: "竞争对手",
  team_size: "团队规模",
  number: "数量",
  amount: "金额",
  percentage: "百分比",
  temperature: "温度参数",
  max_tokens: "最大Token数",
  model: "模型",
};

export function getVariableLabel(varName: string): string {
  if (COMMON_LABELS[varName]) return COMMON_LABELS[varName];
  // 下划线转空格，首字母大写
  return varName
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * 格式化数字（如 1200 -> 1.2k）
 */
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

/**
 * 格式化日期
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return date.toLocaleDateString("zh-CN");
}
