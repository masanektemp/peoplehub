import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Windows Server standalone: set OPEN_NEXT=0 and use next build only
  // Cloudflare OpenNext: do not use standalone
  ...(process.env.WINDOWS_STANDALONE === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
