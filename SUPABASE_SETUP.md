# Supabase 接入指南

## 概述

Prompt Hub 使用 Supabase 作为后端数据库和认证服务。接入后你将获得：

- ✅ 用户注册/登录/认证
- ✅ 提示词的增删改查（CRUD）
- ✅ 管理员权限控制
- ✅ 收藏、评分功能
- ✅ 多用户数据共享

## 快速开始（3 步）

### 第 1 步：创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project" 注册/登录
3. 点击 "New project" 创建新项目
   - 选择 Organization（可新建）
   - 输入 Project name（如 `prompt-hub`）
   - 选择 Region（推荐离你最近的）
   - Database Password 自动生成或自定义
   - 点击 "Create new project"
4. 等待约 1-2 分钟项目初始化完成

### 第 2 步：获取 API 凭证

1. 项目创建完成后，进入 Dashboard
2. 左侧菜单 → **Project Settings** → **API**
3. 复制以下两项：
   - **Project URL**（如 `https://xxxxxx.supabase.co`）
   - **anon public**（以 `eyJ...` 开头的长字符串）
4. 将这两项填入项目根目录的 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...你的-anon-key
```

> ⚠️ 注意：`.env.local` 已在 `.gitignore` 中，不会提交到 GitHub，请放心填写。

### 第 3 步：创建数据库表

1. 在 Supabase Dashboard 左侧菜单 → **SQL Editor** → **New query**
2. 打开项目中的 `supabase/schema.sql` 文件，复制全部内容
3. 粘贴到 SQL Editor，点击 **Run**
4. 等待执行完成（约几秒），表就创建好了

## 配置管理员账号

1. 在浏览器中访问你的本地网站 `http://localhost:3000`
2. 点击导航栏右侧的 "登录"，切换到 "注册" 模式
3. 用邮箱注册一个新账号（不需要真实邮箱，如 `admin@example.com`）
4. 注册后回到 Supabase Dashboard → **Table Editor** → **profiles** 表
5. 找到你刚注册的用户，将 `role` 字段从 `user` 改为 `admin`
6. 回到网站重新登录，即可访问 `/admin` 管理后台

## 常见问题

### Q: 免费版够用吗？
**A:** 完全够用。免费版提供 500MB 数据库和 1GB 存储，对于个人项目绰绰有余。

### Q: 环境变量填错了怎么办？
**A:** 修改 `.env.local` 文件后，需要重启 `npm run dev` 才能生效。

### Q: 可以支持多个管理员吗？
**A:** 可以。只需在 profiles 表中把多个用户的 role 设为 `admin` 或 `editor` 即可。

### Q: 部署到 Netlify 后需要重新配置吗？
**A:** 是的。在 Netlify 的 Site Settings → Environment variables 中添加同样的环境变量，或者把 `.env.local` 的内容填入。

### Q: 注册时提示 "Error: Email rate limit exceeded"？
**A:** Supabase 免费版对邮件发送有限制。可以暂时关闭邮箱确认（Supabase Dashboard → Authentication → Settings → Enable email confirmations: 关闭）。

## 技术说明

### 数据库 Schema

```
profiles      - 用户资料表（扩展 Supabase auth.users）
prompts       - 提示词内容表
categories    - 分类表（内置 7 个分类）
favorites     - 收藏表
ratings       - 评分表
```

### RLS 安全策略

所有表已启用 Row Level Security：
- 所有人可读已发布的提示词
- 只有管理员/编辑可以创建、修改、删除提示词
- 用户只能操作自己的收藏和评分
- 管理员可以在管理后台管理所有内容

### 自动触发器

- 注册新用户时自动创建 profile 记录
- 更新提示词时自动更新 updated_at
- 评分时自动计算并更新平均分和评分人数

## 本地开发模式（无 Supabase）

如果你暂时不想接入 Supabase，项目也支持纯本地运行：
- 使用 Mock 数据展示提示词
- Admin 页面允许访问（开发模式）
- 注册/登录功能提示未配置（但不影响浏览）

只需保持 `.env.local` 中的默认值不变即可。

---

如有问题，可以参考 Supabase 官方文档：[https://supabase.com/docs](https://supabase.com/docs)
