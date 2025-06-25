import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pexels-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'TruIndee Music Platform',
        short_name: 'TruIndee',
        description: 'Complete music industry platform for artists and labels',
        theme_color: '#8b5cf6',
        background_color: '#0f0f23',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['music', 'productivity', 'business'],
        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '640x1136',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/screenshot-desktop.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        icons: [
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Quick access to dashboard',
            url: '/dashboard',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Catalog',
            short_name: 'Catalog',
            description: 'Manage music catalog',
            url: '/catalog',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'AI Team',
            short_name: 'AI Team',
            description: 'Access AI assistants',
            url: '/ai-team',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});