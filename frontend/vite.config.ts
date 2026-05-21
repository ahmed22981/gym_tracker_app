/// <reference types="vitest" />
import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["gemini-svg.svg", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Gym Diary",
        short_name: "GymDiary",
        description: "Track your workouts, sessions, and strength progress.",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,json}"],

        navigateFallback: "/index.html",

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gym-videos-offline-cache",
              expiration: {maxEntries: 15, maxAgeSeconds: 30 * 24 * 60 * 60},
              cacheableResponse: {statuses: [0, 200]},
              rangeRequests: true,
            },
          },
          {
            urlPattern: ({url}) => url.pathname.includes("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "gym-api-data-cache",
              expiration: {maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7},
              cacheableResponse: {statuses: [0, 200]},
            },
          },
          {
            urlPattern: ({request}) =>
              ["POST", "PUT", "DELETE"].includes(request.method) &&
              request.url.includes("/api/"),
            handler: "NetworkOnly",
            options: {
              backgroundSync: {
                name: "gym-offline-queue",
                options: {
                  maxRetentionTime: 24 * 60,
                },
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
