import AsTools from "@/pages/tools/AS";
import JsonTools from "@/pages/tools/Json";
import WebTools from "@/pages/tools/Web";
import MediaTools from "@/pages/tools/Media";
import OtherTools from "@/pages/tools/Other";
import type { ToolConfig } from "@/types/tool";

export const allTools: ToolConfig[] = [
  ...AsTools,
  ...JsonTools,
  ...WebTools,
  ...MediaTools,
  ...OtherTools,
];

export const getToolById = (id: string) =>
  allTools.find((tool) => tool.id === id);
export const getToolsByCategory = (category: string) =>
  allTools.filter((tool) => tool.category === category);
