export function addToById<T extends { id: string }>(
  stateById: Record<string, T>,
  item: T
) {
  stateById[item.id] = item;
}

export function removeFromById(stateById: Record<string, any>, id: string) {
  delete stateById[id];
}

export function ensureArray(arr?: string[]) {
  return Array.isArray(arr) ? arr : [];
}
