import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["*.http.cloud.morph.so", "*.epic.new", "*.lvh.me"],
};

export default withWorkflow(nextConfig);
