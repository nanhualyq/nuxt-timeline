<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { createInsertSchema } from 'drizzle-zod'
import type z from 'zod'
import { subscriptionTable } from '~~/server/db/schema'

type Subscription = typeof subscriptionTable.$inferSelect
type SubscriptionInsert = typeof subscriptionTable.$inferInsert

interface Props {
  formData: Partial<Subscription>
  submit: (data: Omit<SubscriptionInsert, 'id' | 'last_get_time'>) => Promise<void>
}

const props = defineProps<Props>()

const baseSchema = createInsertSchema(subscriptionTable)
const schema = baseSchema.omit({ id: true, last_get_time: true })

type Schema = z.input<typeof schema>

const state = reactive<Partial<Schema>>(props.formData)

const toast = useToast()
const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    await props.submit(event.data)
    toast.add({ title: 'Success', description: 'Subscription saved successfully.', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Error', description: error + '', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Enabled" name="enable">
      <USwitch v-model="state.enable" />
    </UFormField>

    <UFormField label="Name" name="name" required>
      <UInput v-model="state.name" placeholder="Subscription name" />
    </UFormField>

    <UFormField label="Icon" name="icon">
      <UInput v-model="state.icon" placeholder="Icon name or URL" />
    </UFormField>

    <UFormField label="Category" name="category">
      <UInput v-model="state.category" placeholder="Category" />
    </UFormField>

    <UFormField label="Code" name="code" required>
      <UTextarea v-model="state.code" placeholder="Subscription code or feed URL" />
    </UFormField>
    <!-- TODO: test code -->

    <UFormField label="Interval" name="interval">
      <UInput v-model="state.interval" placeholder="Update interval (e.g., hourly, daily)" />
    </UFormField>

    <UButton type="submit" :loading="loading" class="w-full">
      Save Subscription
    </UButton>
  </UForm>
</template>