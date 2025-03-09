import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "Handball Maisons-Laffitte",
        short_name: "Handball ML",
        description:
          "Application de gestion des présences aux entraînements du club de handball de Maisons-Laffitte",
        theme_color: "#101631",
        background_color: "#101631",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["sports", "utilities"],
        lang: "fr",
        dir: "ltr",
        prefer_related_applications: false,
        related_applications: [],
        iarc_rating_id: "",
        icons: [
          {
            src: "/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png", 
            purpose: "any"
          },
        ],
        screenshots: [
          {
            src: "/screenshots/screenshot1.jpg",
            sizes: "1080x1920",
            type: "image/jpeg",
            platform: "android",
            label: "Écran d'accueil"
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          }
        ]
        }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,

    watch: {
      usePolling: true,
    },
    cors: true,
    // Autoriser les hôtes ngrok et tous les sous-domaines
    hmr: {
      host: 'localhost'
    },
    proxy: {},
    fs: {
      strict: true,
    },
    // Autoriser tous les hôtes (attention: à utiliser uniquement en développement)
    allowedHosts: ['localhost', '.ngrok-free.app'],
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
