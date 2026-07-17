import { NextRequest, NextResponse } from "next/server";
import {
  createFeedback,
  listFeedback,
  updateFeedbackStatus,
} from "@/lib/feedback/store";
import type { FeedbackStatus } from "@/lib/feedback/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listFeedback();
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load feedback.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await createFeedback({
      username: String(body.username || ""),
      userName: String(body.userName || ""),
      role: String(body.role || "staff"),
      category: String(body.category || "general"),
      module: String(body.module || "General"),
      comment: String(body.comment || ""),
      screenshotBase64: body.screenshotBase64 || null,
      screenshotMime: body.screenshotMime || null,
    });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save feedback.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body.id || "");
    const status = String(body.status || "") as FeedbackStatus;
    if (!id || !["open", "reviewing", "done"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid id or status." }, { status: 400 });
    }
    const item = await updateFeedbackStatus(id, status);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
