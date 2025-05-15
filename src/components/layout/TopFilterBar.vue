<script setup lang="ts">
import { ref } from 'vue'

// propsy z rodzica
const props = defineProps<{
  city: string
  dates: {
    checkIn: string
    checkOut: string
  }
  guests: string
}>()

// reaktywne zmienne do formularza
const selectedCity = ref(props.city)
const checkIn = ref(props.dates.checkIn)
const checkOut = ref(props.dates.checkOut)
const guestsCount = ref(props.guests)
const sorting = ref('popular')
</script>

<template>
    <div class="w-full bg-gray-50 py-6">
    <div class="max-w-7xl mx-auto px-4"></div>  
    <div class="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-12">
    <form class="flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-end">
      <!-- miasto -->
      <div class="flex-1 min-w-[160px]"> <!-- zmniejszone z 200 bo za duze bylo -->
        <label class="block text-sm text-gray-500 mb-1">Lokalizacja</label>
        <input
          type="text"
          v-model="selectedCity"
          class="w-full p-2 border rounded-lg hover:border-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="Wprowadź miasto"
        />
      </div>

      <!-- daty przyjazdu i wyjazdu -->
      <div class="flex flex-1 gap-2 sm:gap-4"> <!-- mniejszy gap na mobile bo sie nie miesci -->
        <div class="flex-1">
          <label class="block text-sm text-gray-500 mb-1">Przyjazd</label>
          <input
            type="date"
            v-model="checkIn"
            class="w-full p-2 border rounded-lg hover:border-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm text-gray-500 mb-1">Wyjazd</label>
          <input
            type="date"
            v-model="checkOut"
            class="w-full p-2 border rounded-lg hover:border-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <!-- ile osob i pokoi -->
      <div class="flex-1 min-w-[150px]"> <!-- zmniejszone zeby sie zmiescilo na mobile -->
        <label class="block text-sm text-gray-500 mb-1">Goście</label>
        <select
          v-model="guestsCount"
          class="w-full p-2 border rounded-lg hover:border-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option>1 os., 1 pok.</option> <!-- skrocone bo za dlugie bylo -->
          <option>2 os., 1 pok.</option>
          <option>2 os., 2 pok.</option>
          <option>3 os., 1 pok.</option>
          <option>4 os., 2 pok.</option>
        </select>
      </div>

      <!-- sortowanko -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-500 mb-1">Sortowanie</label>
        <select
          v-model="sorting"
          class="w-full p-2 border rounded-lg hover:border-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="popular">Popularne</option>
          <option value="price-asc">Cena ↑</option>
          <option value="rating-desc">Ocena ↓</option>
        </select>
      </div>
    </form>
  </div>
</div>
</template>