// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui", '@nuxthub/core', "nuxt-auth-utils"],


  nitro: {
    experimental: {
      tasks: true
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', '~/assets/css/fonts.css'],

  routeRules: {},

  compatibilityDate: '2025-01-15',

  hub: {
    db: 'postgresql',
  },

  runtimeConfig: {
    // API key for programmatic access (Authorization: Bearer <HC_API_SECRET>)
    hcApiSecret: '',  // set via HC_API_SECRET env var
    // Comma-separated Slack IDs with admin privileges
    hcAdminSlackIds: 'U072PTA5BNG', // set via HC_ADMIN_SLACK_IDS env var
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