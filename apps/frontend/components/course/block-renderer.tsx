import { getModule } from "@/components/block-kinds";
import type { CourseBlock } from "@/lib/types";

interface BlockRendererProps {
  block: CourseBlock;
  id?: string;
}

export function BlockRenderer({ block, id }: BlockRendererProps) {
  const mod = getModule(block.kind);
  if (!mod) return null;
  const Render = mod.Render;
  return <Render block={block} id={id} />;
}
