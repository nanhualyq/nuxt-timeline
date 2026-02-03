<template>
  <UApp>
    <UHeader
      :ui="{
        toggle: 'lg:block',
        content: 'lg:block',
        overlay: 'lg:block',
      }"
      mode="slideover"
    >
      <template #title> Nuxt Timeline </template>

      <template #left>
        <UNavigationMenu :items="leftItems" />
        <span class="hidden">
          <NuxtLink :href="leftItems[0]?.to" accesskey="a">New</NuxtLink>
          <NuxtLink :href="leftItems[1]?.to" accesskey="s">Star</NuxtLink>
        </span>
      </template>

      <UNavigationMenu content-orientation="vertical" :items="items" />

      <template #right>
        <UNavigationMenu content-orientation="vertical" :items="rightItems" />
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu orientation="vertical" :items="items" />
        <hr />
        <UNavigationMenu orientation="vertical" :items="subs" />
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
import { groupBy } from "lodash-es";

const countStore = useCountStore();
useHead({
  title: computed(() => {
    let n = "";
    if (countStore.totalUnread) {
      n = `(${countStore.totalUnread}) `;
    }
    return `${n}Nuxt Timeline`;
  }),
});

const route = useRoute();
const router = useRouter();

const leftItems = computed<NavigationMenuItem[]>(() => {
  let unread = countStore.totalUnread;
  if (route.query.subscription) {
    unread = countStore.unreadBySubscription[+route.query.subscription] || 0;
  }
  return [
    {
      label: "New",
      to: "/",
      active: route.path === "/" && !route.query.star,
      badge: unread,
    },
    {
      label: "Star",
      to: "/?star=1",
      active: route.path === "/" && !!route.query.star,
      badge: countStore.starred,
    },
  ];
});
const items = computed<NavigationMenuItem[]>(() => {
  const arr = [
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
      label: "Add Subscription",
      to: "/subscription/add",
    },
  ];
  if (route.query.subscription) {
    arr.push({
      label: "Edit Subscription",
      to: "/subscription/" + route.query.subscription,
    });
  }
  return arr;
});

async function markAllRead() {
  await $fetch("/api/content/read_all");
  router.replace(`/?refresh=${Date.now()}`);
}

countStore.fetchCount();
onMounted(() => {
  setInterval(
    () => {
      countStore.fetchCount();
    },
    1000 * 60 * 5,
  );
});

const { data: subGroup } = useFetch("/api/subscription", {
  transform(subs) {
    return groupBy(subs, (item) => item.category || "uncategorized");
  },
});
const subs = computed<NavigationMenuItem[]>(() => {
  if (!subGroup.value) {
    return [];
  }
  return Object.entries(subGroup.value).map(([category, items]) => ({
    label: category,
    badge: items.reduce(
      (acc, s) => acc + (countStore.unreadBySubscription[s.id] || 0),
      0,
    ),
    children: items.map((s) => ({
      label: s.name,
      avatar: {
        src: s.icon,
      },
      badge: countStore.unreadBySubscription[s.id],
      to: `/?subscription=${s.id}`,
      active: route.query.subscription === s.id + "",
    })),
  }));
});

const rightItems = [
  {
    label: "Read",
    children: [
      {
        label: "Unread",
        to: {
          path: "/",
          query: {
            ...route.query,
            read: "",
          },
        },
      },
      {
        label: "Read",
        to: {
          path: "/",
          query: {
            ...route.query,
            read: "1",
          },
        },
      },
      {
        label: "All",
        to: {
          path: "/",
          query: {
            ...route.query,
            read: "all",
          },
        },
      },
    ],
  },
];
</script>
