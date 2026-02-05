<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Subscription Logs</h1>

    <div v-if="pending" class="text-center py-8">
      <p>Loading logs...</p>
    </div>

    <div v-else-if="error" class="text-red-500 py-8">
      <p>Error loading logs: {{ error }}</p>
    </div>

    <div v-else-if="logs?.length === 0" class="text-gray-500 py-8">
      <p>No logs found.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Filter by status:</label
        >
        <select
          v-model="selectedStatus"
          @change="() => refresh()"
          class="block w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <table class="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Subscription
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Info
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Time
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <NuxtLink :to="'/subscription/' + log.subscription.id">
                <img
                  v-if="log.subscription.icon"
                  :src="log.subscription.icon"
                  class="inline max-w-4 max-h-4"
                />
                {{ log.subscription.name }}</NuxtLink
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                :class="{
                  'px-2 py-1 rounded-full text-xs font-medium': true,
                  'bg-green-100 text-green-800': log.status === 'success',
                  'bg-red-100 text-red-800': log.status === 'failed',
                }"
              >
                {{ log.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
              {{ log.info || "-" }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDistance(log.time, new Date()) }}
              <br>
              {{ log.time }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistance } from "date-fns";
import type { subscriptionTable, subsLogsTable } from "~~/server/db/schema";

type SubLog = typeof subsLogsTable.$inferSelect;
interface SubLogWithSubscription extends SubLog {
  subscription: typeof subscriptionTable.$inferSelect;
}

const selectedStatus = ref<string>("");

const {
  data: logs = [],
  pending,
  error,
  refresh,
} = await useFetch<SubLogWithSubscription[]>("/api/subs-logs", {
  query: {
    status: selectedStatus,
  },
  watch: false,
});
</script>
