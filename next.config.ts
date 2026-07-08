import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["*.http.cloud.morph.so", "*.epic.new", "*.lvh.me"],
  // Pin the Turbopack root to this checkout. Git worktrees live inside the
  // repo (.worktrees/*), so lockfile inference would otherwise resolve the
  // workspace root to the parent checkout and share its .next/dev/lock with
  // the pm2 dev server, making concurrent per-worktree dev servers fail.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default withWorkflow(nextConfig);
