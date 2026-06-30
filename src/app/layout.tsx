import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prompt Hub - AI 提示词库",
  description: "发现、分享和管理高质量的 AI 提示词",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Navbar />
        <main className="container mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
        <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
          Prompt Hub · 用 AI 放大你的创造力
        </footer>
      </body>
    </html>
  );
}
