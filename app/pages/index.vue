<template>
  <UPageList divide>
    <UPageCard v-for="item in list" :key="item.id">
      <template #header>
        {{ item.title }}
      </template>
      <template #description>
        <div class="description flex flex-col sm:flex-row min-h-16">
          <img
            v-if="item.image"
            :src="item.image"
            class="max-h-60 sm:max-w-[256px]"
          />
          <div v-if="item.description" class="h-16 overflow-hidden">
            {{ item.description }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-4">
          <span>
            {{ formatDistance(item.time, new Date()) }}
          </span>
          <span>
            {{ item.subscription.name }}
          </span>
        </div>
      </template>
    </UPageCard>
    <!-- <UProgress /> -->
  </UPageList>
</template>

<script setup lang="ts">
import type { contentTable, subscriptionTable } from "~~/server/db/schema";
import { useInfiniteScroll } from "@vueuse/core";
import { formatDistance } from "date-fns";

type Content = typeof contentTable.$inferSelect;
interface ContentWithSubscription extends Content {
  subscription: typeof subscriptionTable.$inferSelect;
}
interface ContentResponse {
  data: ContentWithSubscription[];
  hasMore: boolean;
}

const params = reactive({
  limit: 10,
  lastId: 0,
  lastTime: "",
});
const { data, status, refresh } = useFetch<ContentResponse>("/api/content", {
  params,
});
const list = ref<ContentWithSubscription[]>([]);
watch(
  data,
  (val) => {
    if (val) {
      list.value = [...list.value, ...(val.data || [])];
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  useInfiniteScroll(
    window,
    () => {
      const lastRow = list.value[list.value.length - 1];
      params.lastId = lastRow?.id || 0;
      params.lastTime = lastRow?.time || "";
      refresh();
    },
    {
      distance: 10,
      canLoadMore: () => {
        return status.value !== "pending" && !!data.value?.hasMore;
      },
    },
  );
});
</script>

<style scoped>
.description {
  gap: 0.5rem;
}
</style>
