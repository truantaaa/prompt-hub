import type { Prompt } from "@/lib/types";

/**
 * 初始 Mock 数据
 * 在没有配置 Supabase 时使用，方便快速预览效果
 */
export const mockPrompts: Prompt[] = [
  {
    id: "1",
    title: "小红书种草文案生成器",
    content: `你是一位资深小红书内容创作者，擅长撰写高互动的种草笔记。

请为以下产品撰写一篇小红书种草笔记：

产品名称：{{product_name}}
产品特点：{{features}}
目标人群：{{target_audience}}

要求：
1. 标题要有吸引力，包含 emoji，控制在 20 字以内
2. 正文 300-500 字，分段清晰
3. 包含 3-5 个使用场景描述
4. 结尾要有互动引导
5. 添加 5-8 个相关话题标签`,
    description: "输入产品信息，自动生成小红书风格的种草笔记，包含标题、正文和标签。",
    category: "marketing",
    model_type: "gpt-4o",
    difficulty: "intermediate",
    tags: ["小红书", "文案", "营销", "种草"],
    author_id: "u1",
    author_name: "营销小达人",
    views: 3280,
    likes: 456,
    rating_avg: 4.7,
    rating_count: 89,
    created_at: "2025-06-15T10:00:00Z",
    updated_at: "2025-06-20T14:30:00Z",
  },
  {
    id: "2",
    title: "代码 Review 助手",
    content: `你是一位高级软件工程师，精通代码审查。

请审查以下代码：

语言：{{language}}
代码：
\`\`\`{{language}}
{{code}}
\`\`\`

请从以下维度进行审查：
1. 代码规范性和可读性
2. 潜在的 Bug 和安全漏洞
3. 性能优化建议
4. 架构设计改进建议

输出格式：
- 问题等级：🔴 严重 / 🟡 建议 / 🟢 优化
- 每个问题附带修改示例`,
    description: "粘贴你的代码，AI 会从规范、安全、性能、架构四个维度给出审查意见。",
    category: "coding",
    model_type: "claude-3-sonnet",
    difficulty: "advanced",
    tags: ["代码审查", "编程", "质量保证"],
    author_id: "u2",
    author_name: "代码洁癖患者",
    views: 2150,
    likes: 312,
    rating_avg: 4.9,
    rating_count: 56,
    created_at: "2025-06-10T08:00:00Z",
    updated_at: "2025-06-18T16:00:00Z",
  },
  {
    id: "3",
    title: "周报一键生成器",
    content: `你是一位职场沟通专家，擅长将零散的工作内容整理成结构清晰的周报。

请根据以下信息生成本周工作周报：

本周完成的工作：
{{completed_tasks}}

进行中的工作：
{{ongoing_tasks}}

下周计划：
{{next_week_plans}}

遇到的困难：
{{challenges}}

要求：
1. 用 STAR 法则描述重要成果
2. 数据化表达，量化工作产出
3. 简洁专业，突出价值
4. 控制在 500 字以内`,
    description: "输入本周工作要点，自动生成结构化、数据化的职场周报。",
    category: "business",
    model_type: "universal",
    difficulty: "beginner",
    tags: ["周报", "职场", "效率"],
    author_id: "u3",
    author_name: "职场老司机",
    views: 5680,
    likes: 892,
    rating_avg: 4.8,
    rating_count: 203,
    created_at: "2025-06-05T09:00:00Z",
    updated_at: "2025-06-22T11:00:00Z",
  },
  {
    id: "4",
    title: "Midjourney 高级提示词构造器",
    content: `你是一位 Midjourney 提示词专家。

根据用户描述生成高质量的 Midjourney 提示词：

主题描述：{{subject}}
风格偏好：{{style}}
画面氛围：{{mood}}

生成要求：
1. 输出英文提示词
2. 包含主体描述、风格参考、光影、构图、相机参数
3. 添加合适的 --ar --v --style 参数
4. 提供 3 个变体版本
5. 每个版本附带简短的中文说明`,
    description: "描述你想要的画面，自动生成专业级 Midjourney 英文提示词，含 3 个变体。",
    category: "design",
    model_type: "midjourney",
    difficulty: "intermediate",
    tags: ["Midjourney", "设计", "AI绘画"],
    author_id: "u4",
    author_name: "AI艺术家",
    views: 4120,
    likes: 678,
    rating_avg: 4.6,
    rating_count: 134,
    created_at: "2025-06-08T12:00:00Z",
    updated_at: "2025-06-19T15:00:00Z",
  },
  {
    id: "5",
    title: "英语口语陪练教练",
    content: `你是一位友好的英语口语教练，擅长通过对话练习提高学生的英语口语能力。

当前练习主题：{{topic}}
学生英语水平：{{level}}

规则：
1. 用英语进行对话，根据学生水平调整词汇难度
2. 每轮对话不超过 3 句话
3. 如果学生犯错，用括号标注正确的表达方式
4. 每隔 5 轮总结学生的问题并给出改进建议
5. 鼓励学生，保持积极友好的语气

现在请开始对话，先问好并引出今天的话题。`,
    description: "选择话题和水平，AI 扮演口语教练与你实时对话练习，自动纠正错误。",
    category: "education",
    model_type: "gpt-4o",
    difficulty: "beginner",
    tags: ["英语", "口语", "教育", "练习"],
    author_id: "u5",
    author_name: "英语教练",
    views: 2890,
    likes: 401,
    rating_avg: 4.5,
    rating_count: 78,
    created_at: "2025-06-12T10:00:00Z",
    updated_at: "2025-06-21T09:00:00Z",
  },
  {
    id: "6",
    title: "产品需求文档（PRD）生成器",
    content: `你是一位资深产品经理，擅长撰写清晰、可执行的产品需求文档。

请根据以下信息生成 PRD：

产品名称：{{product_name}}
核心功能描述：{{core_feature}}
目标用户：{{target_users}}
竞品参考：{{competitors}}

PRD 结构要求：
1. 背景与目标
2. 用户画像与场景
3. 功能需求列表（含优先级 P0/P1/P2）
4. 非功能需求（性能、安全、兼容性）
5. 数据指标定义
6. 里程碑规划
7. 风险评估

输出为 Markdown 格式。`,
    description: "输入产品基本信息，自动生成包含 7 个模块的完整 PRD 文档。",
    category: "business",
    model_type: "claude-3-opus",
    difficulty: "advanced",
    tags: ["产品经理", "PRD", "文档", "规划"],
    author_id: "u6",
    author_name: "PM老王",
    views: 3450,
    likes: 523,
    rating_avg: 4.7,
    rating_count: 112,
    created_at: "2025-06-03T14:00:00Z",
    updated_at: "2025-06-22T10:00:00Z",
  },
];
