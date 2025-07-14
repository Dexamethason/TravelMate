<script setup lang="ts">
import { ref, computed, watch, readonly } from 'vue'

// POPRAWKA: Import poprawionych typów
import type { SortOption, SearchFilters, TopFilterBarSortOption } from '@/types/forms'

import { isValidTopFilterBarSortOption } from '@/types/forms'

// Interface dla opcji gości
interface GuestOption {
  value: string
  display: string
  persons: number
  rooms: number
}

// Interface dla danych filtrów
interface FilterData extends SearchFilters {
  sorting: TopFilterBarSortOption // POPRAWKA: użycie konkretnego typu
}

// Interface dla props komponentu
interface TopFilterBarProps {
  city: string
  dates: {
    checkIn: string
    checkOut: string
  }
  guests: string
  initialSort?: TopFilterBarSortOption // POPRAWKA: użycie konkretnego typu
}

// Interface dla eventów emitowanych przez komponent
interface TopFilterBarEmits {
  (event: 'filter-change', data: FilterData): void
  (event: 'city-change', city: string): void
  (event: 'dates-change', dates: { checkIn: string; checkOut: string }): void
  (event: 'guests-change', guests: string): void
  (event: 'sort-change', sort: TopFilterBarSortOption): void // POPRAWKA
  (event: 'search'): void
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<TopFilterBarProps>(), {
  initialSort: 'popular', // POPRAWKA: string literal zamiast SortOption
})

// Definicja emitów
const emit = defineEmits<TopFilterBarEmits>()

// Reaktywne zmienne do formularza z typowaniem
const selectedCity = ref<string>(props.city)
const checkIn = ref<string>(props.dates.checkIn)
const checkOut = ref<string>(props.dates.checkOut)
const guestsCount = ref<string>(props.guests)
const sorting = ref<TopFilterBarSortOption>(props.initialSort) // POPRAWKA

// Stan walidacji
const validationErrors = ref<Record<string, string>>({})

// Opcje gości z typowaniem
const guestOptions: readonly GuestOption[] = [
  { value: '1-os-1-pok', display: '1 os., 1 pok.', persons: 1, rooms: 1 },
  { value: '2-os-1-pok', display: '2 os., 1 pok.', persons: 2, rooms: 1 },
  { value: '2-os-2-pok', display: '2 os., 2 pok.', persons: 2, rooms: 2 },
  { value: '3-os-1-pok', display: '3 os., 1 pok.', persons: 3, rooms: 1 },
  { value: '3-os-2-pok', display: '3 os., 2 pok.', persons: 3, rooms: 2 },
  { value: '4-os-2-pok', display: '4 os., 2 pok.', persons: 4, rooms: 2 },
  { value: '4-os-3-pok', display: '4 os., 3 pok.', persons: 4, rooms: 3 },
] as const

// POPRAWKA: Opcje sortowania z poprawnym typowaniem
const sortOptions: readonly SortOption<TopFilterBarSortOption>[] = [
  { value: 'popular', label: 'Popularne' },
  { value: 'price-asc', label: 'Cena: od najniższej' },
  { value: 'price-desc', label: 'Cena: od najwyższej' },
  { value: 'rating-desc', label: 'Ocena: od najwyższej' },
  { value: 'rating-asc', label: 'Ocena: od najniższej' },
] as const

// Computed properties z typowaniem
const today = computed<string>(() => new Date().toISOString().split('T')[0])
const maxDate = computed<string>(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString().split('T')[0]
})

const selectedGuestOption = computed<GuestOption | undefined>(() => {
  return guestOptions.find((option) => option.value === guestsCount.value)
})

const isFormValid = computed<boolean>(() => {
  return validateForm().isValid
})

// Funkcje walidacji z typowaniem
const isValidDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return !isNaN(date.getTime()) && date >= today
}

const isValidDateRange = (checkIn: string, checkOut: string): boolean => {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return false
  return new Date(checkOut) > new Date(checkIn)
}

const isValidCity = (city: string): boolean => {
  return city.trim().length >= 2 && city.trim().length <= 100
}

// POPRAWKA: Użycie poprawionej funkcji type guard
const isValidSortOption = (sort: string): sort is TopFilterBarSortOption => {
  return isValidTopFilterBarSortOption(sort)
}

// Funkcja sanityzacji tekstu
const sanitizeText = (text: string): string => {
  return text.replace(/[<>]/g, '').trim().substring(0, 100)
}

// Funkcja walidacji formularza
const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  if (!isValidCity(selectedCity.value)) {
    errors.city = 'Miasto musi zawierać 2-100 znaków'
  }

  if (!isValidDate(checkIn.value)) {
    errors.checkIn = 'Wybierz poprawną datę przyjazdu'
  }

  if (!isValidDate(checkOut.value)) {
    errors.checkOut = 'Wybierz poprawną datę wyjazdu'
  }

  if (checkIn.value && checkOut.value && !isValidDateRange(checkIn.value, checkOut.value)) {
    errors.dateRange = 'Data wyjazdu musi być późniejsza niż data przyjazdu'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Event handlers z typowaniem
const handleCityChange = (): void => {
  selectedCity.value = sanitizeText(selectedCity.value)

  if (validationErrors.value.city) {
    delete validationErrors.value.city
  }

  emit('city-change', selectedCity.value)
  emitFilterChange()
}

const handleDatesChange = (): void => {
  if (validationErrors.value.checkIn) {
    delete validationErrors.value.checkIn
  }
  if (validationErrors.value.checkOut) {
    delete validationErrors.value.checkOut
  }
  if (validationErrors.value.dateRange) {
    delete validationErrors.value.dateRange
  }

  const dates = { checkIn: checkIn.value, checkOut: checkOut.value }
  emit('dates-change', dates)
  emitFilterChange()
}

const handleGuestsChange = (): void => {
  emit('guests-change', guestsCount.value)
  emitFilterChange()
}

const handleSortChange = (): void => {
  if (isValidSortOption(sorting.value)) {
    emit('sort-change', sorting.value)
    emitFilterChange()
  }
}

// Funkcja emitowania zmian filtrów
const emitFilterChange = (): void => {
  const validation = validateForm()
  validationErrors.value = validation.errors

  if (validation.isValid) {
    const filterData: FilterData = {
      city: selectedCity.value,
      dates: {
        checkIn: checkIn.value,
        checkOut: checkOut.value,
      },
      guests: guestsCount.value,
      sorting: sorting.value, // POPRAWKA: już jest poprawnego typu
    }

    emit('filter-change', filterData)
  }
}

const handleSearch = (): void => {
  const validation = validateForm()
  validationErrors.value = validation.errors

  if (validation.isValid) {
    emit('search')
  }
}

// Watchers z typowaniem
watch(
  () => props.city,
  (newCity) => {
    selectedCity.value = newCity
  },
  { immediate: true },
)

watch(
  () => props.dates,
  (newDates) => {
    checkIn.value = newDates.checkIn
    checkOut.value = newDates.checkOut
  },
  { deep: true, immediate: true },
)

watch(
  () => props.guests,
  (newGuests) => {
    guestsCount.value = newGuests
  },
  { immediate: true },
)

// Expose funkcji dla parent component
defineExpose({
  validateForm,
  resetForm: (): void => {
    selectedCity.value = ''
    checkIn.value = ''
    checkOut.value = ''
    guestsCount.value = guestOptions[1].value // Default to 2 persons, 1 room
    sorting.value = 'popular' // POPRAWKA: użycie literal type
    validationErrors.value = {}
  },
  isValid: readonly(isFormValid),
  getFormData: (): FilterData => ({
    city: selectedCity.value,
    dates: { checkIn: checkIn.value, checkOut: checkOut.value },
    guests: guestsCount.value,
    sorting: sorting.value, // POPRAWKA: już jest poprawnego typu
  }),
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  if (!isValidCity(props.city)) {
    console.warn('TopFilterBar: Nieprawidłowe początkowe miasto:', props.city)
  }

  if (props.dates.checkIn && !isValidDate(props.dates.checkIn)) {
    console.warn('TopFilterBar: Nieprawidłowa początkowa data przyjazdu:', props.dates.checkIn)
  }

  if (props.dates.checkOut && !isValidDate(props.dates.checkOut)) {
    console.warn('TopFilterBar: Nieprawidłowa początkowa data wyjazdu:', props.dates.checkOut)
  }
}
</script>

<template>
  <div class="w-full bg-gray-50 py-6" role="search" aria-label="Filtry wyszukiwania zakwaterowań">
    <div class="max-w-7xl mx-auto px-4">
      <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <form
          @submit.prevent="handleSearch"
          class="flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-end"
          role="form"
          aria-label="Formularz filtrów zakwaterowań"
        >
          <!-- Miasto -->
          <div class="flex-1 min-w-[160px]">
            <label for="filterCity" class="block text-sm font-medium text-gray-500 mb-1">
              Lokalizacja
            </label>
            <div class="relative">
              <input
                id="filterCity"
                type="text"
                v-model="selectedCity"
                @input="handleCityChange"
                class="w-full p-3 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :class="{
                  'border-red-500 bg-red-50': validationErrors.city,
                  'border-gray-300 hover:border-gray-400': !validationErrors.city,
                }"
                placeholder="Wprowadź miasto"
                autocomplete="address-level2"
                :aria-invalid="!!validationErrors.city"
                :aria-describedby="validationErrors.city ? 'cityError' : 'cityHint'"
              />
              <i
                class="fas fa-map-marker-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              ></i>
            </div>
            <p id="cityHint" class="sr-only">Wprowadź nazwę miasta docelowego</p>
            <p
              v-if="validationErrors.city"
              id="cityError"
              class="text-xs text-red-600 mt-1"
              role="alert"
            >
              {{ validationErrors.city }}
            </p>
          </div>

          <!-- Daty przyjazdu i wyjazdu -->
          <div class="flex flex-1 gap-2 sm:gap-4">
            <div class="flex-1">
              <label for="filterCheckIn" class="block text-sm font-medium text-gray-500 mb-1">
                Przyjazd
              </label>
              <input
                id="filterCheckIn"
                type="date"
                v-model="checkIn"
                @change="handleDatesChange"
                :min="today"
                :max="maxDate"
                class="w-full p-3 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :class="{
                  'border-red-500 bg-red-50': validationErrors.checkIn,
                  'border-gray-300 hover:border-gray-400': !validationErrors.checkIn,
                }"
                :aria-invalid="!!validationErrors.checkIn"
                :aria-describedby="validationErrors.checkIn ? 'checkInError' : undefined"
              />
              <p
                v-if="validationErrors.checkIn"
                id="checkInError"
                class="text-xs text-red-600 mt-1"
                role="alert"
              >
                {{ validationErrors.checkIn }}
              </p>
            </div>

            <div class="flex-1">
              <label for="filterCheckOut" class="block text-sm font-medium text-gray-500 mb-1">
                Wyjazd
              </label>
              <input
                id="filterCheckOut"
                type="date"
                v-model="checkOut"
                @change="handleDatesChange"
                :min="checkIn || today"
                :max="maxDate"
                class="w-full p-3 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :class="{
                  'border-red-500 bg-red-50': validationErrors.checkOut,
                  'border-gray-300 hover:border-gray-400': !validationErrors.checkOut,
                }"
                :aria-invalid="!!validationErrors.checkOut"
                :aria-describedby="validationErrors.checkOut ? 'checkOutError' : undefined"
              />
              <p
                v-if="validationErrors.checkOut"
                id="checkOutError"
                class="text-xs text-red-600 mt-1"
                role="alert"
              >
                {{ validationErrors.checkOut }}
              </p>
            </div>

            <!-- Error dla zakresu dat -->
            <div v-if="validationErrors.dateRange" class="absolute mt-16 left-0 right-0">
              <p class="text-xs text-red-600" role="alert">
                {{ validationErrors.dateRange }}
              </p>
            </div>
          </div>

          <!-- Goście -->
          <div class="flex-1 min-w-[150px]">
            <label for="filterGuests" class="block text-sm font-medium text-gray-500 mb-1">
              Goście
            </label>
            <div class="relative">
              <select
                id="filterGuests"
                v-model="guestsCount"
                @change="handleGuestsChange"
                class="w-full p-3 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-gray-300 hover:border-gray-400 appearance-none cursor-pointer"
                aria-label="Wybierz liczbę gości i pokoi"
              >
                <option v-for="option in guestOptions" :key="option.value" :value="option.value">
                  {{ option.display }}
                </option>
              </select>
              <i
                class="fas fa-users absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden="true"
              ></i>
              <i
                class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden="true"
              ></i>
            </div>
            <p
              v-if="selectedGuestOption"
              class="text-xs text-gray-500 mt-1"
              :aria-label="`Wybrano: ${selectedGuestOption.persons} osób, ${selectedGuestOption.rooms} pokoi`"
            >
              {{ selectedGuestOption.persons }}
              {{ selectedGuestOption.persons === 1 ? 'osoba' : 'osób' }},
              {{ selectedGuestOption.rooms }}
              {{ selectedGuestOption.rooms === 1 ? 'pokój' : 'pokoi' }}
            </p>
          </div>

          <!-- Sortowanie -->
          <div class="flex-1 min-w-[150px]">
            <label for="filterSort" class="block text-sm font-medium text-gray-500 mb-1">
              Sortowanie
            </label>
            <div class="relative">
              <select
                id="filterSort"
                v-model="sorting"
                @change="handleSortChange"
                class="w-full p-3 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-gray-300 hover:border-gray-400 appearance-none cursor-pointer"
                aria-label="Wybierz sposób sortowania"
              >
                <option
                  v-for="option in sortOptions"
                  :key="String(option.value)"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <i
                class="fas fa-sort absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden="true"
              ></i>
              <i
                class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <!-- Przycisk wyszukaj (opcjonalny) -->
          <div class="md:flex-shrink-0">
            <button
              type="submit"
              :disabled="!isFormValid"
              class="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :aria-label="isFormValid ? 'Zastosuj filtry' : 'Uzupełnij wymagane pola aby wyszukać'"
            >
              <i class="fas fa-search mr-2" aria-hidden="true"></i>
              Zastosuj
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom select styling */
select {
  background-image: none;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

/* Focus styles dla accessibility */
input:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Date input styling */
input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
}

input[type='date']::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .gap-4 {
    gap: 1rem;
  }

  .min-w-160px {
    min-width: 140px;
  }

  .min-w-150px {
    min-width: 130px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none;
  }
}

/* Print styles */
@media print {
  .bg-gray-50 {
    background: white !important;
  }

  .shadow-md {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
}
</style>
