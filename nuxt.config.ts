// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxthub/core', "nuxt-auth-utils"],

  nitro: {
    experimental: {
      tasks: true
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  hub: {
    db: 'postgresql',
  },

  runtimeConfig: {
    oauth: {
      oidc: {
        openidConfig: "https://auth.hackclub.com/.well-known/openid-configuration",
        redirectURL: "http://localhost:3000/auth/hackclub",
        scope: ["openid", "email", "slack_id"],
        clientId: process.env.NUXT_OIDC_PROVIDERS_OIDC_CLIENT_ID,
        clientSecret: process.env.NEXT_OIDC_PROVIDERS_OIDC_CLIENT_SECRET
      }
    }
  }


  /*eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }*/
})