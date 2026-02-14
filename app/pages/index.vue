<template>
  <UPageList divide>
    <UEmpty
      v-show="status === 'success' && list.length === 0"
      title="No articles found"
      icon="material-symbols:coffee"
    />
    <UPageCard
      v-for="(item, index) in list"
      :key="item.id"
      v-scroll-item
      v-lazy="index"
      class="cursor-pointer"
      :class="{ 'opacity-60': item.is_read }"
      :highlight="activeIndex === index"
      @click="openContentModal(index)"
    >
      <!-- {{ formatItem(item) }} -->
      <template #header>
        <NuxtLink :to="item.link" target="_blank" @click.stop>
          {{ item.title }}
        </NuxtLink>
      </template>
      <template #description>
        <div class="flex flex-col gap-2 sm:flex-row min-h-16">
          <img
            v-if="item.image"
            :src="item.image"
            class="max-h-60 sm:max-w-[256px] object-contain"
          />
          <div v-if="item.description" class="h-16 overflow-hidden break-all">
            {{ item.description }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-4 justify-end sm:justify-start flex-wrap">
          <span>
            {{ formatDistance(item.time, new Date()) }}
          </span>
          <NuxtLink @click.stop :to="`/?subscription=${item.subscription_id}`">
            <img
              v-if="item.subscription.icon"
              :src="item.subscription.icon"
              class="w-4 h-4 inline"
            />
            {{ item.subscription.name }}
          </NuxtLink>
          <span v-if="item.author" class="break-all">
            {{ item.author }}
          </span>
          <UIcon
            class="shrink-0"
            name="material-symbols:visibility-rounded"
            size="1.5rem"
            @click.stop="markRead(index, false)"
          />
          <StarToggle
            class="shrink-0"
            ref="starToggle"
            v-model="item.is_star"
            :id="item.id"
          />
        </div>
      </template>
    </UPageCard>
    <UProgress v-show="status === 'pending'" />
  </UPageList>
</template>

<script lang="ts">
import type { contentTable, subscriptionTable } from "~~/server/db/schema";
import {
  onKeyStroke,
  useInfiniteScroll,
  useIntersectionObserver,
} from "@vueuse/core";
import { formatDistance } from "date-fns";
import StarToggle from "~/components/StarToggle.vue";
import ContentModal from "~/components/ContentModal.vue";
import * as cheerio from "cheerio";
import type { Directive } from "vue";

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
const countStore = useCountStore();
const toast = useToast();
const params: Record<string, unknown> = {
  limit: 50,
};
const list = ref<ContentWithSubscription[]>([]);
const { data, status, refresh } = useFetch<ContentResponse>("/api/content", {
  params,
  watch: false,
  server: false,
  immediate: false,
  onResponse({ response }) {
    list.value.push(...(response._data?.data || []));
  },
});
const route = useRoute();
const activeIndex = ref(-1);
watch(
  () => route.query,
  () => {
    list.value = [];
    activeIndex.value = -1;
    delete params.lastId;
    delete params.lastTime;
    fetchWithParams();
  },
  {
    immediate: true,
  },
);
function fetchWithParams() {
  const { query } = route;
  params.star = query.star;
  params.subscription = query.subscription;
  if (query.star) {
    delete params.read;
  } else {
    params.read = query.read === "all" ? undefined : query.read || "";
  }
  refresh();
}

onMounted(() => {
  useInfiniteScroll(
    window,
    () => {
      const lastRow = list.value[list.value.length - 1];
      params.lastId = lastRow?.id;
      params.lastTime = lastRow?.time;
      fetchWithParams();
    },
    {
      distance: 100,
      interval: 100,
      canLoadMore: () => {
        return status.value !== "pending" && !!data.value?.hasMore;
      },
    },
  );
});

function markRead(start: number, isSingle: boolean) {
  const end = isSingle ? start : 0;
  const ids: number[] = [];
  for (let i = start; i >= end; i--) {
    const item = list.value[i];
    if (item && !item.is_read) {
      item.is_read = true;
      ids.push(item?.id);
      countStore.minusUnreadCount(item.subscription_id);
    }
  }
  if (ids.length === 0) {
    return;
  }
  $fetch("/api/content", {
    method: "PATCH",
    body: {
      ids,
      updateData: {
        is_read: true,
      },
    },
  }).catch((error) => {
    toast.add({
      title: "Error of mard read",
      description: error,
    });
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

async function translateField(
  item: ContentWithSubscription,
  field: "title" | "description",
) {
  if (!item[field] || item.is_read) {
    return;
  }
  const isChinese = /[\u4e00-\u9fff]/.test(item[field]);
  if (isChinese) {
    return;
  }
  const res = await fetch("https://translate.cutie.dating/translate", {
    method: "POST",
    body: JSON.stringify({
      q: item[field],
      source: "auto",
      target: "zh-Hans",
      format: "text",
      // alternatives: 3,
      api_key: "",
    }),
    headers: { "Content-Type": "application/json" },
  }).then((r) => r.json());

  if (res.translatedText) {
    item[field] = res.translatedText + ` | ${item[field]}`;
  }
}

function formatItem(item: ContentWithSubscription) {
  translateField(item, "title");
  if (item.image && item.description) {
    return;
  }
  if (!item.content) return;
  const $ = cheerio.load(item.content);
  if (!item.image) {
    const img = $("img").first();
    if (img.length) {
      item.image = img.attr("src") || "";
    }
  }

  if (!item.description) {
    item.description = $.text()?.slice(0, 256) || "";
  }
  translateField(item, "description");
}

const starToggleRef = useTemplateRef("starToggle");
function onPureKey(key: string | string[], fn: (e: KeyboardEvent) => void) {
  onKeyStroke(key, (e) => {
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
    fn(e);
  });
}
onPureKey(["j", "ArrowDown"], (e) => {
  activeIndex.value = Math.min(activeIndex.value + 1, list.value.length - 1);
});
onPureKey(["k", "ArrowUp"], (e) => {
  activeIndex.value = Math.max(activeIndex.value - 1, 0);
});
onPureKey("f", (e) => {
  starToggleRef.value?.[activeIndex.value]?.toggleStar();
});
onPureKey("o", (e) => {
  if (activeIndex.value >= 0) {
    window.open(list.value[activeIndex.value]?.link);
  }
});
onPureKey("m", (e) => {
  markRead(activeIndex.value, false);
});
onPureKey("Enter", (e) => {
  if (activeIndex.value >= 0) {
    e.preventDefault();
  }
  setTimeout(() => {
    openContentModal(activeIndex.value);
  }, 0);
});
const vScrollItem = {
  updated(el: HTMLElement) {
    if (el.classList.contains("ring-2")) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  },
};

const vLazy: Directive<HTMLElement, number> = {
  mounted(el, binding) {
    useIntersectionObserver(
      el,
      ([entry]: IntersectionObserverEntry[], observer) => {
        if (entry?.isIntersecting) {
          formatItemByIndex(binding.value);
          observer.disconnect();
        }
      },
    );
  },
};

function formatItemByIndex(index: number) {
  const item = list.value[index];
  if (!item) return;
  formatItem(item);
}
</script>

<style scoped>
:global([data-slot="footer"]) {
  width: 100%;
}
.ring-2 {
  margin: 2px;
}
</style>
