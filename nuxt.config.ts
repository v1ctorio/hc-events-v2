// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxthub/core',
    'nuxt-oidc-auth'
  ],

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

  oidc: {
    providers: {
      oidc: {
        clientId: process.env.NEXT_OIDC_PROVIDERS_OIDC_CLIENT_ID,
        clientSecret: process.env.NEXT_OIDC_PROVIDERS_OIDC_CLIENT_SECRET,
        /*authorizationUrl: "https://auth.hackclub.com/oauth/authorize",
        userInfoUrl: "https://auth.hackclub.com/oauth/userinfo",
        tokenUrl: "https://auth.hackclub.com/oauth/token",
        redirectUri:"http://localhost:3000/auth/oidc/callback",
        jwksUri: "https://auth.hackclub.com/oauth/discovery/keys",
        issuer: "https://auth.hackclub.com",*/
        scope: ["openid", "email"],
        tokenRequestType: "form-urlencoded",
        openIdConfiguration: "https://auth.hackclub.com/.well-known/openid-configuration"
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