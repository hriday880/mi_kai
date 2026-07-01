import type { NextConfig } from "next";

const basePath = process.env.NODE_ENV === 'production' ? '/mi_kai' : '';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
