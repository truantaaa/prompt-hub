"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Play, Copy, Check, Loader2, Key, Plus, X, Edit3, Eye,
} from "lucide-react";
import { extractVariables, fillVariables, getVariableLabel } from "@/lib/utils";

interface PromptTesterProps {
  content: string;
}

export function PromptTester({ content }: PromptTesterProps) {
  const extractedVars = useMemo(() => extractVariables(content), [content]);

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [customVars, setCustomVars] = useState<string[]>([]);
  const [newVarName, setNewVarName] = useState("");
  const [showAddVar, setShowAddVar] = useState(false);

  const [editedPrompt, setEditedPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("LongCat-2.0");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const allVars = useMemo(() => {
    const combined = [...extractedVars];
    for (const cv of customVars) {
      if (!combined.includes(cv)) combined.push(cv);
    }
    return combined;
  }, [extractedVars, customVars]);

  const finalPrompt = useMemo(() => {
    // 先填充原始 prompt 中的变量占位符
    let result = fillVariables(content, variableValues);
    // 再替换自定义变量中可能存在的占位符（保险）
    for (const cv of customVars) {
      if (extractedVars.includes(cv)) {
        const val = variableValues[cv];
        if (val) {
          result = result.replace(new RegExp(`\\{\\{${cv}\\}\\}`, "g"), val);
        }
      }
    }
    // 自定义变量（原始 prompt 中不存在的）追加到末尾
    const customVarLines = customVars
      .filter((cv) => !extractedVars.includes(cv))
      .map((cv) => {
        const val = variableValues[cv];
        return val ? `${getVariableLabel(cv)}: ${val}` : `{{${cv}}}`;
      })
      .filter(Boolean);
    if (customVarLines.length > 0) {
      result += "\n\n---\n" + customVarLines.join("\n");
    }
    return result;
  }, [content, variableValues, customVars, extractedVars]);

  useEffect(() => {
    if (!isEditing) {
      setEditedPrompt(finalPrompt);
    }
  }, [finalPrompt, isEditing]);

  const handleVarChange = (varName: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [varName]: value }));
  };

  const handleAddCustomVar = () => {
    const name = newVarName.trim().replace(/[{}]/g, "");
    if (name && !allVars.includes(name)) {
      setCustomVars((prev) => [...prev, name]);
      setNewVarName("");
      setShowAddVar(false);
    }
  };

  const handleRemoveCustomVar = (varName: string) => {
    setCustomVars((prev) => prev.filter((v) => v !== varName));
    setVariableValues((prev) => {
      const next = { ...prev };
      delete next[varName];
      return next;
    });
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(isEditing ? editedPrompt : finalPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleTest = async () => {
    const promptToSend = isEditing ? editedPrompt : finalPrompt;
    if (!apiKey.trim()) {
      setError("请输入 LongCat API Key");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch(
        "https://api.longcat.chat/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: promptToSend }],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error?.message || `请求失败: ${response.status}`);
        return;
      }
      setResult(data.choices?.[0]?.message?.content || "无返回内容");
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key & Model */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">LongCat API 配置</span>
        </div>
        <div className="flex gap-2">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入 LongCat API Key"
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            {showApiKey ? "隐藏" : "显示"}
          </button>
        </div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="LongCat-2.0">LongCat-2.0（美团万亿参数大模型）</option>
          <option value="LongCat-Flash">LongCat-Flash（快速版）</option>
        </select>
      </div>

      {/* Variable Inputs */}
      {allVars.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">变量填充</span>
            <button
              onClick={() => setShowAddVar(!showAddVar)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="h-3 w-3" />
              添加变量
            </button>
          </div>

          {showAddVar && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomVar()}
                placeholder="变量名（如 custom_field）"
                className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm"
              />
              <button
                onClick={handleAddCustomVar}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
              >
                确认
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {allVars.map((varName) => {
              const isCustom = customVars.includes(varName);
              return (
                <div key={varName} className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {getVariableLabel(varName)}
                    <code className="rounded bg-muted px-1 text-[10px]">{`{{${varName}}}`}</code>
                    {isCustom && (
                      <button
                        onClick={() => handleRemoveCustomVar(varName)}
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={variableValues[varName] || ""}
                    onChange={(e) => handleVarChange(varName, e.target.value)}
                    placeholder={`输入${getVariableLabel(varName)}`}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final Prompt Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">最终 Prompt 预览</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setEditedPrompt(finalPrompt);
                } else {
                  setIsEditing(true);
                }
              }}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                isEditing
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {isEditing ? <Eye className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
              {isEditing ? "完成编辑" : "编辑"}
            </button>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-muted transition-colors"
            >
              {promptCopied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {promptCopied ? "已复制" : "复制"}
            </button>
          </div>
        </div>
        {isEditing ? (
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            className="w-full min-h-[200px] rounded-xl border bg-background p-4 text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ) : (
          <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm font-mono leading-relaxed">
            {finalPrompt}
          </pre>
        )}
      </div>

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {loading ? "调用中..." : "运行测试"}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-2">
          <span className="text-sm font-medium">LongCat 返回结果</span>
          <div className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
