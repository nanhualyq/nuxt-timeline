// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@kgierke/nuxt-basic-auth",
  ],
  css: ["~/assets/css/main.css"],
  sourcemap: {
    server: true,
    client: true,
  },
});