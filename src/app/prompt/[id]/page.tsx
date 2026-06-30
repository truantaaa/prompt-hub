import { mockPrompts } from "@/data/mock-prompts";
import PromptDetail from "./PromptDetail";

export function generateStaticParams() {
  return mockPrompts.map((prompt) => ({ id: prompt.id }));
}

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  return <PromptDetail id={params.id} />;
}
