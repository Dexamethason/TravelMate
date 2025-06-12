<script setup lang="ts">
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

interface Accommodation {
  id: number
  title: string
  description: string
  price: number
  rating: number
  image: string
}

defineProps<{
  accommodations: Accommodation[]
}>()

const getRatingStars = (rating: number) => "★".repeat(Math.round(rating))
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Lista hoteli -->
    <div
      v-for="accommodation in accommodations"
      :key="accommodation.id"
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div class="flex flex-col md:flex-row">
        <!-- Zdjęcie hotelu -->
        <div class="w-full md:w-1/3">
          <img
            :src="accommodation.image"
            :alt="accommodation.title"
            class="w-full h-48 md:h-full object-cover"
          />
        </div>

        <!-- Informacje o hotelu -->
        <div class="flex-1 p-6">
          <div class="flex flex-col h-full">
            <!-- Nagłówek z tytułem i oceną -->
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-semibold text-gray-800">{{ accommodation.title }}</h3>
              <div class="flex items-center">
                <span class="text-yellow-400 text-lg">{{ getRatingStars(accommodation.rating) }}</span>
                <span class="ml-2 text-gray-600">({{ accommodation.rating }})</span>
              </div>
            </div>

            <!-- Opis -->
            <p class="text-gray-600 mb-4 flex-grow">{{ accommodation.description }}</p>

            <!-- Cena i przyciski -->
            <div class="flex flex-wrap justify-between items-center gap-4 mt-auto">
              <div>
                <p class="text-sm text-gray-500 mb-1">Cena za noc</p>
                <p class="text-2xl font-bold text-primary-600">{{ accommodation.price }} zł</p>
              </div>
              <div class="flex gap-4">
                <AnimatedButton variant="outline">Dodaj do planera</AnimatedButton>
                <AnimatedButton variant="primary">Przejdź do oferty</AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
