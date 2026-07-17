import { promises as fs } from "fs";
import path from "path";
import type { FeedbackCreateInput, FeedbackItem, FeedbackStatus } from "./types";

const ROOT = path.join(process.cwd(), "data", "feedback");
const ITEMS_FILE = path.join(ROOT, "items.json");
const SHOTS_DIR = path.join(ROOT, "screenshots");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function ensureDirs() {
  await fs.mkdir(SHOTS_DIR, { recursive: true });
  try {
    await fs.access(ITEMS_FILE);
  } catch {
    await fs.writeFile(ITEMS_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<FeedbackItem[]> {
  await ensureDirs();
  const raw = await fs.readFile(ITEMS_FILE, "utf8");
  try {
    const list = JSON.parse(raw) as FeedbackItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeAll(items: FeedbackItem[]) {
  await ensureDirs();
  await fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2), "utf8");
}

function extFromMime(mime: string | null | undefined) {
  if (!mime) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "png";
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const items = await readAll();
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createFeedback(input: FeedbackCreateInput): Promise<FeedbackItem> {
  const comment = (input.comment || "").trim();
  if (comment.length < 3) {
    throw new Error("Please enter a comment (at least 3 characters).");
  }

  const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  let screenshotFile: string | null = null;

  if (input.screenshotBase64) {
    const raw = input.screenshotBase64.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(raw, "base64");
    if (buf.length > MAX_IMAGE_BYTES) {
      throw new Error("Screenshot too large (max 5 MB).");
    }
    if (buf.length > 0) {
      const ext = extFromMime(input.screenshotMime);
      screenshotFile = `${id}.${ext}`;
      await ensureDirs();
      await fs.writeFile(path.join(SHOTS_DIR, screenshotFile), buf);
    }
  }

  const item: FeedbackItem = {
    id,
    createdAt: now,
    updatedAt: now,
    username: (input.username || "unknown").trim(),
    userName: (input.userName || "Unknown").trim(),
    role: (input.role || "staff").trim(),
    category: (input.category || "general").trim(),
    module: (input.module || "General").trim(),
    comment,
    screenshotFile,
    status: "open",
  };

  const items = await readAll();
  items.push(item);
  await writeAll(items);
  return item;
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<FeedbackItem> {
  const items = await readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Feedback not found.");
  items[idx] = { ...items[idx], status, updatedAt: new Date().toISOString() };
  await writeAll(items);
  return items[idx];
}

export function getScreenshotPath(filename: string): string | null {
  const safe = path.basename(filename);
  if (!safe || safe !== filename || safe.includes("..")) return null;
  return path.join(SHOTS_DIR, safe);
}
