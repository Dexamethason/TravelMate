<script setup lang="ts">
import { computed, ref, onMounted, readonly } from 'vue'
import type { Accommodation } from '@/types/accommodation'

// Interface dla props komponentu - POPRAWKA: dodano interactive
interface MapPlaceholderProps {
  accommodations?: Accommodation[]
  selectedAccommodationId?: string | null
  height?: string
  width?: string
  showControls?: boolean
  centerLat?: number
  centerLng?: number
  interactive?: boolean // POPRAWKA: dodano brakującą właściwość
}

// Interface dla eventów emitowanych przez komponent
interface MapPlaceholderEmits {
  (event: 'marker-click', accommodationId: string): void
  (event: 'map-ready'): void
  (event: 'accommodation-hover', accommodationId: string | null): void
}

// Props z domyślnymi wartościami - POPRAWKA: dodano domyślną wartość dla interactive
const props = withDefaults(defineProps<MapPlaceholderProps>(), {
  accommodations: () => [],
  selectedAccommodationId: null,
  height: '400px',
  width: '100%',
  showControls: true,
  centerLat: 0,
  centerLng: 0,
  interactive: true, // POPRAWKA: domyślnie true
})

// Definicja emitów
const emit = defineEmits<MapPlaceholderEmits>()

// Stan komponentu
const hoveredAccommodationId = ref<string | null>(null)
const isMapReady = ref<boolean>(true) // Placeholder jest zawsze "gotowy"

// Type guard dla sprawdzania czy accommodation ma koordynaty
const hasValidCoordinates = (accommodation: Accommodation): boolean => {
  return !!(
    accommodation.coordinates &&
    typeof accommodation.coordinates.lat === 'number' &&
    typeof accommodation.coordinates.lng === 'number' &&
    accommodation.coordinates.lat >= -90 &&
    accommodation.coordinates.lat <= 90 &&
    accommodation.coordinates.lng >= -180 &&
    accommodation.coordinates.lng <= 180
  )
}

// Computed property dla accommodations z koordynatami
const accommodationsWithCoordinates = computed<Accommodation[]>(() => {
  return props.accommodations.filter(hasValidCoordinates)
})

// Computed property dla sprawdzenia czy są markery do wyświetlenia
const hasMarkers = computed<boolean>(() => {
  return accommodationsWithCoordinates.value.length > 0
})

// Computed property dla stylów kontenera
const containerStyle = computed<Record<string, string>>(() => ({
  height: props.height,
  width: props.width,
  minHeight: '300px',
}))

// Handler kliknięcia w marker
const handleMarkerClick = (accommodationId: string): void => {
  if (!props.interactive) return

  const accommodation = accommodationsWithCoordinates.value.find(
    (acc) => acc.id === accommodationId,
  )
  if (!accommodation) {
    console.warn('MapPlaceholder: Nie znaleziono zakwaterowania o ID:', accommodationId)
    return
  }

  emit('marker-click', accommodationId)
}

// Handler hover nad markerem
const handleMarkerHover = (accommodationId: string | null): void => {
  if (!props.interactive) return

  hoveredAccommodationId.value = accommodationId
  emit('accommodation-hover', accommodationId)
}

// Handler opuszczenia markera
const handleMarkerLeave = (): void => {
  if (!props.interactive) return

  hoveredAccommodationId.value = null
  emit('accommodation-hover', null)
}

// Funkcja pobierania ikony dla typu zakwaterowania
const getAccommodationIcon = (type: Accommodation['type']): string => {
  const icons: Record<Accommodation['type'], string> = {
    hotel: '🏨',
    apartment: '🏠',
    hostel: '🏠',
    guesthouse: '🏡',
    villa: '🏰',
  }
  return icons[type] || '📍'
}

// Funkcja sprawdzania czy marker jest wybrany
const isMarkerSelected = (accommodationId: string): boolean => {
  return props.selectedAccommodationId === accommodationId
}

// Funkcja sprawdzania czy marker jest hovered
const isMarkerHovered = (accommodationId: string): boolean => {
  return hoveredAccommodationId.value === accommodationId
}

// Funkcja formatowania ceny dla tooltip
const formatPrice = (price: number, currency: string): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'Cena niedostępna'
  }
  return `${price.toFixed(0)} ${currency || 'PLN'}`
}

// Funkcja resetowania hover state - pomocnicza dla użytkowników komponentu
const resetHoverState = (): void => {
  hoveredAccommodationId.value = null
  emit('accommodation-hover', null)
}

// Funkcja centrowania na marker - dla przyszłej implementacji
const centerOnMarker = (accommodationId: string): void => {
  const accommodation = accommodationsWithCoordinates.value.find(
    (acc) => acc.id === accommodationId,
  )
  if (!accommodation) {
    console.warn('MapPlaceholder: Nie można wycentrować na markera o ID:', accommodationId)
    return
  }

  // W przyszłej implementacji tutaj będzie logika centrowania mapy
  console.log('MapPlaceholder: Centrowanie na marker:', accommodation.name)
}

// Emit map ready po mount
onMounted((): void => {
  emit('map-ready')
})

// Expose funkcji dla parent component
defineExpose({
  accommodationsWithCoordinates: readonly(accommodationsWithCoordinates),
  hasMarkers: readonly(hasMarkers),
  isMapReady: readonly(isMapReady),
  resetHoverState,
  centerOnMarker,
  focusMarker: (accommodationId: string): void => {
    const marker = document.querySelector(`[data-marker-id="${accommodationId}"]`) as HTMLElement
    marker?.focus()
  },
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  console.log('MapPlaceholder: Załadowano', accommodationsWithCoordinates.value.length, 'markerów')
  console.log('MapPlaceholder: Interactive mode:', props.interactive)

  props.accommodations.forEach((accommodation, index) => {
    if (!hasValidCoordinates(accommodation)) {
      console.warn(
        `MapPlaceholder: Zakwaterowanie na pozycji ${index} nie ma prawidłowych koordynat:`,
        accommodation,
      )
    }

    // Sprawdzenie czy ma wymagane pola
    if (!accommodation.name || !accommodation.price) {
      console.warn(`MapPlaceholder: Zakwaterowanie na pozycji ${index} nie ma wymaganych pól:`, {
        name: accommodation.name,
        price: accommodation.price,
      })
    }
  })
}
</script>

<template>
  <section class="bg-gray-100 py-16">
    <!-- Stała szerokość 1184px, płynne przesuwanie poniżej -->
    <div class="w-full mx-auto px-4 sm:px-6 md:px-8" style="width: min(1184px, 100vw)">
      <div class="bg-white rounded-lg shadow-md w-full h-full flex items-center justify-center p-4">
        <div class="text-center">
          <div class="text-4xl text-gray-400 mb-2">🗺️</div>
          <p class="text-gray-600">Mapa zostanie zintegrowana później</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Animacje dla markerów */
.scale-102 {
  transform: scale(1.02);
}

.scale-105 {
  transform: scale(1.05);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none;
  }

  .scale-102,
  .scale-105 {
    transform: none;
  }
}

/* Focus styles */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Disabled states */
button:disabled {
  cursor: not-allowed;
}

button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Grid responsiveness */
@media (max-width: 640px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white {
    border: 1px solid currentColor;
  }
}
</style>
