import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey, model } = body;

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: "缺少 LongCat API Key" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "缺少 prompt 内容" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.longcat.chat/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model || "LongCat-2.0",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || data.message || "LongCat API 请求失败" },
        { status: response.status }
      );
    }

    const content = data.choices?.[0]?.message?.content || "（空响应）";
    return NextResponse.json({ content, usage: data.usage });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "服务器内部错误" },
      { status: 500 }
    );
  }
}
