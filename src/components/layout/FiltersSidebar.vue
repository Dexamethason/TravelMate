<script setup lang="ts">
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { ref, reactive, computed, readonly } from 'vue'

// POPRAWKA: Import typów z accommodation.ts zamiast filters.ts
import type { AccommodationFilterState } from '@/types/accommodation'

// Typy dla kluczy filtrów
type FeatureKey = 'breakfast' | 'freeCancel' | 'parking' | 'wifi' | 'pool' | 'gym' | 'airCon'
type StarKey = 'five' | 'four' | 'three'
type LocationKey = 'center' | 'nearCenter'

// Typ dla ocen gwiazdkowych
type StarRating = 1 | 2 | 3 | 4 | 5

// Interface dla stanu filtrów
interface FiltersState {
  features: Record<FeatureKey, boolean>
  stars: Record<StarKey, boolean>
  location: Record<LocationKey, boolean>
}

// Interface dla aplikowanych filtrów - używamy AccommodationFilterState
interface AppliedFilters extends AccommodationFilterState {}

// Props komponentu
interface FiltersSidebarProps {
  maxBudget?: number
  defaultBudget?: number
  currency?: string
  showMobileDrawer?: boolean
}

// Eventy emitowane przez komponent
interface FiltersSidebarEmits {
  (event: 'apply-filters', filters: AppliedFilters): void
  (event: 'reset-filters'): void
  (event: 'toggle-mobile', isOpen: boolean): void
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<FiltersSidebarProps>(), {
  maxBudget: 1000,
  defaultBudget: 1000,
  currency: 'zł',
  showMobileDrawer: true,
})

// Definicja emitów
const emit = defineEmits<FiltersSidebarEmits>()

// Stan komponentu
const isOpen = ref<boolean>(false)
const budget = ref<number>(props.defaultBudget)

// Reactive state dla filtrów z typowaniem
const filters = reactive<FiltersState>({
  features: {
    breakfast: false,
    freeCancel: false,
    parking: false,
    wifi: false,
    pool: false,
    gym: false,
    airCon: false,
  },
  stars: {
    five: false,
    four: false,
    three: false,
  },
  location: {
    center: false,
    nearCenter: false,
  },
})

// Mapowanie kluczy na wartości gwiazdkowe
const starKeyToRating: Record<StarKey, StarRating> = {
  five: 5,
  four: 4,
  three: 3,
}

// Mapowanie feature keys na czytelne nazwy
const featureLabels: Record<FeatureKey, string> = {
  breakfast: 'Śniadanie w cenie',
  freeCancel: 'Bezpłatne odwołanie',
  parking: 'Parking na miejscu',
  wifi: 'WiFi',
  pool: 'Basen',
  gym: 'Siłownia',
  airCon: 'Klimatyzacja',
}

// Mapowanie location keys na czytelne nazwy
const locationLabels: Record<LocationKey, string> = {
  center: 'Centrum (< 1km)',
  nearCenter: 'Okolice centrum (< 3km)',
}

// Type guard dla sprawdzania klucza feature
const isFeatureKey = (key: string): key is FeatureKey => {
  return key in featureLabels
}

// Type guard dla sprawdzania klucza star
const isStarKey = (key: string): key is StarKey => {
  return key in starKeyToRating
}

// Type guard dla sprawdzania klucza location
const isLocationKey = (key: string): key is LocationKey => {
  return key in locationLabels
}

// Computed property dla formatowania ceny
const formatPrice = computed(() => {
  return (value: number): string => `${value} ${props.currency}`
})

// Computed property dla liczby aktywnych filtrów
const activeFiltersCount = computed<number>(() => {
  const featuresCount = Object.values(filters.features).filter(Boolean).length
  const starsCount = Object.values(filters.stars).filter(Boolean).length
  const locationCount = Object.values(filters.location).filter(Boolean).length
  const budgetActive = budget.value < props.maxBudget ? 1 : 0

  return featuresCount + starsCount + locationCount + budgetActive
})

// Computed property dla sprawdzenia czy są jakieś filtry aktywne
const hasActiveFilters = computed<boolean>(() => activeFiltersCount.value > 0)

// Funkcja zamykania mobilnych filtrów
const closeFilters = (): void => {
  isOpen.value = false
  emit('toggle-mobile', false)
}

// Funkcja otwierania mobilnych filtrów
const openFilters = (): void => {
  isOpen.value = true
  emit('toggle-mobile', true)
}

// Funkcja aplikowania filtrów z proper typowaniem
const applyFilters = (): void => {
  // Filtrowanie i mapowanie features
  const activeFeatures = (Object.entries(filters.features) as [FeatureKey, boolean][])
    .filter(([_, value]) => value)
    .map(([key]) => key)

  // Filtrowanie i mapowanie stars
  const activeStars = (Object.entries(filters.stars) as [StarKey, boolean][])
    .filter(([_, value]) => value)
    .map(([key]) => starKeyToRating[key])

  // Filtrowanie location
  const activeLocation = (Object.entries(filters.location) as [LocationKey, boolean][])
    .filter(([_, value]) => value)
    .map(([key]) => key)

  const appliedFilters: AppliedFilters = {
    budget: budget.value,
    features: activeFeatures,
    stars: activeStars,
    location: activeLocation,
  }

  emit('apply-filters', appliedFilters)
  closeFilters()
}

// Funkcja resetowania filtrów z typowaniem
const resetFilters = (): void => {
  budget.value = props.maxBudget

  // Reset features
  Object.keys(filters.features).forEach((key) => {
    if (isFeatureKey(key)) {
      filters.features[key] = false
    }
  })

  // Reset stars
  Object.keys(filters.stars).forEach((key) => {
    if (isStarKey(key)) {
      filters.stars[key] = false
    }
  })

  // Reset location
  Object.keys(filters.location).forEach((key) => {
    if (isLocationKey(key)) {
      filters.location[key] = false
    }
  })

  emit('reset-filters')
  closeFilters()
}

// Funkcja walidacji budżetu
const validateBudget = (value: number): boolean => {
  return value >= 0 && value <= props.maxBudget
}

// Handler zmiany budżetu z walidacją
const handleBudgetChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)

  if (validateBudget(value)) {
    budget.value = value
  }
}

// Expose funkcji dla parent component
defineExpose({
  openFilters,
  closeFilters,
  resetFilters,
  hasActiveFilters: readonly(hasActiveFilters),
  activeFiltersCount: readonly(activeFiltersCount),
})

// Walidacja props przy developmencie
if (import.meta.env.DEV) {
  if (props.maxBudget <= 0) {
    console.warn('FiltersSidebar: maxBudget musi być większy od 0')
  }

  if (props.defaultBudget > props.maxBudget) {
    console.warn('FiltersSidebar: defaultBudget nie może być większy od maxBudget')
  }
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Panel filtrów desktop -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <!-- Header z licznikiem filtrów -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-gray-800">Filtry</h2>
        <span
          v-if="hasActiveFilters"
          class="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full"
        >
          {{ activeFiltersCount }}
        </span>
      </div>

      <div class="space-y-10 sm:space-y-12">
        <!-- Popularne filtry -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Popularne filtry</h3>
          <div class="space-y-3">
            <label
              v-for="(label, key) in featureLabels"
              :key="key"
              class="flex items-center group cursor-pointer"
            >
              <div class="relative flex items-center">
                <input
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features[key]"
                />
                <span class="ml-2 text-sm text-gray-700">{{ label }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Budżet -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Twój budżet</h3>
          <div class="space-y-4">
            <!-- Slider i wyświetlanie wartości -->
            <div class="flex items-center gap-4">
              <input
                type="range"
                v-model="budget"
                @input="handleBudgetChange"
                class="w-full accent-primary-600"
                min="0"
                :max="maxBudget"
                step="50"
              />
              <span class="min-w-[80px] text-sm text-gray-700 font-medium">
                {{ formatPrice(budget) }}
              </span>
            </div>
            <!-- Etykiety zakresu -->
            <div class="flex justify-between text-sm text-gray-600">
              <span>0 {{ currency }}</span>
              <span>{{ formatPrice(maxBudget) }}+</span>
            </div>
          </div>
        </div>

        <!-- Gwiazdki hotelu -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">
            Kategoria (gwiazdki)
          </h3>
          <div class="space-y-3">
            <label
              v-for="(rating, key) in starKeyToRating"
              :key="key"
              class="flex items-center group cursor-pointer"
            >
              <div class="relative flex items-center">
                <input
                  type="checkbox"
                  v-model="filters.stars[key]"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span class="ml-3 text-yellow-400 flex items-center">
                  {{ '★'.repeat(rating) }}
                  <span class="text-gray-500 text-sm ml-2"
                    >({{ rating === 5 ? 54 : rating === 4 ? 32 : 12 }})</span
                  >
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Udogodnienia -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Udogodnienia</h3>
          <div class="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-4">
            <label
              v-for="(label, key) in featureLabels"
              :key="key"
              class="flex items-center group cursor-pointer"
            >
              <div class="relative flex items-center">
                <input
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features[key]"
                />
                <span class="ml-2 text-sm text-gray-700">{{ label }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Lokalizacja -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Lokalizacja</h3>
          <div class="space-y-3">
            <label
              v-for="(label, key) in locationLabels"
              :key="key"
              class="flex items-center group cursor-pointer"
            >
              <div class="relative flex items-center">
                <input
                  type="checkbox"
                  v-model="filters.location[key]"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span class="ml-3 text-gray-700">{{ label }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Przyciski na dole -->
      <div class="mt-8 flex flex-col gap-3">
        <AnimatedButton variant="primary" @click="applyFilters" :disabled="!hasActiveFilters">
          Zastosuj filtry
          <span v-if="activeFiltersCount > 0" class="ml-1">({{ activeFiltersCount }})</span>
        </AnimatedButton>
        <AnimatedButton variant="outline" @click="resetFilters" :disabled="!hasActiveFilters">
          Wyczyść wszystko
        </AnimatedButton>
      </div>
    </div>

    <!-- Mobilny drawer -->
    <div
      v-if="isOpen && showMobileDrawer"
      class="fixed inset-0 z-50 lg:hidden"
      @click.self="closeFilters"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50"></div>

      <!-- Panel z filtrami -->
      <div class="absolute right-0 top-0 bottom-0 w-[90%] max-w-[320px] bg-white overflow-y-auto">
        <!-- Nagłówek z przyciskiem zamykania -->
        <div class="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold">Filtry</h2>
            <span
              v-if="hasActiveFilters"
              class="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full"
            >
              {{ activeFiltersCount }}
            </span>
          </div>
          <button
            @click="closeFilters"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-md"
            aria-label="Zamknij filtry"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Zawartość filtrów -->
        <div class="p-4 space-y-6">
          <!-- Duplikacja desktop content ale można to zrefaktorować do komponentów -->
          <!-- Dla uproszczenia używam tych samych sekcji co desktop -->

          <!-- Popularne filtry -->
          <div>
            <h3 class="text-base font-semibold text-gray-800 mb-4">Popularne filtry</h3>
            <div class="space-y-3">
              <label
                v-for="(label, key) in featureLabels"
                :key="key"
                class="flex items-center group cursor-pointer"
              >
                <div class="relative flex items-center">
                  <input
                    type="checkbox"
                    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    v-model="filters.features[key]"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ label }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Budżet mobile -->
          <div class="pt-2">
            <h3 class="text-base font-semibold text-gray-800 mb-4">Twój budżet</h3>
            <div class="space-y-4">
              <div class="relative pt-1">
                <input
                  type="range"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
                  v-model="budget"
                  @input="handleBudgetChange"
                  min="0"
                  :max="maxBudget"
                  step="50"
                />
                <div class="flex justify-between mt-2">
                  <div class="flex flex-col items-center">
                    <span class="text-xs text-gray-500">Min</span>
                    <span class="text-sm font-medium text-gray-700">0 {{ currency }}</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="text-xs text-gray-500">Aktualnie</span>
                    <span class="text-sm font-medium text-primary-600">{{
                      formatPrice(budget)
                    }}</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="text-xs text-gray-500">Max</span>
                    <span class="text-sm font-medium text-gray-700"
                      >{{ formatPrice(maxBudget) }}+</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reszta sekcji analogicznie do desktop -->
          <!-- ... -->
        </div>

        <!-- Przyciski na dole (sticky) -->
        <div class="sticky bottom-0 left-0 right-0 bg-white pt-4 p-4 border-t">
          <div class="space-y-3">
            <AnimatedButton
              variant="primary"
              class="w-full"
              @click="applyFilters"
              :disabled="!hasActiveFilters"
            >
              Zastosuj filtry
              <span v-if="activeFiltersCount > 0" class="ml-1">({{ activeFiltersCount }})</span>
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              class="w-full"
              @click="resetFilters"
              :disabled="!hasActiveFilters"
            >
              Wyczyść wszystko
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
