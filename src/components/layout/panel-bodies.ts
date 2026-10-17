/**
 * 分组内容区（车身）DOM 登记表：groupId -> element。
 *
 * 标签内容统一在 PanelView 根部渲染一次，再按各组车身的矩形绝对定位过去。
 * 内容不换 React 父节点，标签跨组拖动时页面实例不会被卸载重挂。
 */
const bodies = new Map<string, HTMLElement>();
const listeners = new Set<() => void>();
let version = 0;

function emit(): void {
  version++;
  for (const listener of listeners) listener();
}

export function registerPanelBody(
  groupId: string,
  el: HTMLElement | null,
): void {
  const prev = bodies.get(groupId);
  if (el) {
    if (prev === el) return;
    bodies.set(groupId, el);
  } else {
    if (prev === undefined) return;
    bodies.delete(groupId);
  }
  emit();
}

export function subscribePanelBodies(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function panelBodiesVersion(): number {
  return version;
}

export function panelBodies(): Map<string, HTMLElement> {
  return bodies;
}
