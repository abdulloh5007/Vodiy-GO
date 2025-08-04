import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // 👇 Добавляем поддержку импорта аудио-файлов
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });

    // Exclude firebase-messaging-sw.js from server-side builds
    if (isServer) {
      config.externals.push('firebase-messaging-sw.js');
    }

    return config;
  },
};

export default nextConfig;
