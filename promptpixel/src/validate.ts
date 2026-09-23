import type { UIPlanNode } from "./types";

/**
 * Quick, always-visible size stats for a plan — surfaced in the Generate tab so it's immediately
 * obvious when a result came out suspiciously sparse (a handful of nodes for a complex screen)
 * without needing to inspect anything further.
 */
export function countPlanNodes(
  nodes: UIPlanNode[]
): { total: number; layout: number; text: number; componentId: number } {
  let total = 0;
  let layout = 0;
  let text = 0;
  let componentId = 0;
  const walk = (list: UIPlanNode[]) => {
    for (const node of list) {
      total += 1;
      if (node.componentId) componentId += 1;
      else if (node.layout) layout += 1;
      else if (node.text) text += 1;
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return { total, layout, text, componentId };
}
