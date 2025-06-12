<script setup lang="ts">
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { computed } from 'vue'
import type { Flight } from '@/mock/mockFlights'

interface Props {
  flights: Flight[]
}

const props = defineProps<Props>()

const formatStops = (stops: number) => {
  if (stops === 0) return 'Bezpośredni'
  if (stops === 1) return '1 przesiadka'
  return `${stops} przesiadki`
}

// Use a variable for the default logo path to ensure consistency
const defaultLogoPath = '/src/assets/mock/airlines/default.png'

// Handle image loading errors by setting the default logo
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement
  
  // Prevent infinite error loops by checking if the current src is already the default
  if (imgElement && imgElement.src !== window.location.origin + defaultLogoPath) {
    imgElement.src = defaultLogoPath
  }
}

const emit = defineEmits(['addToFavorites', 'selectFlight'])
</script>

<template>
  <div class="flex flex-col gap-6">
    <div 
      v-for="flight in flights" 
      :key="flight.id"
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div class="flex flex-col md:flex-row">
        <!-- Linia lotnicza i logo -->
        <div class="p-4 md:p-6 md:w-1/5 border-b md:border-b-0 md:border-r border-gray-200 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start">          <div class="flex items-center gap-3">            <img 
              :src="flight.airlineLogo || defaultLogoPath" 
              :alt="flight.airline" 
              class="w-10 h-10 object-contain"
              @error="handleImageError"
            />
            <div>
              <p class="font-medium text-gray-800">{{ flight.airline }}</p>
              <p class="text-xs text-gray-500">{{ flight.airlineCode }}</p>
            </div>
          </div>
          <button 
            class="text-gray-400 hover:text-yellow-500 md:mt-4"
            @click="emit('addToFavorites', flight.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <!-- Szczegóły lotu -->
        <div class="p-4 md:p-6 flex-1 flex flex-col md:flex-row">
          <div class="flex-1">
            <!-- Czas wylotu i przylotu -->
            <div class="flex items-center justify-between mb-4">
              <div class="text-center">
                <p class="text-2xl font-semibold">{{ flight.departureTime }}</p>
                <p class="text-sm text-gray-500">{{ flight.departureAirportCode }}</p>
              </div>
              
              <div class="flex-1 mx-4 relative">
                <div class="h-0.5 bg-gray-300 absolute w-full top-1/2"></div>
                <div class="flex justify-center">
                  <span class="bg-white px-2 relative text-xs text-gray-500">{{ flight.duration }}</span>
                </div>
                <div class="flex justify-between absolute w-full top-1/2 -translate-y-1/2">
                  <span class="w-2 h-2 rounded-full bg-gray-500"></span>
                  <span class="w-2 h-2 rounded-full bg-gray-500"></span>
                </div>
              </div>
              
              <div class="text-center">
                <p class="text-2xl font-semibold">{{ flight.arrivalTime }}</p>
                <p class="text-sm text-gray-500">{{ flight.arrivalAirportCode }}</p>
              </div>
            </div>
            
            <!-- Przesiadki -->
            <div class="text-center mb-4">
              <p class="text-sm" :class="flight.stops === 0 ? 'text-green-600 font-medium' : 'text-gray-600'">
                {{ formatStops(flight.stops) }}
              </p>
              <p v-if="flight.stops > 0" class="text-xs text-gray-500 mt-1">
                {{ flight.stopLocations.join(', ') }}
              </p>
            </div>
            
            <!-- Lotniska -->
            <div class="flex justify-between text-xs text-gray-500">
              <p>{{ flight.departureAirport }}</p>
              <p>{{ flight.arrivalAirport }}</p>
            </div>
          </div>
          
          <!-- Cena i przycisk -->
          <div class="mt-4 md:mt-0 md:ml-6 md:min-w-[150px] flex flex-row md:flex-col items-center justify-between md:justify-center gap-4">
            <div class="text-center">
              <p class="text-sm text-gray-500">Cena od</p>
              <p class="text-2xl font-bold text-primary-600">{{ flight.price }} {{ flight.currency }}</p>
            </div>
            <AnimatedButton 
              variant="primary"
              @click="emit('selectFlight', flight.id)"
            >
              Wybierz
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
