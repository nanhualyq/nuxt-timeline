<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { createInsertSchema } from "drizzle-zod";
import type z from "zod";
import { subscriptionTable } from "~~/server/db/schema";
import IntervalField from "./IntervalField.vue";

type Subscription = typeof subscriptionTable.$inferSelect;
type SubscriptionInsert = typeof subscriptionTable.$inferInsert;

interface Props {
  formData: Partial<Subscription>;
  submit: (
    data: Omit<SubscriptionInsert, "id" | "last_get_time">,
  ) => Promise<void>;
}

const props = defineProps<Props>();

const baseSchema = createInsertSchema(subscriptionTable);
const schema = baseSchema.omit({ id: true, last_get_time: true });

type Schema = z.input<typeof schema>;

const state = reactive<Partial<Schema>>(props.formData);

const toast = useToast();
const loading = ref(false);

const {
  data: execResult,
  execute: testCode,
  pending: execLoading,
  error: execError,
} = useAsyncData(
  () =>
    $fetch("/api/subscription/test_code", {
      method: "POST",
      body: { code: state.code || "" },
    }),
  {
    immediate: false,
    server: false,
  },
);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    await props.submit(event.data);
    toast.add({
      title: "Success",
      description: "Subscription saved successfully.",
      color: "success",
    });
  } catch (error) {
    toast.add({ title: "Error", description: error + "", color: "error" });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Enabled" name="enable">
      <USwitch v-model="state.enable" />
    </UFormField>

    <UFormField label="Name" name="name" required>
      <UInput
        v-model="state.name"
        class="w-full"
        placeholder="Subscription name"
      />
    </UFormField>

    <UFormField label="Icon" name="icon">
      <UInput
        v-model="state.icon"
        class="w-full"
        placeholder="Icon name or URL"
      />
    </UFormField>

    <UFormField label="Category" name="category">
      <UInput class="w-full" v-model="state.category" placeholder="Category" />
    </UFormField>

    <UFormField label="Code" name="code" required>
      <UTextarea
        v-model="state.code"
        class="w-full"
        placeholder="Subscription code"
        autoresize
        :maxrows="20"
        :autoresize-delay="100"
      />
    </UFormField>

    <div class="flex flex-col gap-4">
      <UCard class="flex-1">
        <template #header>
          <UButton
            :loading="execLoading"
            variant="outline"
            @click="() => testCode()"
          >
            Test Code
          </UButton>
        </template>
        <pre
          class="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-auto max-h-64"
        >
          {{ JSON.stringify(execResult || execError, null, 2) }}
          </pre
        >
      </UCard>
    </div>

    <UFormField label="Interval" name="interval">
      <IntervalField v-model="state.interval!" />
    </UFormField>

    <UButton type="submit" :loading="loading" class="w-full">
      Save Subscription
    </UButton>
  </UForm>
</template>
