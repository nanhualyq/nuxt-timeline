<script setup lang="ts">
const props = defineProps<{
  id: number;
}>();

const isStar = defineModel<boolean>({ required: true });

const toast = useToast();
const isLoading = ref(false);

const toggleStar = async () => {
  const newIsStar = !isStar.value;
  isStar.value = newIsStar;

  isLoading.value = true;
  try {
    await $fetch(`/api/content/${props.id}`, {
      method: 'PATCH',
      body: { is_star: newIsStar },
    });
  } catch (error) {
    // Revert on error
    isStar.value = !newIsStar;
    console.error('Failed to update star status:', error);
    toast.add({
      title: 'Failed to update star',
      description: 'There was an error updating the star status. Please try again.',
      icon: 'material-symbols:error',
      color: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <UIcon
    name="material-symbols:star"
    class="cursor-pointer transition-colors"
    :class="{
      'text-yellow-400': isStar,
      'text-gray-400': !isStar,
      'opacity-50': isLoading,
    }"
    size="1.5rem"
    @click.stop="toggleStar"
  />
</template>