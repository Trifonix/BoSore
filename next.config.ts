import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    if (process.env.VIEW_DB_MODE === "1") {
      return [
        {
          source: "/",
          destination: "/view-db",
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
