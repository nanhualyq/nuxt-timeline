<template>
    <UContainer>
        <h1 class="text-2xl font-bold mb-6">
            {{ route.params.id === 'new' ? 'Create Subscription' : 'Edit Subscription' }}
        </h1>

        <UAlert v-if="submitStatus === 'error'" color="error" :description="submitError?.statusMessage" class="mb-4" />

        <UForm :schema="schema" :state="state" @submit="submit" class="space-y-4">
            <UFormField label="Name" name="name">
                <UInput v-model="state.name" />
            </UFormField>

            <UFormField label="Link" name="link">
                <UInput v-model="state.link" type="url" />
            </UFormField>

            <UFormField label="Download Code" name="downloadCode">
                <UTextarea v-model="state.downloadCode" />
            </UFormField>

            <UFormField label="Content Code" name="contentCode">
                <UTextarea v-model="state.contentCode" />
            </UFormField>

            <div class="flex gap-4">
                <UButton type="submit" :loading="loading">
                    {{ route.params.id === 'new' ? 'Create' : 'Update' }}
                </UButton>
                <UButton variant="outline" @click="navigateTo('/subscribe')">
                    Cancel
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
    downloadCode: () => z.string().min(1, 'Download Code is required'),
    contentCode: () => z.string().min(1, 'Content Code is required'),
}).pick({
    name: true,
    link: true,
    downloadCode: true,
    contentCode: true
})

type Schema = z.infer<typeof schema>

const { data: state, execute: fetchData } = await useFetch<Schema>(`/api/subscribe/${route.params.id}`, {
    immediate: false,
    default: () => ({
        name: '',
        link: '',
        downloadCode: '',
        contentCode: ''
    })
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
// use watch to navigate on success
watch(submitStatus, async (newStatus) => {
    if (newStatus === 'success') {
        await navigateTo('/')
    }
})
</script>