import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Types akan dicek setelah `npx prisma generate` dijalankan
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
