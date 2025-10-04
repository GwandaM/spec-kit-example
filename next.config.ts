import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isDevelopment = process.env.NODE_ENV === "development";

const runtimeCaching = [
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "google-fonts",
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /\/_next\/static\/.*/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "next-static-assets",
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  },
  {
    urlPattern: ({ request }: { request: Request }) => request.destination === "document",
    handler: "NetworkFirst",
    options: {
      cacheName: "html-cache",
      networkTimeoutSeconds: 10,
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: ({ request }: { request: Request }) =>
      request.destination === "style" || request.destination === "script",
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "asset-cache",
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "image-cache",
      expiration: {
        maxEntries: 128,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  },
];

const withPWA = withPWAInit({
  dest: "public",
  disable: isDevelopment,
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    runtimeCaching,
    globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
    cleanupOutdatedCaches: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default withPWA(nextConfig);
