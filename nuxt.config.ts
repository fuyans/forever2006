// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt'
  ],

  devtools: {
    enabled: true
  },

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },

  // The site is password-protected and runs behind a server (SSR) so that the
  // guestbook has a place to store messages. We therefore no longer prerender.
  runtimeConfig: {
    sitePassword: process.env.NUXT_SITE_PASSWORD || 'qiushi2026',
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || 'admin-2006'
  },

  devServer: {
    port: 2006
  },

  compatibilityDate: '2026-06-30',

  // Static generation for read-only deployments (e.g. GitHub Pages).
  // The auth middleware skips during prerender, and the memories API is
  // served as a pre-computed static JSON file.
  nitro: {
    prerender: {
      routes: ['/', '/album'],
      crawlLinks: false
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  ogImage: {
    zeroRuntime: true
  }
})
