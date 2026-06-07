import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The AI furniture agent returns images from arbitrary retailer CDNs
    // (IKEA, Target, Wayfair, Amazon, …), so serve them as-is rather than
    // maintaining a per-host allowlist for the optimizer.
    unoptimized: true,
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
