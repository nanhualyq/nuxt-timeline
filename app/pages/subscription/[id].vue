<template>
  <UContainer>
    <h1>Edit Subscription</h1>
    <div v-if="data" class="flex gap-2 mt-2">
      <UButton color="error" @click="deleteThis">Delete</UButton>
      <UButton @click="empty" variant="outline">Empty</UButton>
      <UButton @click="refresh" variant="outline">Refresh</UButton>
      <span v-if="data.last_get_time">
        last_get_time: {{ formatDistance(data.last_get_time, new Date()) }}
        ({{ data.last_get_time }})
      </span>
    </div>
    <hr class="my-4" />
    <div v-if="pending" class="flex justify-center">
      <USpinner />
    </div>
    <div v-else-if="error" class="text-red-500">
      Failed to load subscription: {{ error }}
    </div>
    <SubscriptionForm v-else-if="data" :form-data="data" :submit="submit" />
    <div v-else class="text-gray-500">Subscription not found</div>
  </UContainer>
</template>

<script setup lang="ts">
import { formatDistance } from "date-fns";
import type { subscriptionTable } from "~~/server/db/schema";

type Subscription = typeof subscriptionTable.$inferSelect;
type SubscriptionInsert = typeof subscriptionTable.$inferInsert;

const route = useRoute();
const toast = useToast();

const { data, pending, error } = await useFetch<Subscription>(
  `/api/subscription/${route.params.id}`,
);

async function submit(
  formData: Omit<SubscriptionInsert, "id" | "last_get_time">,
) {
  await $fetch(`/api/subscription/${route.params.id}`, {
    method: "PATCH",
    body: formData,
  });
}
async function refresh() {
  $fetch(`/api/subscription/${route.params.id}/refresh_content`)
    .then(() =>
      toast.add({
        title: "Success",
        description: "Subscription refreshed successfully.",
        color: "success",
      }),
    )
    .catch(alert);
}
async function empty() {
  if (!confirm("Are you sure you want to empty this subscription?")) {
    return;
  }
  $fetch(`/api/subscription/${route.params.id}/content`, {
    method: "DELETE",
  })
    .then(() =>
      toast.add({
        title: "Success",
        description: "Subscription emptied successfully.",
        color: "success",
      }),
    )
    .catch(alert);
}
async function deleteThis() {
  if (!confirm("Are you sure you want to delete this subscription?")) {
    return;
  }
  $fetch(`/api/subscription/${route.params.id}`, {
    method: "DELETE",
  })
    .then(() => {
      toast.add({
        title: "Success",
        description: "Subscription emptied successfully.",
        color: "success",
      });
      navigateTo("/");
    })
    .catch(alert);
}
</script>
