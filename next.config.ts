import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'img.magnific.com' }],
  },
};

export default nextConfig;
