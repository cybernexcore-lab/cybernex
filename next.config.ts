import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  outputFileTracingIncludes: {
    '/*': ['./database/**/*', './public/uploads/**/*'],
    '/**/*': ['./database/**/*', './public/uploads/**/*'],
  },
};

export default nextConfig;
