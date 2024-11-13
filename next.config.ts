import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: ['**/.#*', '**/*~', '**/.git/**', '**/node_modules/**'],
        poll: 1000,
      }
    }
    return config
  },
};

export default nextConfig;