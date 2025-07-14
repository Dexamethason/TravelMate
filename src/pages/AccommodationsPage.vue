<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SearchSection from '@/components/layout/SearchSection.vue'
import FiltersSidebar from '@/components/layout/FiltersSidebar.vue'
import AccommodationsList from '@/components/layout/AccommodationsList.vue'
import SectionHeading from '@/components/layout/SectionHeading.vue'
import MapPlaceholder from '@/components/layout/MapPlaceholder.vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

// POPRAWKA: Import typów z accommodation.ts zamiast filters.ts
import type {
  Accommodation,
  AccommodationSortOption,
  AccommodationFilterState,
  AccommodationFeatures, // DODANE
  SortOption,
  SearchFilters, // DODANE
} from '@/types'

import {
  isValidAccommodation,
  hasValidCoordinates,
  isValidAccommodationSortOption,
  createDefaultAccommodationFilters,
} from '@/types'

// Stan komponentu
const isFilterOpen = ref<boolean>(false)
const sortBy = ref<AccommodationSortOption>('recommended')

// Stan filtrów z typowaniem z centralnych typów
const activeFilters = ref<AccommodationFilterState>(createDefaultAccommodationFilters())

// Opcje sortowania z typowaniem z centralnych typów
const sortOptions: readonly SortOption<AccommodationSortOption>[] = [
  { value: 'recommended', label: 'Polecane' },
  { value: 'price-desc', label: 'Cena: od najwyższej' },
  { value: 'price-asc', label: 'Cena: od najniższej' },
  { value: 'rating-desc', label: 'Ocena: od najwyższej' },
  { value: 'rating-asc', label: 'Ocena: od najniższej' },
  { value: 'stars-desc', label: 'Gwiazdki: 5-1' },
  { value: 'stars-asc', label: 'Gwiazdki: 1-5' },
] as const

// Filtry wyszukiwania z typowaniem z centralnych typów
const selectedFilters: SearchFilters = {
  city: 'Warszawa',
  dates: {
    checkIn: '2025-06-05',
    checkOut: '2025-06-08',
  },
  guests: '2 dorosłych, 1 pokój',
}

// Mock images imports z proper typing
import hotel1 from '@/assets/mock/hotel1.jpg'
import hotel2 from '@/assets/mock/hotel2.jpg'
import hotel3 from '@/assets/mock/hotel3.jpg'
import heroSmall from '@/assets/images/hero/accomodation-hero-small.jpg'
import heroBig from '@/assets/images/hero/accomodation-hero-big.jpg'

// POPRAWIONE Mock data z zunifikowanym interfejsem
const mockAccommodations: readonly Accommodation[] = [
  {
    id: '1', // String zamiast number
    name: 'Grand Hotel', // Dodane dla spójności
    title: 'Grand Hotel',
    description: 'Luksusowy hotel w centrum miasta z widokiem na rzekę',
    price: 450,
    currency: 'PLN',
    rating: 5.0,
    reviewCount: 234,
    image: hotel1,
    amenities: ['Parking', 'WiFi', 'Restauracja', 'Basen', 'Spa'],
    address: 'Warszawa, 350m od centrum',
    city: 'Warszawa', // Dodane
    country: 'Polska', // Dodane
    distanceFromCenter: 0.35,
    stars: 5,
    type: 'hotel',
    availability: true,
    coordinates: {
      lat: 52.2297,
      lng: 21.0122,
    },
    features: {
      breakfast: true,
      freeCancel: true,
      parking: true,
      wifi: true,
      pool: true,
      gym: true,
      airCon: true,
      spa: true,
      restaurant: true,
      roomService: true,
      petFriendly: false,
    },
  },
  {
    id: '2',
    name: 'Apartamenty Centrum',
    title: 'Apartamenty Centrum',
    description: 'Przytulne apartamenty w sercu miasta',
    price: 280,
    currency: 'PLN',
    rating: 4.2,
    reviewCount: 89,
    image: hotel2,
    amenities: ['WiFi', 'Kuchnia', 'Klimatyzacja'],
    address: 'Warszawa, 1.2km od centrum',
    city: 'Warszawa',
    country: 'Polska',
    distanceFromCenter: 1.2,
    stars: 3,
    type: 'apartment',
    availability: true,
    coordinates: {
      lat: 52.2356,
      lng: 21.0098,
    },
    features: {
      breakfast: false,
      freeCancel: true,
      parking: false,
      wifi: true,
      pool: false,
      gym: false,
      airCon: true,
      spa: false,
      restaurant: false,
      roomService: false,
      petFriendly: true,
    },
  },
  {
    id: '3',
    name: 'Hotel Biznesowy',
    title: 'Hotel Biznesowy',
    description: 'Nowoczesny hotel dla podróży służbowych',
    price: 320,
    currency: 'PLN',
    rating: 4.1,
    reviewCount: 156,
    image: hotel3,
    amenities: ['Parking', 'WiFi', 'Sala konferencyjna', 'Centrum biznesowe'],
    address: 'Warszawa, 2.5km od centrum',
    city: 'Warszawa',
    country: 'Polska',
    distanceFromCenter: 2.5,
    stars: 4,
    type: 'hotel',
    availability: true,
    coordinates: {
      lat: 52.2125,
      lng: 21.0067,
    },
    features: {
      breakfast: true,
      freeCancel: false,
      parking: true,
      wifi: true,
      pool: false,
      gym: true,
      airCon: true,
      spa: false,
      restaurant: true,
      roomService: true,
      petFriendly: false,
    },
  },
  {
    id: '4',
    name: 'Resort & Spa Premium',
    title: 'Resort & Spa Premium',
    description: 'Luksusowy resort z pełnym zapleczem spa i wellness',
    price: 850,
    currency: 'PLN',
    rating: 4.9,
    reviewCount: 312,
    image: hotel1,
    amenities: ['Parking', 'WiFi', 'Spa', 'Basen', 'Restauracja', 'Sala fitness'],
    address: 'Warszawa, 4.2km od centrum',
    city: 'Warszawa',
    country: 'Polska',
    distanceFromCenter: 4.2,
    stars: 5,
    type: 'hotel',
    availability: true,
    coordinates: {
      lat: 52.1987,
      lng: 21.0234,
    },
    features: {
      breakfast: true,
      freeCancel: true,
      parking: true,
      wifi: true,
      pool: true,
      gym: true,
      airCon: true,
      spa: true,
      restaurant: true,
      roomService: true,
      petFriendly: true,
    },
  },
  {
    id: '5',
    name: 'Hotel Ogrodowy',
    title: 'Hotel Ogrodowy',
    description: 'Spokojny hotel z pięknym ogrodem i tarasem',
    price: 320,
    currency: 'PLN',
    rating: 4.1,
    reviewCount: 78,
    image: hotel2,
    amenities: ['Parking', 'Ogród', 'Taras', 'WiFi'],
    address: 'Warszawa, 5km od centrum',
    city: 'Warszawa',
    country: 'Polska',
    distanceFromCenter: 5.0,
    stars: 3,
    type: 'guesthouse',
    availability: true,
    coordinates: {
      lat: 52.1845,
      lng: 21.0456,
    },
    features: {
      breakfast: true,
      freeCancel: true,
      parking: true,
      wifi: true,
      pool: false,
      gym: false,
      airCon: true,
      spa: false,
      restaurant: false,
      roomService: false,
      petFriendly: true,
    },
  },
] as const

// POPRAWKA: Poprawione type guards bez duplikatów
const isValidSortOption = (option: string): option is AccommodationSortOption => {
  return sortOptions.some((opt) => opt.value === option)
}

// POPRAWKA: Użycie poprawnego typu AccommodationFilterState zamiast FilterState
const isValidFilterState = (filters: unknown): filters is AccommodationFilterState => {
  if (!filters || typeof filters !== 'object') return false

  const f = filters as Record<string, unknown>
  return (
    typeof f.budget === 'number' &&
    Array.isArray(f.features) &&
    Array.isArray(f.stars) &&
    Array.isArray(f.location)
  )
}

// Helper function dla konwersji legacy data (jeśli potrzebne)
const normalizeLegacyAccommodation = (accommodation: any): Accommodation => {
  return {
    ...accommodation,
    id: typeof accommodation.id === 'number' ? accommodation.id.toString() : accommodation.id,
    name: accommodation.name || accommodation.title,
    city: accommodation.city || extractCityFromAddress(accommodation.address),
    country: accommodation.country || 'Polska', // Domyślnie Polska
  }
}

// Helper function dla wyciągania miasta z adresu
const extractCityFromAddress = (address: string): string => {
  if (!address) return 'Nieznane miasto'

  // Prosta logika wyciągnięcia miasta z adresu
  const parts = address.split(',')
  return parts[0]?.trim() || 'Nieznane miasto'
}

// POPRAWKA: Funkcja score z nullish coalescing
const calculateScore = (accommodation: Accommodation): number => {
  let score = 0

  // Rating z domyślną wartością
  const rating = accommodation.rating ?? 0
  score += rating * 20

  // Amenities z domyślną wartością
  const amenitiesCount = accommodation.amenities?.length ?? 0
  score += amenitiesCount * 0.3

  // Distance z domyślną wartością
  const distance = accommodation.distanceFromCenter ?? 5
  score += (5 - distance) * 0.4

  // Price-quality ratio z zabezpieczeniem
  if (rating > 0) {
    const priceQualityRatio = (rating * accommodation.stars) / accommodation.price
    score += priceQualityRatio * 10
  }

  // Review count z zabezpieczeniem
  const reviewCount = accommodation.reviewCount ?? 0
  score += Math.min(reviewCount / 100, 2)

  return Math.round(score * 10) / 10
}

// Computed property dla filtrowanych zakwaterowań - POPRAWKA: teraz działa z centralnymi funkcjami
const filteredAccommodations = computed<Accommodation[]>(() => {
  return mockAccommodations.filter((accommodation) => {
    // Walidacja podstawowa z centralnych type guards
    if (!isValidAccommodation(accommodation)) {
      if (import.meta.env.DEV) {
        console.warn('AccommodationsPage: Nieprawidłowe zakwaterowanie:', accommodation)
      }
      return false
    }

    // Filtr budżetu
    if (accommodation.price > activeFilters.value.budget) {
      return false
    }

    // Filtr udogodnień
    if (activeFilters.value.features.length > 0) {
      const hasAllFeatures = activeFilters.value.features.every((feature) => {
        return accommodation.features?.[feature as keyof AccommodationFeatures] === true
      })
      if (!hasAllFeatures) {
        return false
      }
    }

    // Filtr gwiazdek
    if (activeFilters.value.stars.length > 0) {
      if (!activeFilters.value.stars.includes(accommodation.stars)) {
        return false
      }
    }

    return true
  })
})

// POPRAWKA: Filtry z poprawnym typowaniem
const sortedAccommodations = computed<Accommodation[]>(() => {
  let filtered = [...filteredAccommodations.value]

  if (activeFilters.value.features.length > 0) {
    filtered = filtered.filter((accommodation) => {
      return activeFilters.value.features.some((feature) => {
        // POPRAWKA: Type assertion dla feature
        const featureKey = feature as keyof AccommodationFeatures
        return accommodation.features?.[featureKey] === true
      })
    })
  }

  switch (sortBy.value) {
    case 'recommended':
      return filtered.sort((a, b) => calculateScore(b) - calculateScore(a))
    case 'price-asc':
      return filtered.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return filtered.sort((a, b) => b.price - a.price)
    case 'rating-desc':
      // POPRAWKA: Nullish coalescing dla rating
      return filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    case 'rating-asc':
      // POPRAWKA: Nullish coalescing dla rating
      return filtered.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0))
    case 'stars-desc':
      return filtered.sort((a, b) => b.stars - a.stars)
    case 'stars-asc':
      return filtered.sort((a, b) => a.stars - b.stars)
    default:
      return filtered
  }
})

// POPRAWKA: Statystyki z nullish coalescing
const accommodationStats = computed(() => ({
  total: mockAccommodations.length,
  filtered: filteredAccommodations.value.length,
  averagePrice:
    filteredAccommodations.value.length > 0
      ? Math.round(
          filteredAccommodations.value.reduce((sum, acc) => sum + acc.price, 0) /
            filteredAccommodations.value.length,
        )
      : 0,
  averageRating:
    filteredAccommodations.value.length > 0
      ? +(
          filteredAccommodations.value.reduce((sum, acc) => sum + (acc.rating ?? 0), 0) /
          filteredAccommodations.value.length
        ).toFixed(1)
      : 0,
}))

// POPRAWKA: Computed property dla accommodations kompatybilnych z MapPlaceholder
const mapCompatibleAccommodations = computed<Accommodation[]>(() => {
  return sortedAccommodations.value.filter((accommodation) => {
    // Upewnij się że ma wszystkie wymagane pola dla mapy
    return !!(
      accommodation.name &&
      accommodation.city &&
      accommodation.country &&
      accommodation.coordinates &&
      hasValidCoordinates(accommodation)
    )
  })
})

// Event handlers z typowaniem z centralnych typów
const handleFilters = (filters: unknown): void => {
  if (typeof filters === 'object' && filters !== null) {
    activeFilters.value = {
      ...activeFilters.value,
      ...(filters as Partial<AccommodationFilterState>),
    }
  }
}

const handleSortChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const newSort = target.value

  // POPRAWKA: Walidacja z centralnych type guards
  if (isValidAccommodationSortOption(newSort)) {
    sortBy.value = newSort
  } else {
    console.warn('AccommodationsPage: Nieprawidłowa opcja sortowania:', newSort)
  }
}

const handleResetFilters = (): void => {
  activeFilters.value = createDefaultAccommodationFilters()
}

const handleOpenFilters = (): void => {
  isFilterOpen.value = true
}

const handleCloseFilters = (): void => {
  isFilterOpen.value = false
}

// Funkcja formatowania liczby wyników
const formatResultsText = (count: number): string => {
  if (count === 0) return 'Brak wyników'
  if (count === 1) return 'Znaleziono 1 obiekt'
  if (count < 5) return `Znaleziono ${count} obiekty`
  return `Znaleziono ${count} obiektów`
}

// Walidacja przy developmencie - POPRAWKA: teraz działa z centralnymi funkcjami
if (import.meta.env.DEV) {
  // Sprawdzenie mock data
  mockAccommodations.forEach((accommodation, index) => {
    if (!isValidAccommodation(accommodation)) {
      console.warn(
        `AccommodationsPage: Nieprawidłowe zakwaterowanie na pozycji ${index}:`,
        accommodation,
      )
    }

    if (!accommodation.currency) {
      console.warn(`AccommodationsPage: Brak waluty dla zakwaterowania ${accommodation.id}`)
    }

    if (!accommodation.coordinates) {
      console.warn(`AccommodationsPage: Brak koordynat dla zakwaterowania ${accommodation.id}`)
    }
  })

  // Log statystyk
  console.log('AccommodationsPage: Załadowano', mockAccommodations.length, 'zakwaterowań')
  console.log(
    'AccommodationsPage: Kompatybilnych z mapą:',
    mapCompatibleAccommodations.value.length,
  )
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <!-- Hero section z poprawioną wysokością -->
    <section
      class="relative h-[350px] lg:h-[450px] overflow-hidden"
      role="banner"
      aria-label="Hero section strony zakwaterowań"
    >
      <!-- Hero background -->
      <div class="absolute inset-0">
        <picture>
          <source media="(min-width: 1024px)" :srcset="heroBig" />
          <source media="(max-width: 1023px)" :srcset="heroSmall" />
          <img
            :src="heroBig"
            alt="Widok na luksusowe zakwaterowania"
            class="w-full h-full object-cover object-center brightness-75"
            loading="eager"
          />
        </picture>
      </div>

      <!-- Hero content -->
      <div class="relative h-full z-10">
        <div
          class="mx-auto px-4 sm:px-6 md:px-8 h-full flex flex-col justify-center items-center"
          style="width: min(1184px, 100vw)"
        >
          <SectionHeading
            title="Noclegi"
            subtitle="Znajdź idealne miejsce na nocleg w najlepszej cenie"
            level="h1"
            size="xl"
            color="default"
            class="text-white text-center"
            aria-label="Nagłówek strony zakwaterowań"
          />
        </div>
      </div>
    </section>

    <!-- Search section z poprawionym stylem -->
    <section
      class="relative z-20 -mt-24 mb-16"
      role="search"
      aria-label="Sekcja wyszukiwania zakwaterowań"
    >
      <div class="mx-auto px-4 sm:px-6 md:px-8" style="width: min(1184px, 100vw)">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <SearchSection />
        </div>
      </div>
    </section>

    <!-- Główna sekcja z hotelami -->
    <section class="bg-gray-50 pt-4 pb-12" role="main" aria-label="Lista zakwaterowań">
      <div class="mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-8" style="width: min(1184px, 100vw)">
        <div class="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <!-- Sidebar -->
          <aside class="w-full lg:w-1/4" role="complementary" aria-label="Filtry i mapa">
            <!-- Mapa (tylko desktop) - POPRAWIONE z kompatybilnymi danymi -->
            <div class="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <MapPlaceholder
                :accommodations="mapCompatibleAccommodations"
                class="h-[250px] w-full object-cover"
                aria-label="Mapa z lokalizacjami zakwaterowań"
              />
            </div>

            <!-- Mobilny przycisk do filtrów -->
            <div class="fixed bottom-4 left-3 right-3 z-40 lg:hidden">
              <AnimatedButton
                variant="primary"
                class="w-full flex items-center justify-center gap-2"
                @click="handleOpenFilters"
                aria-label="Otwórz filtry zakwaterowań"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Filtry
                <span
                  v-if="activeFilters.features.length + activeFilters.stars.length > 0"
                  class="bg-white text-primary-600 text-xs px-2 py-1 rounded-full font-medium"
                  aria-label="Liczba aktywnych filtrów"
                >
                  {{ activeFilters.features.length + activeFilters.stars.length }}
                </span>
              </AnimatedButton>
            </div>

            <!-- Filtry na desktop -->
            <div class="hidden lg:block">
              <FiltersSidebar
                :is-open="isFilterOpen"
                :max-budget="1000"
                currency="PLN"
                @close="handleCloseFilters"
                @apply-filters="handleFilters"
                @reset-filters="handleResetFilters"
                @toggle-mobile="handleCloseFilters"
              />
            </div>
          </aside>

          <!-- Main content -->
          <main class="w-full lg:w-3/4">
            <!-- Header z licznikiem i sortowaniem -->
            <div class="bg-white rounded-lg shadow-md p-2 sm:p-3 md:p-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 class="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                    {{ formatResultsText(accommodationStats.filtered) }}
                  </h2>

                  <!-- Statystyki (opcjonalne) -->
                  <div
                    v-if="accommodationStats.filtered > 0"
                    class="text-xs text-gray-500 flex items-center gap-3"
                    aria-label="Statystyki wyników"
                  >
                    <span>Średnia cena: {{ accommodationStats.averagePrice }} PLN</span>
                    <span>Średnia ocena: {{ accommodationStats.averageRating }}/5</span>
                  </div>
                </div>

                <!-- Kontrolki sortowania -->
                <div class="flex items-center gap-2">
                  <label for="sortSelect" class="text-xs text-gray-600 hidden sm:block">
                    Sortuj:
                  </label>
                  <select
                    id="sortSelect"
                    :value="sortBy"
                    @change="handleSortChange"
                    class="text-xs sm:text-sm border rounded-lg p-1.5 sm:p-2 w-full sm:w-auto max-w-[160px] sm:max-w-[200px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Wybierz sposób sortowania wyników"
                  >
                    <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Separator -->
            <div class="h-4 sm:h-6 md:h-8"></div>

            <!-- Lista hoteli -->
            <div class="bg-transparent pb-24 lg:pb-0">
              <AccommodationsList
                :accommodations="sortedAccommodations"
                :loading="false"
                :empty-message="
                  activeFilters.features.length + activeFilters.stars.length > 0
                    ? 'Brak zakwaterowań spełniających wybrane kryteria. Spróbuj zmienić filtry.'
                    : 'Brak dostępnych zakwaterowań.'
                "
                aria-label="Lista dostępnych zakwaterowań"
              />
            </div>
          </main>
        </div>
      </div>
    </section>

    <!-- Mobile filters overlay -->
    <FiltersSidebar
      :is-open="isFilterOpen"
      :max-budget="1000"
      currency="PLN"
      @close="handleCloseFilters"
      @apply-filters="handleFilters"
      @reset-filters="handleResetFilters"
      @toggle-mobile="handleCloseFilters"
      class="lg:hidden"
      aria-label="Panel filtrów mobilnych"
    />
  </div>
</template>

<style scoped>
/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none;
  }
}

/* Focus styles dla lepszej accessibility */
select:focus-visible,
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .fixed {
    display: none !important;
  }

  .bg-gray-50 {
    background: white !important;
  }

  .shadow-md,
  .shadow-lg {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white {
    border: 1px solid currentColor;
  }
}
</style>
