<template>
    <UContainer>
        <h1 class="text-2xl font-bold mb-6">
            {{ route.params.id === 'new' ? 'Create Subscription' : 'Edit Subscription' }}
        </h1>

        <UAlert v-if="errors.form" color="error" :description="errors.form" class="mb-4" />

        <UForm :state="state" @submit="onSubmit" class="space-y-4">
            <UFormField label="Name" name="name" :error="errors.name">
                <UInput v-model="state.name" />
            </UFormField>

            <UFormField label="Link" name="link" :error="errors.link">
                <UInput v-model="state.link" type="url" />
            </UFormField>

            <UFormField label="Download Code" name="downloadCode" :error="errors.downloadCode">
                <UTextarea v-model="state.downloadCode" />
            </UFormField>

            <UFormField label="Content Code" name="contentCode" :error="errors.contentCode">
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

const schema = createInsertSchema(subscribe, {
    link: () => z.url()
}).pick({
    name: true,
    link: true,
    downloadCode: true,
    contentCode: true
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
    name: '',
    link: '',
    downloadCode: '',
    contentCode: ''
})

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const { data } = await useFetch(`/api/subscribe/${route.params.id}`, {
    server: false,
    default: () => null
})

if (route.params.id !== 'new' && data.value) {
    state.name = data.value.name
    state.link = data.value.link
    state.downloadCode = data.value.downloadCode
    state.contentCode = data.value.contentCode
}

const validate = () => {
    const result = schema.safeParse(state)
    if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
            const path = issue.path.join('.')
            if (!fieldErrors[path]) {
                fieldErrors[path] = issue.message
            }
        }
        errors.value = fieldErrors
        return false
    }
    errors.value = {}
    return true
}

const onSubmit = async () => {
    if (!validate()) return

    loading.value = true
    try {
        if (route.params.id === 'new') {
            await $fetch('/api/subscribe', {
                method: 'POST',
                body: state
            })
            await navigateTo('/')
        } else {
            await $fetch(`/api/subscribe/${route.params.id}`, {
                method: 'PUT',
                body: state
            })
            await navigateTo('/')
        }
    } catch (error) {
        console.error('Error saving subscription:', error)
        const err = error as { data?: { message?: string }, message?: string }
        errors.value = {
            form: err.data?.message || err.message || 'Failed to save subscription'
        }
    } finally {
        loading.value = false
    }
}
</script>