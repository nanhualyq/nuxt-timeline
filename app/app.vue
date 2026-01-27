<template>
  <UApp>
    <UHeader>
      <template #title> Nuxt Timeline </template>

      <template #left>
        <UNavigationMenu :items="leftItems" />
        <span class="hidden">
          <NuxtLink :href="leftItems[0]?.to" accesskey="a">New</NuxtLink>
          <NuxtLink :href="leftItems[1]?.to" accesskey="s">Star</NuxtLink>
        </span>
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu orientation="vertical" :items="items" />
      </template>
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
const router = useRouter();

const leftItems = computed<NavigationMenuItem[]>(() => [
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
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Mark all read",
    icon: "material-symbols:visibility-rounded",
    onSelect: markAllRead,
  },
  {
    label: "Refresh",
    icon: "material-symbols:directory-sync",
    onSelect: () => $fetch("/api/subscription/refresh_content"),
  },
  {
    label: "Read",
    children: [
      {
        label: "Unread",
        to: "/?read",
      },
      {
        label: "Read",
        to: "/?read=1",
      },
      {
        label: "All",
        to: "/?read=all",
      },
    ],
  },
]);

async function markAllRead() {
  await $fetch("/api/content/read_all");
  router.replace(`/?refresh=${Date.now()}`);
}
</script>
