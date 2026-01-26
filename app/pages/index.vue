<template>
  <UPageList divide>
    <UPageCard
      v-for="(item, index) in list"
      :key="item.id"
      @click="openContentModal(index)"
      class="cursor-pointer"
      :class="{ 'opacity-60': item.is_read }"
    >
      {{ formatItem(item) }}
      <template #header>
        {{ item.title }}
      </template>
      <template #description>
        <div class="flex flex-col gap-2 sm:flex-row min-h-16">
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
        <div class="flex gap-4 justify-end sm:justify-start">
          <span>
            {{ formatDistance(item.time, new Date()) }}
          </span>
          <span>
            <img
              v-if="item.subscription.icon"
              :src="item.subscription.icon"
              class="w-4 h-4 inline"
            />
            {{ item.subscription.name }}
          </span>
          <UIcon
            name="material-symbols:visibility-rounded"
            size="1.5rem"
            @click.stop="markRead(index, false)"
          />
          <StarToggle v-model="item.is_star" :id="item.id" />
        </div>
      </template>
    </UPageCard>
    <!-- <UProgress /> -->
  </UPageList>
</template>

<script lang="ts">
import type { contentTable, subscriptionTable } from "~~/server/db/schema";
import { useInfiniteScroll } from "@vueuse/core";
import { formatDistance } from "date-fns";
import StarToggle from "~/components/StarToggle.vue";
import ContentModal from "~/components/ContentModal.vue";

type Content = typeof contentTable.$inferSelect;
export interface ContentWithSubscription extends Content {
  subscription: typeof subscriptionTable.$inferSelect;
}
interface ContentResponse {
  data: ContentWithSubscription[];
  hasMore: boolean;
}
</script>

<script setup lang="ts">
const params: Record<string, unknown> = {
  limit: 10,
};
const { data, status, refresh } = useFetch<ContentResponse>("/api/content", {
  params,
  watch: false,
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
const route = useRoute();
watch(
  () => route.query,
  (query, old) => {
    list.value = [];
    delete params.lastId;
    delete params.lastTime;
    params.star = query.star;
    if (query.star) {
      delete params.read;
    } else {
      params.read = query.read || "";
    }
    if (old) {
      refresh();
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
      params.lastId = lastRow?.id;
      params.lastTime = lastRow?.time;
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

function markRead(start: number, isSingle: boolean) {
  const end = isSingle ? start : 0;
  const ids = [];
  for (let i = start; i >= end; i--) {
    const item = list.value[i];
    if (item && !item.is_read) {
      item.is_read = true;
      ids.push(item?.id);
    }
  }
  $fetch("/api/content", {
    method: "PATCH",
    body: {
      ids,
      updateData: {
        is_read: true,
      },
    },
  });
}

const overlay = useOverlay();
const contentModal = overlay.create(ContentModal);
async function openContentModal(index: number) {
  markRead(index, true);
  const item = list.value[index];
  if (!item) return;
  const instance = contentModal.open({
    content: item,
  });

  const isStar = await instance.result;
  item.is_star = isStar;
}

function formatItem(item: ContentWithSubscription) {
  if (item.image && item.description) {
    return;
  }
  if (!item.content) return;
  const dom = new DOMParser().parseFromString(item.content, "text/html");
  if (!item.image) {
    const img = dom.querySelector("img");
    if (img?.src) {
      item.image = img.src;
    }
  }
  
  if (!item.description) {
    item.description = dom.body.textContent?.slice(0, 256) || '';
  }
}
</script>

<style scoped>
:global([data-slot="footer"]) {
  width: 100%;
}
</style>
