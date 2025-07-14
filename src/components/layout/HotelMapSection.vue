<script setup lang="ts">
// POPRAWKA: Dodano brakujące importy Vue
import { computed, readonly } from 'vue'
import AccommodationsList from './AccommodationsList.vue'
import MapPlaceholder from './MapPlaceholder.vue'

// POPRAWKA: Poprawne importy - funkcje jako wartości, typy jako typy
import type { Accommodation } from '@/types/accommodation'
import { isValidAccommodation, hasValidCoordinates } from '@/types/accommodation'

// Interface dla props komponentu
interface HotelMapSectionProps {
  accommodations: Accommodation[]
  selectedAccommodationId?: string | null
  showMap?: boolean
  mapHeight?: string
}

// Interface dla eventów emitowanych przez komponent
interface HotelMapSectionEmits {
  (event: 'accommodation-select', accommodationId: string): void
  (event: 'accommodation-favorite', accommodationId: string): void
  (event: 'map-marker-click', accommodationId: string): void
  (event: 'accommodations-loaded', count: number): void
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<HotelMapSectionProps>(), {
  selectedAccommodationId: null,
  showMap: true,
  mapHeight: 'calc(100vh - 2rem)',
})

// Definicja emitów
const emit = defineEmits<HotelMapSectionEmits>()

// Computed property dla filtrowania prawidłowych zakwaterowań
const validAccommodations = computed<Accommodation[]>(() => {
  const filtered = props.accommodations.filter((accommodation: Accommodation) => {
    const isValid = isValidAccommodation(accommodation)
    if (!isValid && import.meta.env.DEV) {
      console.warn('HotelMapSection: Pomijanie nieprawidłowego zakwaterowania:', accommodation)
    }
    return isValid
  })

  // Emit liczby załadowanych zakwaterowań
  if (filtered.length !== props.accommodations.length) {
    emit('accommodations-loaded', filtered.length)
  }

  return filtered
})

// Computed property dla zakwaterowań z koordinatami (dla mapy)
const accommodationsWithCoordinates = computed<Accommodation[]>(() => {
  return validAccommodations.value.filter((accommodation: Accommodation) =>
    hasValidCoordinates(accommodation),
  )
})

// Computed property dla sprawdzenia czy są dostępne zakwaterowania
const hasAccommodations = computed<boolean>(() => {
  return validAccommodations.value.length > 0
})

// Computed property dla sprawdzenia czy można wyświetlić mapę
const canShowMap = computed<boolean>(() => {
  return props.showMap && accommodationsWithCoordinates.value.length > 0
})

// Computed property dla wybranego zakwaterowania
const selectedAccommodation = computed<Accommodation | null>(() => {
  if (!props.selectedAccommodationId) return null
  return (
    validAccommodations.value.find(
      (acc: Accommodation) => acc.id === props.selectedAccommodationId,
    ) || null
  )
})

// Handler wyboru zakwaterowania
const handleAccommodationSelect = (accommodationId: string): void => {
  if (!accommodationId) {
    console.warn('HotelMapSection: Nieprawidłowe ID zakwaterowania')
    return
  }

  const accommodation = validAccommodations.value.find(
    (acc: Accommodation) => acc.id === accommodationId,
  )
  if (!accommodation) {
    console.warn('HotelMapSection: Nie znaleziono zakwaterowania o ID:', accommodationId)
    return
  }

  emit('accommodation-select', accommodationId)
}

// Handler dodawania do ulubionych
const handleAccommodationFavorite = (accommodationId: string): void => {
  if (!accommodationId) {
    console.warn('HotelMapSection: Nieprawidłowe ID zakwaterowania dla ulubionych')
    return
  }

  emit('accommodation-favorite', accommodationId)
}

// Handler kliknięcia markera na mapie
const handleMapMarkerClick = (accommodationId: string): void => {
  if (!accommodationId) {
    console.warn('HotelMapSection: Nieprawidłowe ID zakwaterowania z mapy')
    return
  }

  emit('map-marker-click', accommodationId)
}

// Funkcja pobierania statystyk - POPRAWKA: dodano typy parametrów
const getAccommodationsStats = () => {
  const stats = {
    total: validAccommodations.value.length,
    withCoordinates: accommodationsWithCoordinates.value.length,
    available: validAccommodations.value.filter((acc: Accommodation) => acc.availability).length,
    byType: {} as Record<string, number>,
  }

  validAccommodations.value.forEach((acc: Accommodation) => {
    stats.byType[acc.type] = (stats.byType[acc.type] || 0) + 1
  })

  return stats
}

// POPRAWKA: Computed property dla kompatybilnych zakwaterowań z AccommodationsList
// Konwertuje Accommodation[] na ExtendedAccommodation[] z dodatkowymi polami
const extendedAccommodations = computed(() => {
  return validAccommodations.value.map((accommodation: Accommodation) => ({
    ...accommodation,
    isFavorite: false, // Domyślnie false, można przekazać z props lub store
    maxGuests: undefined, // Można dodać logikę obliczania na podstawie dostępnych danych
  }))
})

// Expose funkcji dla parent component
defineExpose({
  validAccommodations: readonly(validAccommodations),
  accommodationsWithCoordinates: readonly(accommodationsWithCoordinates),
  hasAccommodations: readonly(hasAccommodations),
  canShowMap: readonly(canShowMap),
  selectedAccommodation: readonly(selectedAccommodation),
  getAccommodationsStats,
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  // Sprawdzenie czy wszystkie zakwaterowania mają wymagane pola
  props.accommodations.forEach((accommodation: Accommodation, index: number) => {
    if (!isValidAccommodation(accommodation)) {
      console.warn(
        `HotelMapSection: Nieprawidłowe zakwaterowanie na pozycji ${index}:`,
        accommodation,
      )
    }

    // Sprawdzenie koordinat
    if (accommodation.coordinates && !hasValidCoordinates(accommodation)) {
      console.warn(
        `HotelMapSection: Nieprawidłowe koordynaty dla zakwaterowania ${accommodation.id}:`,
        accommodation.coordinates,
      )
    }

    // Sprawdzenie ceny
    if (typeof accommodation.price !== 'number' || accommodation.price < 0) {
      console.warn(
        `HotelMapSection: Nieprawidłowa cena dla zakwaterowania ${accommodation.id}:`,
        accommodation.price,
      )
    }
  })

  // Log statystyk
  const stats = getAccommodationsStats()
  console.log('HotelMapSection: Statystyki zakwaterowań:', stats)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Komunikat gdy brak zakwaterowań -->
    <div
      v-if="!hasAccommodations"
      class="bg-white rounded-lg shadow-md p-8 text-center"
      role="alert"
      aria-live="polite"
    >
      <div class="flex flex-col items-center gap-4">
        <i class="fas fa-bed text-4xl text-gray-400" aria-hidden="true"></i>
        <h3 class="text-lg font-medium text-gray-700">Brak dostępnych zakwaterowań</h3>
        <p class="text-sm text-gray-500">
          Spróbuj zmienić kryteria wyszukiwania lub sprawdź połączenie internetowe.
        </p>
      </div>
    </div>

    <!-- Layout z listą i mapą -->
    <div
      v-else
      class="flex flex-col lg:flex-row gap-8"
      role="main"
      aria-label="Sekcja zakwaterowań z listą i mapą"
    >
      <!-- Lista zakwaterowań -->
      <div class="w-full lg:w-3/5">
        <div class="mb-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Dostępne zakwaterowania</h2>
          <p class="text-sm text-gray-600">
            Znaleziono {{ validAccommodations.length }}
            {{ validAccommodations.length === 1 ? 'zakwaterowanie' : 'zakwaterowań' }}
            <span v-if="accommodationsWithCoordinates.length < validAccommodations.length">
              ({{ accommodationsWithCoordinates.length }} z lokalizacją na mapie)
            </span>
          </p>
        </div>

        <!-- POPRAWKA: Używamy extendedAccommodations zamiast compatibleAccommodations -->
        <AccommodationsList
          :accommodations="extendedAccommodations"
          :selected-accommodation-id="selectedAccommodationId"
          @accommodation-select="handleAccommodationSelect"
          @accommodation-favorite="handleAccommodationFavorite"
          aria-label="Lista dostępnych zakwaterowań"
        />
      </div>

      <!-- Mapa -->
      <div
        v-if="canShowMap"
        class="w-full lg:w-2/5 sticky top-4"
        role="complementary"
        aria-label="Mapa z lokalizacjami zakwaterowań"
      >
        <div class="mb-4 lg:hidden">
          <h3 class="text-lg font-semibold text-gray-800">Mapa</h3>
          <p class="text-sm text-gray-600">
            {{ accommodationsWithCoordinates.length }} lokalizacji na mapie
          </p>
        </div>

        <MapPlaceholder
          :accommodations="accommodationsWithCoordinates"
          :selected-accommodation-id="selectedAccommodationId"
          :style="{ height: mapHeight }"
          @marker-click="handleMapMarkerClick"
          aria-label="Interaktywna mapa zakwaterowań"
        />
      </div>

      <!-- Placeholder gdy mapa nie może być wyświetlona -->
      <div v-else-if="props.showMap" class="w-full lg:w-2/5 sticky top-4" role="complementary">
        <div class="bg-gray-100 rounded-lg p-8 text-center" :style="{ height: mapHeight }">
          <div class="flex flex-col items-center justify-center h-full gap-4">
            <i class="fas fa-map-marked-alt text-4xl text-gray-400" aria-hidden="true"></i>
            <h3 class="text-lg font-medium text-gray-700">Mapa niedostępna</h3>
            <p class="text-sm text-gray-500 max-w-xs">
              Brak zakwaterowań z koordynatami geograficznymi do wyświetlenia na mapie.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dodatkowe informacje (opcjonalne) -->
    <div v-if="hasAccommodations && import.meta.env.DEV" class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Statystyki (tryb rozwoju):</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
        <div>Wszystkie: {{ getAccommodationsStats().total }}</div>
        <div>Z koordynatami: {{ getAccommodationsStats().withCoordinates }}</div>
        <div>Dostępne: {{ getAccommodationsStats().available }}</div>
        <div>Typy: {{ Object.keys(getAccommodationsStats().byType).length }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Responsywna wysokość dla sticky positioning */
@media (max-width: 1024px) {
  .sticky {
    position: static;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .sticky {
    position: static;
  }
}

/* Focus styles dla lepszej accessibility */
[role='main']:focus,
[role='complementary']:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
