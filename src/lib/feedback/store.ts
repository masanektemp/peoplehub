import { promises as fs } from "fs";
import path from "path";
import type { FeedbackCreateInput, FeedbackItem, FeedbackStatus } from "./types";

const ROOT = path.join(process.cwd(), "data", "feedback");
const ITEMS_FILE = path.join(ROOT, "items.json");
const SHOTS_DIR = path.join(ROOT, "screenshots");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** D1 row-friendly limit for base64 screenshots on Cloudflare */
const MAX_CLOUD_IMAGE_BYTES = 900 * 1024;

type D1DatabaseLike = {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => {
      all: <T = unknown>() => Promise<{ results: T[] }>;
      first: <T = unknown>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
    all: <T = unknown>() => Promise<{ results: T[] }>;
    run: () => Promise<unknown>;
  };
};

async function getD1(): Promise<D1DatabaseLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx?.env as { DB?: D1DatabaseLike } | undefined)?.DB;
    return db ?? null;
  } catch {
    return null;
  }
}

function rowToItem(row: Record<string, unknown>): FeedbackItem {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    username: String(row.username),
    userName: String(row.user_name),
    role: String(row.role),
    category: String(row.category),
    module: String(row.module),
    comment: String(row.comment),
    screenshotFile: row.screenshot_b64 ? `d1:${row.id}` : null,
    status: (row.status as FeedbackStatus) || "open",
  };
}

async function ensureDirs() {
  await fs.mkdir(SHOTS_DIR, { recursive: true });
  try {
    await fs.access(ITEMS_FILE);
  } catch {
    await fs.writeFile(ITEMS_FILE, "[]", "utf8");
  }
}

async function readAllFs(): Promise<FeedbackItem[]> {
  await ensureDirs();
  const raw = await fs.readFile(ITEMS_FILE, "utf8");
  try {
    const list = JSON.parse(raw) as FeedbackItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeAllFs(items: FeedbackItem[]) {
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
  const db = await getD1();
  if (db) {
    const res = await db
      .prepare("SELECT * FROM feedback ORDER BY created_at DESC")
      .all<Record<string, unknown>>();
    return (res.results || []).map(rowToItem);
  }
  const items = await readAllFs();
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
  let screenshotB64: string | null = null;
  let screenshotMime: string | null = null;

  if (input.screenshotBase64) {
    const raw = input.screenshotBase64.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(raw, "base64");
    if (buf.length > MAX_IMAGE_BYTES) {
      throw new Error("Screenshot too large (max 5 MB).");
    }
    if (buf.length > 0) {
      const db = await getD1();
      if (db) {
        if (buf.length > MAX_CLOUD_IMAGE_BYTES) {
          throw new Error("Screenshot too large for cloud demo (max ~900 KB). Use a smaller image.");
        }
        screenshotB64 = raw;
        screenshotMime = input.screenshotMime || "image/png";
        screenshotFile = `d1:${id}`;
      } else {
        const ext = extFromMime(input.screenshotMime);
        screenshotFile = `${id}.${ext}`;
        await ensureDirs();
        await fs.writeFile(path.join(SHOTS_DIR, screenshotFile), buf);
      }
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

  const db = await getD1();
  if (db) {
    await db
      .prepare(
        `INSERT INTO feedback
        (id, created_at, updated_at, username, user_name, role, category, module, comment, screenshot_b64, screenshot_mime, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        item.id,
        item.createdAt,
        item.updatedAt,
        item.username,
        item.userName,
        item.role,
        item.category,
        item.module,
        item.comment,
        screenshotB64,
        screenshotMime,
        item.status
      )
      .run();
    return item;
  }

  const items = await readAllFs();
  items.push(item);
  await writeAllFs(items);
  return item;
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<FeedbackItem> {
  const db = await getD1();
  if (db) {
    const now = new Date().toISOString();
    await db
      .prepare("UPDATE feedback SET status = ?, updated_at = ? WHERE id = ?")
      .bind(status, now, id)
      .run();
    const row = await db
      .prepare("SELECT * FROM feedback WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    if (!row) throw new Error("Feedback not found.");
    return rowToItem(row);
  }

  const items = await readAllFs();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Feedback not found.");
  items[idx] = { ...items[idx], status, updatedAt: new Date().toISOString() };
  await writeAllFs(items);
  return items[idx];
}

export function getScreenshotPath(filename: string): string | null {
  const safe = path.basename(filename);
  if (!safe || safe !== filename || safe.includes("..")) return null;
  return path.join(SHOTS_DIR, safe);
}

export async function getScreenshotFromD1(
  id: string
): Promise<{ b64: string; mime: string } | null> {
  const db = await getD1();
  if (!db) return null;
  const row = await db
    .prepare("SELECT screenshot_b64, screenshot_mime FROM feedback WHERE id = ?")
    .bind(id)
    .first<{ screenshot_b64: string | null; screenshot_mime: string | null }>();
  if (!row?.screenshot_b64) return null;
  return {
    b64: row.screenshot_b64,
    mime: row.screenshot_mime || "image/png",
  };
}
