/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      serverComponentsExternalPackages: ["pdf2json"],
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader',
    });
    return config;
  },
};

export default nextConfig;
