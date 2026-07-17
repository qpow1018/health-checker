import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    additionalData: '@use "@/assets/scss/variables" as *;',
  },
};

export default nextConfig;
