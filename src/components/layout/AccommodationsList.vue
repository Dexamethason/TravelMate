<script setup lang="ts">
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { computed } from 'vue'
// POPRAWKA: Import funkcji jako wartość, nie jako typ
import type { Accommodation } from '@/types/accommodation'
import { isValidAccommodation } from '@/types/accommodation'

// Typy dla obrazów (jeśli nie ma we wspólnym interfejsie)
type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'
type ImagePath = `${string}.${ImageFormat}`

// Typy dla ocen i walut (jeśli nie ma we wspólnym interfejsie)
type Rating = 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5
type Currency = 'PLN' | 'EUR' | 'USD' | 'GBP'

// Rozszerzony interface dla Accommodation z dodatkowymi właściwościami
interface ExtendedAccommodation extends Accommodation {
  isFavorite?: boolean
  maxGuests?: number
}

// Props komponentu - POPRAWKA: używamy ExtendedAccommodation
interface AccommodationsListProps {
  accommodations: ExtendedAccommodation[]
  selectedAccommodationId?: string | null
  showAddToPlanner?: boolean
  maxItems?: number
  loading?: boolean
  emptyMessage?: string
}

// Eventy emitowane przez komponent - POPRAWKA: używamy ExtendedAccommodation
interface AccommodationsListEmits {
  (event: 'add-to-planner', accommodation: ExtendedAccommodation): void
  (event: 'view-details', accommodation: ExtendedAccommodation): void
  (event: 'load-more'): void
  (event: 'accommodation-select', accommodationId: string): void
  (event: 'accommodation-favorite', accommodationId: string): void
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<AccommodationsListProps>(), {
  selectedAccommodationId: null,
  showAddToPlanner: true,
  maxItems: undefined,
  loading: false,
  emptyMessage: 'Brak dostępnych zakwaterowań',
})

// Definicja emitów
const emit = defineEmits<AccommodationsListEmits>()

// Type guard dla walidacji ścieżek obrazów
const isValidImagePath = (path: string): path is ImagePath => {
  if (!path || typeof path !== 'string') return false

  const validExtensions: ImageFormat[] = ['jpg', 'jpeg', 'png', 'webp', 'avif']
  const extension = path.split('.').pop()?.toLowerCase() as ImageFormat
  return validExtensions.includes(extension)
}

// Type guard dla walidacji oceny
const isValidRating = (rating: number | undefined): rating is Rating => {
  if (typeof rating !== 'number') return false

  const validRatings: Rating[] = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  return validRatings.includes(rating as Rating)
}

// Type guard dla walidacji waluty
const isValidCurrency = (currency: string | undefined): currency is Currency => {
  if (!currency || typeof currency !== 'string') return false

  const validCurrencies: Currency[] = ['PLN', 'EUR', 'USD', 'GBP']
  return validCurrencies.includes(currency as Currency)
}

// POPRAWKA: Type guard dla ExtendedAccommodation
const isValidExtendedAccommodation = (
  accommodation: any,
): accommodation is ExtendedAccommodation => {
  return isValidAccommodation(accommodation)
}

// Funkcja generująca gwiazdki z lepszym typowaniem
const getRatingStars = (rating: number | undefined): string => {
  if (!isValidRating(rating)) return '☆☆☆☆☆'

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - Math.ceil(rating))
}

// Funkcja formatująca cenę z walutą
const formatPrice = (price: number | undefined, currency: string | undefined): string => {
  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return 'Cena niedostępna'
  }

  if (!isValidCurrency(currency)) {
    return `${price.toFixed(2)}`
  }

  const currencySymbols: Record<Currency, string> = {
    PLN: 'zł',
    EUR: '€',
    USD: '$',
    GBP: '£',
  }

  return `${price.toFixed(2)} ${currencySymbols[currency]}`
}

// Funkcja formatująca lokalizację - POPRAWKA: używamy ExtendedAccommodation
const formatLocation = (accommodation: ExtendedAccommodation): string => {
  const parts: string[] = []

  if (accommodation.address) parts.push(accommodation.address)
  if (accommodation.city) parts.push(accommodation.city)
  if (accommodation.country) parts.push(accommodation.country)

  return parts.join(', ')
}

// POPRAWKA: Handler dla error image z proper typing
const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement | null
  if (target) {
    target.src = '/placeholder-hotel.jpg'
  }
}

// Computed property dla przefiltrowanych zakwaterowań - POPRAWKA: używamy nowej funkcji
const displayedAccommodations = computed<ExtendedAccommodation[]>(() => {
  let filtered = props.accommodations.filter(isValidExtendedAccommodation)

  if (props.maxItems && props.maxItems > 0) {
    filtered = filtered.slice(0, props.maxItems)
  }

  return filtered
})

// Computed property dla sprawdzenia czy są więcej elementów do załadowania
const hasMoreItems = computed<boolean>(() => {
  return !!(props.maxItems && props.accommodations.length > props.maxItems)
})

// Funkcja sprawdzająca czy zakwaterowanie jest wybrane
const isAccommodationSelected = (accommodationId: string): boolean => {
  return props.selectedAccommodationId === accommodationId
}

// Handlery eventów z typowaniem - POPRAWKA: używamy ExtendedAccommodation
const handleAddToPlanner = (accommodation: ExtendedAccommodation): void => {
  if (!isValidExtendedAccommodation(accommodation)) {
    console.warn('AccommodationsList: Nieprawidłowe zakwaterowanie dla planera:', accommodation)
    return
  }

  emit('add-to-planner', accommodation)
}

const handleViewDetails = (accommodation: ExtendedAccommodation): void => {
  if (!isValidExtendedAccommodation(accommodation)) {
    console.warn('AccommodationsList: Nieprawidłowe zakwaterowanie dla szczegółów:', accommodation)
    return
  }

  emit('view-details', accommodation)
  emit('accommodation-select', accommodation.id)
}

const handleLoadMore = (): void => {
  emit('load-more')
}

const handleToggleFavorite = (accommodation: ExtendedAccommodation): void => {
  if (!isValidExtendedAccommodation(accommodation)) {
    console.warn('AccommodationsList: Nieprawidłowe zakwaterowanie dla ulubionych:', accommodation)
    return
  }

  emit('accommodation-favorite', accommodation.id)
}

// Expose funkcji dla parent component
defineExpose({
  displayedAccommodations: computed(() => displayedAccommodations.value),
  hasMoreItems,
  isAccommodationSelected,
  formatPrice,
  getRatingStars,
})

// Walidacja danych przy developmencie
if (import.meta.env.DEV) {
  // Sprawdzenie wszystkich zakwaterowań - POPRAWKA: używamy nowej funkcji
  props.accommodations.forEach((accommodation, index) => {
    if (!isValidExtendedAccommodation(accommodation)) {
      console.warn(
        `AccommodationsList: Nieprawidłowe zakwaterowanie na pozycji ${index}:`,
        accommodation,
      )
    }

    // Sprawdzenie obrazu
    if (accommodation.image && !isValidImagePath(accommodation.image)) {
      console.warn(
        `AccommodationsList: Nieprawidłowy format obrazu dla elementu ${index}: ${accommodation.image}`,
      )
    }

    // Sprawdzenie oceny
    if (accommodation.rating && !isValidRating(accommodation.rating)) {
      console.warn(
        `AccommodationsList: Nieprawidłowa ocena dla elementu ${index}: ${accommodation.rating}`,
      )
    }

    // Sprawdzenie ceny
    if (typeof accommodation.price !== 'number' || accommodation.price <= 0) {
      console.warn(
        `AccommodationsList: Nieprawidłowa cena dla elementu ${index}: ${accommodation.price}`,
      )
    }

    // Sprawdzenie waluty
    if (accommodation.currency && !isValidCurrency(accommodation.currency)) {
      console.warn(
        `AccommodationsList: Nieprawidłowa waluta dla elementu ${index}: ${accommodation.currency}`,
      )
    }
  })

  // Log statystyk
  console.log(
    'AccommodationsList: Załadowano',
    displayedAccommodations.value.length,
    'zakwaterowań',
  )
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Stan ładowania -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-8"
      role="status"
      aria-live="polite"
    >
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
        aria-hidden="true"
      ></div>
      <span class="ml-2 text-gray-600">Ładowanie zakwaterowań...</span>
    </div>

    <!-- Pusta lista -->
    <div v-else-if="!accommodations.length" class="text-center py-8" role="status">
      <div class="flex flex-col items-center gap-4">
        <i class="fas fa-bed text-4xl text-gray-400" aria-hidden="true"></i>
        <p class="text-gray-500 text-lg">{{ emptyMessage }}</p>
      </div>
    </div>

    <!-- Lista zakwaterowań -->
    <article
      v-else
      v-for="accommodation in displayedAccommodations"
      :key="accommodation.id"
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      :class="{ 'ring-2 ring-primary-500': isAccommodationSelected(accommodation.id) }"
      role="article"
      :aria-label="`Zakwaterowanie ${accommodation.name || accommodation.title}`"
    >
      <div class="flex flex-col md:flex-row">
        <!-- Zdjęcie zakwaterowania -->
        <div class="w-full md:w-1/3 relative">
          <img
            :src="accommodation.image || '/placeholder-hotel.jpg'"
            :alt="`Zdjęcie ${accommodation.name || accommodation.title}`"
            class="w-full h-48 md:h-full object-cover"
            loading="lazy"
            decoding="async"
            @error="handleImageError"
          />

          <!-- Przycisk ulubionych -->
          <button
            @click="handleToggleFavorite(accommodation)"
            class="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            :aria-label="`${accommodation.isFavorite ? 'Usuń z' : 'Dodaj do'} ulubionych`"
            type="button"
          >
            <i
              :class="
                accommodation.isFavorite
                  ? 'fas fa-heart text-red-500'
                  : 'far fa-heart text-gray-600'
              "
              aria-hidden="true"
            ></i>
          </button>
        </div>

        <!-- Informacje o zakwaterowaniu -->
        <div class="flex-1 p-6">
          <div class="flex flex-col h-full">
            <!-- Nagłówek z tytułem i oceną -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-semibold text-gray-800 truncate">
                  {{ accommodation.name || accommodation.title }}
                </h3>
                <p v-if="formatLocation(accommodation)" class="text-sm text-gray-500 mt-1 truncate">
                  {{ formatLocation(accommodation) }}
                </p>
              </div>

              <div v-if="accommodation.rating" class="flex items-center flex-shrink-0 ml-4">
                <span class="text-yellow-400 text-lg" :title="`Ocena: ${accommodation.rating}/5`">
                  {{ getRatingStars(accommodation.rating) }}
                </span>
                <span class="ml-2 text-gray-600 text-sm">{{ accommodation.rating }}</span>
                <span v-if="accommodation.reviewCount" class="text-xs text-gray-500 ml-1">
                  ({{ accommodation.reviewCount }})
                </span>
              </div>
            </div>

            <!-- Opis -->
            <p v-if="accommodation.description" class="text-gray-600 mb-4 flex-grow line-clamp-3">
              {{ accommodation.description }}
            </p>

            <!-- Udogodnienia (jeśli dostępne) -->
            <div v-if="accommodation.amenities?.length" class="mb-4">
              <p class="text-sm text-gray-500 mb-2">Udogodnienia:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="amenity in accommodation.amenities.slice(0, 3)"
                  :key="amenity"
                  class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {{ amenity }}
                </span>
                <span v-if="accommodation.amenities.length > 3" class="text-xs text-gray-500">
                  +{{ accommodation.amenities.length - 3 }} więcej
                </span>
              </div>
            </div>

            <!-- Cena i przyciski -->
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-auto"
            >
              <div>
                <p class="text-sm text-gray-500 mb-1">Cena za noc</p>
                <p class="text-2xl font-bold text-primary-600">
                  {{ formatPrice(accommodation.price, accommodation.currency) }}
                </p>
                <!-- POPRAWKA: Sprawdzenie czy maxGuests istnieje -->
                <p v-if="accommodation.maxGuests" class="text-xs text-gray-500">
                  dla max {{ accommodation.maxGuests }} osób
                </p>
              </div>

              <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4">
                <AnimatedButton
                  v-if="showAddToPlanner"
                  variant="outline"
                  class="text-sm sm:text-base py-2 px-4"
                  @click="handleAddToPlanner(accommodation)"
                  :aria-label="`Dodaj ${accommodation.name || accommodation.title} do planera`"
                >
                  Dodaj do planera
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  class="text-sm sm:text-base py-2 px-4"
                  @click="handleViewDetails(accommodation)"
                  :aria-label="`Zobacz szczegóły ${accommodation.name || accommodation.title}`"
                >
                  Zobacz szczegóły
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>

    <!-- Przycisk "Załaduj więcej" -->
    <div v-if="hasMoreItems" class="text-center pt-4">
      <AnimatedButton
        variant="outline"
        @click="handleLoadMore"
        aria-label="Załaduj więcej zakwaterowań"
      >
        <i class="fas fa-plus mr-2" aria-hidden="true"></i>
        Załaduj więcej zakwaterowań
      </AnimatedButton>
    </div>
  </div>
</template>

<style scoped>
/* POPRAWKA: Dodano standardową właściwość line-clamp */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3; /* Standardowa właściwość */
  overflow: hidden;
}

/* Fallback dla starszych przeglądarek */
@supports not (line-clamp: 3) {
  .line-clamp-3 {
    max-height: 4.5em; /* 3 linie * 1.5 line-height */
    overflow: hidden;
    position: relative;
  }

  .line-clamp-3::after {
    content: '...';
    position: absolute;
    bottom: 0;
    right: 0;
    background: white;
    padding-left: 0.5em;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-shadow,
  .transition-colors {
    transition: none;
  }
}

/* Focus styles */
button:focus-visible,
article:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .shadow-md,
  .shadow-lg {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
}
</style>
