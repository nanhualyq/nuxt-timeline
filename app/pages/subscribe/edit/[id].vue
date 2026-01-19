<template>
    <div v-if="fetchStatus === 'error'">
        <h1>{{ fetchError }}</h1>
    </div>
    <UContainer v-else>
        <h1 class="text-2xl font-bold mb-6">
            {{ route.params.id === 'new' ? 'Create Subscription' : 'Edit Subscription' }}
        </h1>

        <UAlert v-if="submitStatus === 'error'" color="error" :description="submitError?.statusMessage" class="mb-4" />

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="submit">
            <UFormField label="Name" name="name">
                <UInput v-model="state.name" />
            </UFormField>

            <UFormField label="Link" name="link">
                <UInput v-model="state.link" type="url" />
            </UFormField>

            <UFormField label="Enable" name="enable">
                <UCheckbox v-model="state.enable" />
            </UFormField>

            <UFormField label="get_code" name="get_code">
                <UTextarea v-model="state.get_code" />
                <div class="flex mt-2">
                    <UButton color="info" @click="null">Test</UButton>
                    123
                </div>
            </UFormField>

            <UFormField label="content_code" name="content_code">
                <UTextarea v-model="state.content_code" />
            </UFormField>

            <UFormField label="Icon" name="icon">
                <UInput v-model="state.icon" />
            </UFormField>

            <UFormField label="Category" name="category">
                <UInput v-model="state.category" />
            </UFormField>

            <UFormField label="Interval" name="interval">
                <UInput v-model="state.interval" />
            </UFormField>

            <div class="flex gap-4">
                <UButton type="submit" :loading="loading">
                    {{ isNew ? 'Create' : 'Update' }}
                </UButton>
            </div>
        </UForm>
    </UContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { subscribe } from '~~/server/db/schema'

const route = useRoute()
const isNew = route.params.id === 'new'

const schema = createInsertSchema(subscribe, {
    name: () => z.string().min(1, 'Name is required'),
    link: () => z.url(),
    get_code: () => z.string().min(1, 'get_code is required'),
    content_code: () => z.string().min(1, 'content_code is required'),
    interval: () => z.string().min(1, 'Interval is required'),
})

type Schema = z.infer<typeof schema>

const { data: state, execute: fetchData, status: fetchStatus, error: fetchError } = await useFetch<Schema>(`/api/subscribe/${route.params.id}`, {
    immediate: false,
    default: () => ({
        enable: true,
        interval: '1h'
    } as Schema)
})
if (!isNew) {
    fetchData()
}
const submitUrl = isNew ? '/api/subscribe' : `/api/subscribe/${route.params.id}`
const { pending: loading, execute: submit, error: submitError, status: submitStatus } = await useFetch(submitUrl, {
    server: false,
    immediate: false,
    method: isNew ? 'POST' : 'PUT',
    body: state
})
watch(submitStatus, async (newStatus) => {
    if (newStatus === 'success') {
        await navigateTo('/')
    }
})
</script>