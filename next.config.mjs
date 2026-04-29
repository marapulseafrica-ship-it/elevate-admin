/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./.next/server/app/(dashboard)/**/*"],
    },
  },
  webpack: (config) => {
    // @react-pdf/renderer uses canvas and other Node-only modules
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
