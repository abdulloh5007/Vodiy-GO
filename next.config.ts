import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Exclude firebase-messaging-sw.js from server-side builds
    if (isServer) {
      config.externals.push('firebase-messaging-sw.js');
    }
    return config;
  },
};

export default nextConfig;
