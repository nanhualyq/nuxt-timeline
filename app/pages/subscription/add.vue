<template>
  <UContainer>
    <h1>Add Subscription</h1>
    <hr class="my-4" />
    <SubscriptionForm :form-data="{ enable: true }" :submit />
  </UContainer>
</template>

<script setup lang="ts">
import type { subscriptionTable } from "~~/server/db/schema";

type SubscriptionInsert = typeof subscriptionTable.$inferInsert;
async function submit(data: SubscriptionInsert) {
  $fetch("/api/subscription", {
    method: "POST",
    body: data,
  });
}
</script>
