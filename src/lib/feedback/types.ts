export type FeedbackStatus = "open" | "reviewing" | "done";

export interface FeedbackItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  userName: string;
  role: string;
  category: string;
  module: string;
  comment: string;
  screenshotFile: string | null;
  status: FeedbackStatus;
}

export interface FeedbackCreateInput {
  username: string;
  userName: string;
  role: string;
  category: string;
  module: string;
  comment: string;
  screenshotBase64?: string | null;
  screenshotMime?: string | null;
}
