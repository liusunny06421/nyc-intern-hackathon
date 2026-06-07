import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "housing.columbia.edu" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.marble.worldlabs.ai" },
      { protocol: "https", hostname: "marble.worldlabs.ai" },
      { protocol: "https", hostname: "www.ikea.com" },
      { protocol: "https", hostname: "target.scene7.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "demo.worldlabs.ai" },
      { protocol: "https", hostname: "**.worldlabs.ai" },
    ],
  },
};

export default nextConfig;
