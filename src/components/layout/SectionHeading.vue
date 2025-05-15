<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-2">{{ title }}</h1>
    <p v-if="subtitle" class="text-xl opacity-90">{{ subtitle }}</p>
  </div>
</template>