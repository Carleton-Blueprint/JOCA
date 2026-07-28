import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    exposeTestingApiInProductionBuild:
      process.env.EXPOSE_TESTING_API === "1",
  },
};

export default nextConfig;
