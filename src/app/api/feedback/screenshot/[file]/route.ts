import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getScreenshotFromD1, getScreenshotPath } from "@/lib/feedback/store";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await ctx.params;
    const name = decodeURIComponent(file);

    // Cloud D1: file stored as d1:<feedbackId>
    if (name.startsWith("d1:")) {
      const id = name.slice(3);
      const shot = await getScreenshotFromD1(id);
      if (!shot) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }
      const buf = Buffer.from(shot.b64, "base64");
      return new NextResponse(buf, {
        headers: {
          "Content-Type": shot.mime,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    const full = getScreenshotPath(name);
    if (!full) {
      return NextResponse.json({ error: "Invalid file." }, { status: 400 });
    }
    const buf = await fs.readFile(full);
    const ext = path.extname(name).toLowerCase();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
