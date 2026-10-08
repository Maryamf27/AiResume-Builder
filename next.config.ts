import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["mammoth", "@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/resume-pdf": ["./node_modules/@sparticuz/chromium/bin/*.br"],
  },
};

export default nextConfig;
