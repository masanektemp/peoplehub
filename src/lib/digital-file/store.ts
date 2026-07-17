export interface DigitalDocument {
  id: string;
  employee: string;
  document: string;
  version: string;
  updated: string;
}

const STORAGE_KEY = "peoplehub-digital-files";

const SEED: DigitalDocument[] = [
  {
    id: "doc-1",
    employee: "John Doe",
    document: "Passport",
    version: "v2.9",
    updated: "10 Jul",
  },
  {
    id: "doc-2",
    employee: "Ahmad Rizal",
    document: "Contract",
    version: "v3.0",
    updated: "01 Jul",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadDocuments(): DigitalDocument[] {
  if (!isBrowser()) return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    const parsed = JSON.parse(raw) as DigitalDocument[];
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function saveDocuments(docs: DigitalDocument[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function formatToday(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
