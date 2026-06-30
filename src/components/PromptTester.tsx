"use client";

import { useState, useMemo } from "react";
import { Play, Copy, Check, Loader2, Variable, Key, Settings } from "lucide-react";
import { extractVariables, fillVariables } from "@/lib/utils";

interface PromptTesterProps {
  content: string;
}

export function PromptTester({ content }: PromptTesterProps) {
  const variables = useMemo(() => extractVariables(content), [content]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");

  const finalPrompt = useMemo(() => {
    return fillVariables(content, variableValues);
  }, [content, variableValues]);

  const handleTest = async () => {
    setLoading(true);
    setResult("");
    try {
      if (!apiKey.trim()) {
        // 模拟模式：没有 API key 时返回模拟结果
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setResult(
          `[模拟回复] 这是根据你的 Prompt 生成的示例回复。\n\n你输入的 Prompt 是：\n\n${finalPrompt}\n\n（配置 OpenAI API Key 后可获得真实 AI 回复）\n\n示例输出：\n\n根据你的需求，我可以为你提供以下建议...\n\n1. 首先分析核心需求\n2. 梳理关键要素\n3. 提供具体方案\n\n希望对你有帮助！`
        );
        setLoading(false);
        return;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: finalPrompt }],
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setResult(`❌ 错误: ${data.error?.message || "请求失败"}`);
      } else {
        setResult(data.choices?.[0]?.message?.content || "（空响应）");
      }
    } catch (err: any) {
      setResult(`❌ 请求失败: ${err?.message || "请检查网络连接"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* API Key 配置 */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">API 配置</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              OpenAI API Key（可选，留空使用模拟模式）
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-md border bg-background px-3 py-1.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? "隐藏" : "显示"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>
        </div>
      </div>

      {/* 变量输入区 */}
      {variables.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Variable className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">变量填充</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variables.map((varName) => (
              <div key={varName}>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {"{{"}{varName}{"}}"}
                </label>
                <input
                  type="text"
                  value={variableValues[varName] || ""}
                  onChange={(e) =>
                    setVariableValues((prev) => ({
                      ...prev,
                      [varName]: e.target.value,
                    }))
                  }
                  placeholder={`输入 ${varName}...`}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最终 prompt 预览 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">最终 Prompt 预览</span>
          <button
            onClick={handleTest}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {loading ? "测试中..." : "测试效果"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm font-mono max-h-48 overflow-y-auto">
          {finalPrompt}
        </pre>
      </div>

      {/* AI 回复结果 */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI 回复</span>
            <button
              onClick={handleCopyResult}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-accent transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          <div className="whitespace-pre-wrap rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4 text-sm max-h-96 overflow-y-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
