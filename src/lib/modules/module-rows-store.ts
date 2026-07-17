const PREFIX = "peoplehub-module-rows:";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadModuleRows(
  slug: string,
  seed: Record<string, string>[]
): Record<string, string>[] {
  if (!isBrowser()) return seed;
  try {
    const raw = localStorage.getItem(PREFIX + slug);
    if (!raw) {
      localStorage.setItem(PREFIX + slug, JSON.stringify(seed));
      return seed.map((r) => ({ ...r }));
    }
    const parsed = JSON.parse(raw) as Record<string, string>[];
    return Array.isArray(parsed) ? parsed : seed.map((r) => ({ ...r }));
  } catch {
    return seed.map((r) => ({ ...r }));
  }
}

export function saveModuleRows(slug: string, rows: Record<string, string>[]) {
  if (!isBrowser()) return;
  localStorage.setItem(PREFIX + slug, JSON.stringify(rows));
}
