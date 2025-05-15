<script setup lang="ts">
import AccommodationsList from './AccommodationsList.vue'
import MapPlaceholder from './MapPlaceholder.vue'

defineProps<{
  accommodations: any[]
}>()
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Hotel List -->
      <div class="w-full lg:w-3/5">
        <AccommodationsList :accommodations="accommodations" />
      </div>

      <!-- Map -->
      <div class="w-full lg:w-2/5 sticky top-4">
        <MapPlaceholder class="h-[calc(100vh-2rem)]" />
      </div>
    </div>
  </div>
</template>