# Prompt Hub - AI 提示词库

基于 Next.js 14 + Supabase 构建的 AI 提示词管理和分享平台。支持提示词浏览、搜索、变量填充、在线测试，以及完整的管理后台（多角色权限、CRUD）。

## 功能特性

### 前台
- 提示词浏览：卡片式展示，分类筛选、排序、全文搜索
- 变量系统：`{{variable}}` 语法定义变量，用户填入后一键测试
- 在线测试：直接调用 OpenAI API 测试 Prompt 效果
- 响应式 UI：支持深色模式

### 管理后台
- 仪表盘：统计概览（提示词数、浏览量、收藏数、用户数）
- 提示词管理：新建、编辑、删除、发布/草稿切换
- 用户管理：查看所有用户，修改角色（管理员/编辑/普通用户）
- 认证系统：邮箱注册登录，基于角色的访问控制

### 角色权限
- **管理员 (admin)**：管理所有提示词 + 管理用户角色
- **编辑 (editor)**：创建和编辑提示词，不能管理用户
- **普通用户 (user)**：浏览、收藏、评分

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) + Tailwind CSS |
| 后端 | Next.js API Routes + Supabase |
| 数据库 | Supabase (PostgreSQL + RLS) |
| 认证 | Supabase Auth (邮箱密码) |
| AI | OpenAI API (前端直调) |

## 快速开始

### 第一步：创建 Supabase 项目

1. 前往 [supabase.com](https://supabase.com) 注册并创建新项目
2. 进入项目 Dashboard → SQL Editor
3. 复制 `supabase/schema.sql` 的全部内容，粘贴执行
4. 进入 Settings → API，获取 URL 和 anon key

### 第二步：配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
OPENAI_API_KEY=sk-your-openai-api-key  # 可选，用于在线测试
```

### 第三步：安装并运行

```bash
npm install
npm run dev
```

访问 http://localhost:3000

> 不配置 Supabase 也能运行，前台会使用内置的 Mock 数据展示。管理后台和用户功能需要 Supabase。

### 第四步：创建管理员

1. 在网站点击"登录" → 切换到"注册" → 用邮箱注册一个账号
2. 回到 Supabase Dashboard → SQL Editor，执行：

```sql
UPDATE public.profiles SET role = 'admin' WHERE username = '你的邮箱前缀';
```

3. 重新访问网站，导航栏会出现"管理后台"入口

### 第五步：添加其他管理员

在管理后台 → 用户管理页面，找到目标用户，将角色下拉框改为"管理员"或"编辑"即可。

## 部署到 Vercel（免费，推荐）

1. 将代码推送到 GitHub 仓库
2. 前往 [vercel.com](https://vercel.com) 导入该仓库
3. 在 Environment Variables 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`（可选）
4. 点击 Deploy
5. 部署完成后，任何人都可以通过 Vercel 分配的域名访问

### 配置 Supabase 认证重定向

在 Supabase Dashboard → Authentication → URL Configuration 中，将 Vercel 域名添加到 Site URL 和 Redirect URLs。

## 项目结构

```
prompt-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 首页（提示词列表）
│   │   ├── globals.css             # 全局样式
│   │   ├── login/page.tsx          # 登录/注册页
│   │   ├── prompt/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # 详情页路由
│   │   │   │   └── PromptDetail.tsx# 详情页组件
│   │   │   └── new/page.tsx        # 创建提示词（前台）
│   │   └── admin/
│   │       ├── layout.tsx          # 管理后台布局（侧边栏）
│   │       ├── page.tsx            # 仪表盘
│   │       ├── prompts/
│   │       │   ├── page.tsx        # 提示词列表
│   │       │   ├── new/page.tsx    # 新建提示词
│   │       │   └── [id]/page.tsx   # 编辑提示词
│   │       └── users/page.tsx      # 用户管理
│   ├── components/
│   │   ├── Navbar.tsx              # 导航栏（含登录状态）
│   │   ├── PromptCard.tsx          # 提示词卡片
│   │   ├── CategoryFilter.tsx      # 分类筛选器
│   │   └── PromptTester.tsx        # 在线测试组件
│   ├── lib/
│   │   ├── types.ts                # 类型定义
│   │   ├── utils.ts                # 工具函数
│   │   ├── supabase-browser.ts     # Supabase 客户端（浏览器）
│   │   └── supabase-server.ts      # Supabase 客户端（服务端）
│   └── data/
│       └── mock-prompts.ts         # Mock 数据
├── supabase/
│   └── schema.sql                  # 完整数据库 Schema
├── middleware.ts                   # 认证中间件（保护 /admin）
└── .env.local.example              # 环境变量模板
```

## License

MIT
