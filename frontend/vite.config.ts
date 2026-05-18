import {defineConfig} from "vite";
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
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: ({request, url}) =>
              request.destination === "video" ||
              url.pathname.match(/\.(mp4|webm|ogg)$/i),
            handler: "NetworkFirst",
            options: {
              cacheName: "gym-video-cache",
              expiration: {maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60},
              cacheableResponse: {statuses: [0, 200, 206]},
            },
          },
          {
            urlPattern: ({request}) =>
              request.method === "GET" &&
              (request.destination === "" || request.url.includes("/api/")),
            handler: "NetworkFirst",
            options: {
              cacheName: "gym-api-get-cache",
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
});
