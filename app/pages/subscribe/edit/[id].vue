<template>
  <UContainer>
    <h1 class="text-2xl font-bold mb-6">
      {{ route.params.id === 'new' ? 'Create Subscription' : 'Edit Subscription' }}
    </h1>

    <UForm :state="state" @submit="onSubmit" class="space-y-4">
      <UFormField label="Name" name="name">
        <UInput v-model="state.name" required />
      </UFormField>

      <UFormField label="Link" name="link">
        <UInput v-model="state.link" type="url" required />
      </UFormField>

      <UFormField label="Download Code" name="downloadCode">
        <UTextarea v-model="state.downloadCode" required />
      </UFormField>

      <UFormField label="Content Code" name="contentCode">
        <UTextarea v-model="state.contentCode" required />
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
const route = useRoute()
const router = useRouter()

const state = reactive({
  name: '',
  link: '',
  downloadCode: '',
  contentCode: ''
})

const loading = ref(false)

const { data } = await useFetch(`/api/subscribe/${route.params.id}`, {
  server: false,
  default: () => null
})

if (route.params.id !== 'new' && data.value) {
  Object.assign(state, data.value)
}

const onSubmit = async () => {
  loading.value = true
  try {
    if (route.params.id === 'new') {
      await $fetch('/api/subscribe', {
        method: 'POST',
        body: state
      })
      await navigateTo('/subscribe')
    } else {
      await $fetch(`/api/subscribe/${route.params.id}`, {
        method: 'PUT',
        body: state
      })
      await navigateTo('/subscribe')
    }
  } catch (error) {
    console.error('Error saving subscription:', error)
    // Handle error, maybe show toast
  } finally {
    loading.value = false
  }
}
</script>