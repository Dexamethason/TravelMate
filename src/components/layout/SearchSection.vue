<script setup lang="ts">
import { ref } from 'vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

const checkInInput = ref<HTMLInputElement | null>(null)
const checkOutInput = ref<HTMLInputElement | null>(null)
const checkInDate = ref('')
const checkOutDate = ref('')

const openDatePicker = (type: 'checkIn' | 'checkOut') => {
  if (type === 'checkIn' && checkInInput.value) {
    checkInInput.value.showPicker()
  } else if (type === 'checkOut' && checkOutInput.value) {
    checkOutInput.value.showPicker()
  }
}

const guestsInput = ref<HTMLSelectElement | null>(null)
const selectedGuests = ref('2 osoby, 1 łóżko')

const openGuestsPicker = () => {
  if (guestsInput.value) {
    guestsInput.value.click()
  }
}

const guestOptions = [
  '1 osoba, 1 łóżko',
  '2 osoby, 1 łóżko',
  '2 osoby, 2 łóżka',
  '3 osoby, 2 łóżka',
  '3 osoby, 3 łóżka',
  '4 osoby, 2 łóżka',
  '4 osoby, 3 łóżka',
  '4 osoby, 4 łóżka'
]
</script>

<template>
  <section class="py-12 bg-white -mt-24 relative z-10">
    <!-- Marketing text container with improved spacing -->
    <div class="container mx-auto px-4 mb-8">
      <div class="text-center max-w-3xl mx-auto">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Twój wymarzony nocleg czeka
        </h2>
        <p class="text-base sm:text-lg text-gray-600 mx-auto max-w-2xl leading-relaxed">
          Przeszukaj tysiące ofert i znajdź idealne miejsce w najlepszej cenie.
        </p>
      </div>
    </div>

    <!-- Search form container with improved spacing -->
    <div class="container mx-auto px-4">
      <form class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <!-- lokalizacja -->
        <div 
          class="relative w-full text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <span class="block text-xs text-gray-500 mb-1.5">Lokalizacja</span>
          <input
            type="text"
            placeholder="Gdzie chcesz nocować?"
            class="w-full bg-transparent text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-0"
          />
        </div>

        <!-- daty with improved gap -->
        <div class="col-span-2 grid grid-cols-2 gap-3">
          <!-- zameldowanie -->
          <div
            class="relative w-full text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
            @click="openDatePicker('checkIn')"
          >
            <span class="block text-xs text-gray-500 mb-1.5">Zameldowanie</span>
            <input
              ref="checkInInput"
              type="date"
              v-model="checkInDate"
              class="w-full bg-transparent text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-0"
            />
          </div>

          <!-- wymeldowanie -->
          <div
            class="relative w-full text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
            @click="openDatePicker('checkOut')"
          >
            <span class="block text-xs text-gray-500 mb-1.5">Wymeldowanie</span>
            <input
              ref="checkOutInput"
              type="date"
              v-model="checkOutDate"
              class="w-full bg-transparent text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <!-- goscie -->
        <div 
          class="relative w-full text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
          @click="openGuestsPicker"
        >
          <span class="block text-xs text-gray-500 mb-1.5">Liczba gości</span>
          <select
            ref="guestsInput"
            v-model="selectedGuests"
            class="w-full bg-transparent text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-0 appearance-none"
          >
            <option 
              v-for="option in guestOptions" 
              :key="option" 
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>

        <!-- search button with improved spacing -->
        <div class="md:col-span-4 flex justify-center mt-6">
          <AnimatedButton class="px-8 py-3">Szukaj</AnimatedButton>
        </div>
      </form>
    </div>
  </section>
</template>