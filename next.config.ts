import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "76qv5spm-3000.uks1.devtunnels.ms",
      ],
    },
  },
};

export default nextConfig;
