<template>
  <UApp>
    <UHeader>
      <template #title> Nuxt Timeline </template>

      <template #left>
        <UNavigationMenu :items="items" />
        <span class="hidden">
          <NuxtLink :href="items[0]?.to" accesskey="a">New</NuxtLink>
          <NuxtLink :href="items[1]?.to" accesskey="s">Star</NuxtLink>
        </span>
      </template>

      <template #right>
        <UColorModeButton />

        <!-- <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/ui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        /> -->
      </template>

      <template #body> 123123 </template>
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "New",
    to: "/",
    active: route.path === "/" && !route.query.star,
  },
  {
    label: "Star",
    to: "/?star=1",
    active: route.path === "/" && !!route.query.star,
  },
]);
</script>
