/** @type {import('next').NextConfig} */
const basePath = process.env.NODE_ENV === 'production' ? '/mi_kai' : '';

const nextConfig = {
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
