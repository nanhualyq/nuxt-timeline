<script setup lang="ts">
import type { ContentWithSubscription } from "~/pages/index.vue";
import StarToggle from "./StarToggle.vue";

const props = defineProps<{
  content: ContentWithSubscription;
}>();

const emit = defineEmits<{
  close: [boolean];
}>();

const isStar = ref(props.content.is_star);
</script>

<template>
  <UModal @after:leave="emit('close', isStar)" fullscreen>
    <template #title>
      <NuxtLink target="_blank" :to="content.link">
        {{ content.title }}
      </NuxtLink>
    </template>
    <template #body>
      <div>
        <img v-if="content.image" :src="content.image" />
        <div
          v-if="content.content"
          class="prose"
          v-html="content.content"
        ></div>
        <p v-else class="text-sm text-gray-600 mb-2">
          {{ content.description }}
        </p>
        <div class="text-sm text-gray-500">
          <span>
            {{ content.subscription.name }}
          </span>
          <span>{{ content.author }}</span>
          {{ new Date(content.time).toLocaleString() }}
        </div>
      </div>
    </template>
    <template #footer>
      <StarToggle v-model="isStar" :id="content.id" />
    </template>
  </UModal>
</template>
