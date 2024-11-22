/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      serverComponentsExternalPackages: ["pdf2json"],
    },
  },
};

export default nextConfig;
