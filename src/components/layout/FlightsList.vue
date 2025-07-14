<script setup lang="ts">
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { computed, readonly } from 'vue'
// POPRAWKA: Import typu Flight z centralnego źródła
import type { Flight } from '@/types/flights'

// Interface dla props komponentu
interface FlightsListProps {
  flights: Flight[]
  favoriteFlights?: string[]
  loading?: boolean
  emptyMessage?: string
}

// Interface dla eventów emitowanych przez komponent
interface FlightsListEmits {
  (event: 'toggle-favorite', flightId: string): void
  (event: 'select-flight', flightId: string): void
}

// Props z typowaniem
const props = withDefaults(defineProps<FlightsListProps>(), {
  favoriteFlights: () => [],
  loading: false,
  emptyMessage: 'Brak dostępnych lotów',
})

// Definicja emitów z typowaniem
const emit = defineEmits<FlightsListEmits>()

// Stała dla domyślnego logo z lepszym typowaniem
const defaultLogoPath: string = '/src/assets/mock/airlines/default.png'

// Type guard dla sprawdzania czy flight ma wymagane pola
const isValidFlight = (flight: Flight): boolean => {
  return !!(
    flight.id &&
    flight.airline &&
    flight.departureTime &&
    flight.arrivalTime &&
    flight.price &&
    flight.currency
  )
}

// Type guard dla sprawdzania poprawności URL obrazu
const isValidImageUrl = (url: string): boolean => {
  try {
    // Sprawdzenie czy URL jest względny lub bezwzględny
    return url.startsWith('/') || url.startsWith('http') || url.startsWith('data:')
  } catch {
    return false
  }
}

// Funkcja formatowania przesiadek z typowaniem
const formatStops = (stops: number): string => {
  if (!Number.isInteger(stops) || stops < 0) {
    return 'Nieznane'
  }

  if (stops === 0) return 'Bezpośredni'
  if (stops === 1) return '1 przesiadka'
  return `${stops} przesiadki`
}

// Funkcja formatowania lokacji przesiadek
const formatStopLocations = (locations: string[]): string => {
  if (!Array.isArray(locations) || locations.length === 0) {
    return ''
  }

  return locations.filter((location) => location && location.trim()).join(', ')
}

// Funkcja obsługi błędów ładowania obrazów z typowaniem
const handleImageError = (event: Event): void => {
  const imgElement = event.target as HTMLImageElement | null

  if (!imgElement) return

  // Zapobieganie nieskończonej pętli błędów
  if (
    imgElement.src === window.location.origin + defaultLogoPath ||
    imgElement.src === defaultLogoPath
  ) {
    return
  }

  imgElement.src = defaultLogoPath
}

// Funkcja pobierania bezpiecznego URL logo
const getSafeLogoUrl = (flight: Flight): string => {
  if (flight.airlineLogo && isValidImageUrl(flight.airlineLogo)) {
    return flight.airlineLogo
  }
  return defaultLogoPath
}

// POPRAWKA: Event handlers z poprawnym typowaniem
const handleAddToFavorites = (flight: Flight): void => {
  emit('toggle-favorite', flight.id)
}

const handleSelectFlight = (flight: Flight): void => {
  emit('select-flight', flight.id)
}

// Computed property dla filtrowania prawidłowych lotów
const validFlights = computed<Flight[]>(() => {
  return props.flights.filter((flight) => {
    const isValid = isValidFlight(flight)
    if (!isValid && import.meta.env.DEV) {
      console.warn('FlightsList: Pomijanie nieprawidłowego lotu:', flight)
    }
    return isValid
  })
})

// Computed property dla sprawdzenia czy są dostępne loty
const hasFlights = computed<boolean>(() => validFlights.value.length > 0)

// Funkcja formatowania ceny z walidacją
const formatPrice = (price: number, currency: string): string => {
  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return 'Cena niedostępna'
  }

  if (!currency || typeof currency !== 'string') {
    return `${price.toFixed(2)}`
  }

  return `${price.toFixed(2)} ${currency}`
}

// Funkcja pobierania klasy CSS dla przesiadek
const getStopsTextClass = (stops: number): string => {
  if (stops === 0) {
    return 'text-green-600 font-medium'
  }
  return 'text-gray-600'
}

// Expose funkcji dla parent component
defineExpose({
  validFlights: readonly(validFlights),
  hasFlights: readonly(hasFlights),
  formatStops,
  formatPrice,
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  // Sprawdzenie czy wszystkie loty mają wymagane pola
  props.flights.forEach((flight, index) => {
    if (!isValidFlight(flight)) {
      console.warn(`FlightsList: Nieprawidłowy lot na pozycji ${index}:`, flight)
    }

    // Sprawdzenie czy logo URL jest bezpieczny
    if (flight.airlineLogo && !isValidImageUrl(flight.airlineLogo)) {
      console.warn(`FlightsList: Nieprawidłowy URL logo dla lotu ${flight.id}:`, flight.airlineLogo)
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Komunikat gdy brak lotów -->
    <div v-if="!hasFlights" class="bg-white rounded-lg shadow-md p-8 text-center">
      <div class="flex flex-col items-center gap-4">
        <i class="fas fa-plane-slash text-4xl text-gray-400" aria-hidden="true"></i>
        <h3 class="text-lg font-medium text-gray-700">Brak dostępnych lotów</h3>
        <p class="text-sm text-gray-500">
          Spróbuj zmienić kryteria wyszukiwania lub sprawdź połączenie internetowe.
        </p>
      </div>
    </div>

    <!-- Lista lotów -->
    <div
      v-for="flight in validFlights"
      :key="flight.id"
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      role="article"
      :aria-label="`Lot ${flight.airline} z ${flight.departureAirportCode} do ${flight.arrivalAirportCode}`"
    >
      <div class="flex flex-col md:flex-row">
        <!-- Linia lotnicza i logo -->
        <div
          class="p-4 md:p-6 md:w-1/5 border-b md:border-b-0 md:border-r border-gray-200 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start"
        >
          <div class="flex items-center gap-3">
            <img
              :src="getSafeLogoUrl(flight)"
              :alt="`Logo ${flight.airline}`"
              class="w-10 h-10 object-contain"
              @error="handleImageError"
              loading="lazy"
            />
            <div>
              <p class="font-medium text-gray-800">{{ flight.airline }}</p>
              <p class="text-xs text-gray-500">{{ flight.airlineCode }}</p>
            </div>
          </div>
          <button
            class="text-gray-400 hover:text-yellow-500 md:mt-4 transition-colors focus:outline-none focus:text-yellow-500"
            @click="handleAddToFavorites(flight)"
            :aria-label="`Dodaj lot ${flight.airline} do ulubionych`"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <!-- Szczegóły lotu -->
        <div class="p-4 md:p-6 flex-1 flex flex-col md:flex-row">
          <div class="flex-1">
            <!-- Czas wylotu i przylotu -->
            <div class="flex items-center justify-between mb-4">
              <div class="text-center">
                <p
                  class="text-2xl font-semibold"
                  :aria-label="`Wylot o godzinie ${flight.departureTime}`"
                >
                  {{ flight.departureTime }}
                </p>
                <p class="text-sm text-gray-500">{{ flight.departureAirportCode }}</p>
              </div>

              <div class="flex-1 mx-4 relative" aria-label="`Czas lotu: ${flight.duration}`">
                <div class="h-0.5 bg-gray-300 absolute w-full top-1/2"></div>
                <div class="flex justify-center">
                  <span class="bg-white px-2 relative text-xs text-gray-500">{{
                    flight.duration
                  }}</span>
                </div>
                <div class="flex justify-between absolute w-full top-1/2 -translate-y-1/2">
                  <span class="w-2 h-2 rounded-full bg-gray-500" aria-hidden="true"></span>
                  <span class="w-2 h-2 rounded-full bg-gray-500" aria-hidden="true"></span>
                </div>
              </div>

              <div class="text-center">
                <p
                  class="text-2xl font-semibold"
                  :aria-label="`Przylot o godzinie ${flight.arrivalTime}`"
                >
                  {{ flight.arrivalTime }}
                </p>
                <p class="text-sm text-gray-500">{{ flight.arrivalAirportCode }}</p>
              </div>
            </div>

            <!-- Przesiadki -->
            <div class="text-center mb-4">
              <p class="text-sm" :class="getStopsTextClass(flight.stops)">
                {{ formatStops(flight.stops) }}
              </p>
              <p
                v-if="flight.stops > 0 && flight.stopLocations?.length > 0"
                class="text-xs text-gray-500 mt-1"
              >
                {{ formatStopLocations(flight.stopLocations) }}
              </p>
            </div>

            <!-- Lotniska -->
            <div class="flex justify-between text-xs text-gray-500">
              <p class="truncate max-w-[45%]" :title="flight.departureAirport">
                {{ flight.departureAirport }}
              </p>
              <p class="truncate max-w-[45%] text-right" :title="flight.arrivalAirport">
                {{ flight.arrivalAirport }}
              </p>
            </div>
          </div>

          <!-- Cena i przycisk -->
          <div
            class="mt-4 md:mt-0 md:ml-6 md:min-w-[150px] flex flex-row md:flex-col items-center justify-between md:justify-center gap-4"
          >
            <div class="text-center">
              <p class="text-sm text-gray-500">Cena od</p>
              <p
                class="text-2xl font-bold text-primary-600"
                :aria-label="`Cena: ${formatPrice(flight.price, flight.currency)}`"
              >
                {{ formatPrice(flight.price, flight.currency) }}
              </p>
            </div>
            <AnimatedButton
              variant="primary"
              @click="handleSelectFlight(flight)"
              :aria-label="`Wybierz lot ${flight.airline} za ${formatPrice(flight.price, flight.currency)}`"
              class="min-w-[100px]"
            >
              Wybierz
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
