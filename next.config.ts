// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: false,
  fallbacks: false,
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
