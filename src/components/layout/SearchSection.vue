<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

// Types dla guest selection
type GuestOption = {
  id: string
  display: string
  persons: number
  beds: number
}

// Interface dla danych formularza wyszukiwania
interface SearchFormData {
  location: string
  checkInDate: string
  checkOutDate: string
  guests: {
    persons: number
    beds: number
    display: string
  }
}

// Interface dla props komponentu
interface SearchSectionProps {
  initialLocation?: string
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: string
  maxAdvanceBookingDays?: number
}

// Interface dla eventów emitowanych przez komponent
interface SearchSectionEmits {
  (event: 'search', data: SearchFormData): void
  (event: 'location-change', location: string): void
  (event: 'date-change', type: 'checkIn' | 'checkOut', date: string): void
  (event: 'guests-change', guests: GuestOption): void
}

// Props z domyślnymi wartościami
const props = withDefaults(defineProps<SearchSectionProps>(), {
  initialLocation: '',
  initialCheckIn: '',
  initialCheckOut: '',
  initialGuests: '2 osoby, 1 łóżko',
  maxAdvanceBookingDays: 365,
})

// Definicja emitów
const emit = defineEmits<SearchSectionEmits>()

// Template refs z typowaniem
const checkInInput = ref<HTMLInputElement | null>(null)
const checkOutInput = ref<HTMLInputElement | null>(null)
const guestsInput = ref<HTMLSelectElement | null>(null)
const locationInput = ref<HTMLInputElement | null>(null)

// Stan formularza z typowaniem
const location = ref<string>(props.initialLocation)
const checkInDate = ref<string>(props.initialCheckIn)
const checkOutDate = ref<string>(props.initialCheckOut)
const selectedGuests = ref<string>(props.initialGuests)

// Stan walidacji
const validationErrors = ref<Record<string, string>>({})
const isSearching = ref<boolean>(false)

// Computed property dla dzisiejszej daty
const today = computed<string>(() => new Date().toISOString().split('T')[0])

// Computed property dla maksymalnej daty
const maxDate = computed<string>(() => {
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + props.maxAdvanceBookingDays)
  return maxDate.toISOString().split('T')[0]
})

// Opcje gości z typowaniem
const guestOptions: readonly GuestOption[] = [
  { id: '1p1b', display: '1 osoba, 1 łóżko', persons: 1, beds: 1 },
  { id: '2p1b', display: '2 osoby, 1 łóżko', persons: 2, beds: 1 },
  { id: '2p2b', display: '2 osoby, 2 łóżka', persons: 2, beds: 2 },
  { id: '3p2b', display: '3 osoby, 2 łóżka', persons: 3, beds: 2 },
  { id: '3p3b', display: '3 osoby, 3 łóżka', persons: 3, beds: 3 },
  { id: '4p2b', display: '4 osoby, 2 łóżka', persons: 4, beds: 2 },
  { id: '4p3b', display: '4 osoby, 3 łóżka', persons: 4, beds: 3 },
  { id: '4p4b', display: '4 osoby, 4 łóżka', persons: 4, beds: 4 },
] as const

// Computed property dla wybranej opcji gości
const selectedGuestOption = computed<GuestOption | null>(() => {
  return guestOptions.find((option) => option.display === selectedGuests.value) || null
})

// Type guards
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  const todayDate = new Date(today.value)
  const maxDateValue = new Date(maxDate.value)

  return !isNaN(date.getTime()) && date >= todayDate && date <= maxDateValue
}

const isValidDateRange = (checkIn: string, checkOut: string): boolean => {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return false
  return new Date(checkOut) > new Date(checkIn)
}

const isValidLocation = (location: string): boolean => {
  return location.trim().length >= 2
}

// Funkcja pozycjonowania kalendarza z typowaniem
const getOptimalCalendarPosition = (): string => {
  const screenWidth = window.innerWidth
  if (screenWidth < 768) {
    return 'inset-0 opacity-0 pointer-events-none'
  } else {
    return 'left-4 top-1/2 transform -translate-y-1/2 opacity-0 pointer-events-none w-0 h-0 z-0'
  }
}

const calendarPosition = ref<string>(getOptimalCalendarPosition())

// Funkcja aktualizacji pozycji kalendarza
const updateCalendarPosition = (): void => {
  calendarPosition.value = getOptimalCalendarPosition()
}

// Funkcje otwierania kalendarzy z typowaniem
const openDatePicker = (type: 'checkIn' | 'checkOut'): void => {
  updateCalendarPosition()

  if (type === 'checkIn' && checkInInput.value) {
    checkInInput.value.showPicker()
  } else if (type === 'checkOut' && checkOutInput.value) {
    checkOutInput.value.showPicker()
  }
}

// Funkcja formatowania daty z typowaniem
const formatDisplayDate = (dateString: string): string => {
  if (!dateString || !isValidDate(dateString)) return ''

  try {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    return date.toLocaleDateString('pl-PL', options)
  } catch (error) {
    console.warn('SearchSection: Błąd formatowania daty:', error)
    return ''
  }
}

// Handler otwierania dropdown gości
const openGuestsPicker = (): void => {
  if (guestsInput.value) {
    guestsInput.value.focus()
    guestsInput.value.click()
  }
}

// Funkcja walidacji formularza
const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  if (!isValidLocation(location.value)) {
    errors.location = 'Proszę wprowadzić lokalizację (minimum 2 znaki)'
  }

  if (!isValidDate(checkInDate.value)) {
    errors.checkIn = 'Proszę wybrać poprawną datę zameldowania'
  }

  if (!isValidDate(checkOutDate.value)) {
    errors.checkOut = 'Proszę wybrać poprawną datę wymeldowania'
  }

  if (
    checkInDate.value &&
    checkOutDate.value &&
    !isValidDateRange(checkInDate.value, checkOutDate.value)
  ) {
    errors.dateRange = 'Data wymeldowania musi być późniejsza niż data zameldowania'
  }

  if (!selectedGuestOption.value) {
    errors.guests = 'Proszę wybrać liczbę gości'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Handler wyszukiwania z walidacją
const handleSearch = async (): Promise<void> => {
  const validation = validateForm()
  validationErrors.value = validation.errors

  if (!validation.isValid) {
    // Scroll do pierwszego błędu
    const firstErrorElement = document.querySelector('[data-error]')
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  if (!selectedGuestOption.value) return

  isSearching.value = true

  try {
    const searchData: SearchFormData = {
      location: location.value.trim(),
      checkInDate: checkInDate.value,
      checkOutDate: checkOutDate.value,
      guests: {
        persons: selectedGuestOption.value.persons,
        beds: selectedGuestOption.value.beds,
        display: selectedGuestOption.value.display,
      },
    }

    emit('search', searchData)
  } catch (error) {
    console.error('SearchSection: Błąd podczas wyszukiwania:', error)
  } finally {
    // Symulacja czasu wyszukiwania
    setTimeout(() => {
      isSearching.value = false
    }, 1000)
  }
}

// Event handlers z typowaniem
const handleLocationChange = (): void => {
  if (validationErrors.value.location) {
    delete validationErrors.value.location
  }
  emit('location-change', location.value)
}

const handleDateChange = (type: 'checkIn' | 'checkOut', date: string): void => {
  if (validationErrors.value[type === 'checkIn' ? 'checkIn' : 'checkOut']) {
    delete validationErrors.value[type === 'checkIn' ? 'checkIn' : 'checkOut']
  }
  if (validationErrors.value.dateRange) {
    delete validationErrors.value.dateRange
  }

  emit('date-change', type, date)
}

const handleGuestsChange = (): void => {
  if (validationErrors.value.guests) {
    delete validationErrors.value.guests
  }

  const option = selectedGuestOption.value
  if (option) {
    emit('guests-change', option)
  }
}

// Computed property dla sprawdzenia czy formularz może być wysłany
const canSubmit = computed<boolean>(() => {
  return (
    !isSearching.value &&
    location.value.trim().length > 0 &&
    checkInDate.value.length > 0 &&
    checkOutDate.value.length > 0
  )
})

// Expose funkcji dla parent component
defineExpose({
  validateForm,
  resetForm: (): void => {
    location.value = ''
    checkInDate.value = ''
    checkOutDate.value = ''
    selectedGuests.value = guestOptions[1].display // Default to 2 persons, 1 bed
    validationErrors.value = {}
  },
  setLocation: (newLocation: string): void => {
    location.value = newLocation
  },
  isValid: computed(() => validateForm().isValid),
})

// Lifecycle hooks
onMounted((): void => {
  window.addEventListener('resize', updateCalendarPosition)
  updateCalendarPosition()
})

onBeforeUnmount((): void => {
  window.removeEventListener('resize', updateCalendarPosition)
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  if (props.maxAdvanceBookingDays <= 0) {
    console.warn('SearchSection: maxAdvanceBookingDays musi być większy od 0')
  }

  if (props.initialCheckIn && !isValidDate(props.initialCheckIn)) {
    console.warn('SearchSection: Nieprawidłowa początkowa data check-in')
  }

  if (props.initialCheckOut && !isValidDate(props.initialCheckOut)) {
    console.warn('SearchSection: Nieprawidłowa początkowa data check-out')
  }
}
</script>

<template>
  <section
    class="py-12 bg-white -mt-24 relative z-10"
    role="search"
    aria-label="Wyszukiwanie zakwaterowań"
  >
    <!-- Marketing text container -->
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

    <!-- Search form container -->
    <div class="container mx-auto px-4">
      <form
        @submit.prevent="handleSearch"
        class="grid grid-cols-1 md:grid-cols-4 gap-5"
        role="form"
        aria-label="Formularz wyszukiwania zakwaterowań"
      >
        <!-- Lokalizacja -->
        <div class="flex flex-col">
          <label for="location" class="text-sm text-gray-600 mb-1">Lokalizacja</label>
          <div class="relative">
            <input
              id="location"
              ref="locationInput"
              type="text"
              v-model="location"
              @input="handleLocationChange"
              placeholder="Gdzie chcesz nocować?"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:border-gray-400 focus:border-primary-500 focus:bg-white transition-all focus:outline-none"
              :class="{ 'border-red-500 bg-red-50': validationErrors.location }"
              :data-error="validationErrors.location ? 'true' : undefined"
              aria-describedby="location-error"
              autocomplete="off"
            />
          </div>
          <p
            v-if="validationErrors.location"
            id="location-error"
            class="text-xs text-red-600 mt-1"
            role="alert"
          >
            {{ validationErrors.location }}
          </p>
        </div>

        <!-- Daty -->
        <div class="col-span-2 grid grid-cols-2 gap-3">
          <!-- Zameldowanie -->
          <div class="flex flex-col">
            <label for="checkIn" class="text-sm text-gray-600 mb-1">Zameldowanie</label>
            <div class="relative">
              <!-- Ukryty input kalendarza -->
              <input
                id="checkIn"
                ref="checkInInput"
                type="date"
                v-model="checkInDate"
                @change="handleDateChange('checkIn', checkInDate)"
                :min="today"
                :max="maxDate"
                :class="`absolute ${calendarPosition}`"
                aria-hidden="true"
              />
              <!-- Widoczny przycisk -->
              <button
                type="button"
                @click="openDatePicker('checkIn')"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg text-left bg-gray-50 hover:border-gray-400 focus:border-primary-500 focus:bg-white transition-all cursor-pointer flex items-center justify-between focus:outline-none"
                :class="{ 'border-red-500 bg-red-50': validationErrors.checkIn }"
                :aria-expanded="false"
                aria-label="Wybierz datę zameldowania"
                :data-error="validationErrors.checkIn ? 'true' : undefined"
              >
                <span :class="checkInDate ? 'text-gray-900' : 'text-gray-500'">
                  {{ checkInDate ? formatDisplayDate(checkInDate) : 'Wybierz datę' }}
                </span>
                <i class="fas fa-calendar-alt text-gray-400" aria-hidden="true"></i>
              </button>
            </div>
            <p v-if="validationErrors.checkIn" class="text-xs text-red-600 mt-1" role="alert">
              {{ validationErrors.checkIn }}
            </p>
          </div>

          <!-- Wymeldowanie -->
          <div class="flex flex-col">
            <label for="checkOut" class="text-sm text-gray-600 mb-1">Wymeldowanie</label>
            <div class="relative">
              <!-- Ukryty input kalendarza -->
              <input
                id="checkOut"
                ref="checkOutInput"
                type="date"
                v-model="checkOutDate"
                @change="handleDateChange('checkOut', checkOutDate)"
                :min="checkInDate || today"
                :max="maxDate"
                :class="`absolute ${calendarPosition}`"
                aria-hidden="true"
              />
              <!-- Widoczny przycisk -->
              <button
                type="button"
                @click="openDatePicker('checkOut')"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg text-left bg-gray-50 hover:border-gray-400 focus:border-primary-500 focus:bg-white transition-all cursor-pointer flex items-center justify-between focus:outline-none"
                :class="{ 'border-red-500 bg-red-50': validationErrors.checkOut }"
                :aria-expanded="false"
                aria-label="Wybierz datę wymeldowania"
                :data-error="validationErrors.checkOut ? 'true' : undefined"
              >
                <span :class="checkOutDate ? 'text-gray-900' : 'text-gray-500'">
                  {{ checkOutDate ? formatDisplayDate(checkOutDate) : 'Wybierz datę' }}
                </span>
                <i class="fas fa-calendar-alt text-gray-400" aria-hidden="true"></i>
              </button>
            </div>
            <p v-if="validationErrors.checkOut" class="text-xs text-red-600 mt-1" role="alert">
              {{ validationErrors.checkOut }}
            </p>
          </div>

          <!-- Error dla zakresu dat -->
          <div v-if="validationErrors.dateRange" class="col-span-2">
            <p class="text-xs text-red-600" role="alert">
              {{ validationErrors.dateRange }}
            </p>
          </div>
        </div>

        <!-- Goście -->
        <div class="flex flex-col">
          <label for="guests" class="text-sm text-gray-600 mb-1">Liczba gości</label>
          <div
            class="relative w-full text-left bg-gray-50 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
            :class="{ 'border-red-500 bg-red-50': validationErrors.guests }"
            @click="openGuestsPicker"
          >
            <select
              id="guests"
              ref="guestsInput"
              v-model="selectedGuests"
              @change="handleGuestsChange"
              class="w-full px-4 py-2 bg-transparent text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-0 appearance-none"
              :data-error="validationErrors.guests ? 'true' : undefined"
              aria-label="Wybierz liczbę gości"
            >
              <option v-for="option in guestOptions" :key="option.id" :value="option.display">
                {{ option.display }}
              </option>
            </select>
            <i
              class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            ></i>
          </div>
          <p v-if="validationErrors.guests" class="text-xs text-red-600 mt-1" role="alert">
            {{ validationErrors.guests }}
          </p>
        </div>

        <!-- Search button -->
        <div class="md:col-span-4 flex justify-center mt-6">
          <AnimatedButton
            type="submit"
            class="px-8 py-3"
            :disabled="!canSubmit"
            :aria-label="
              isSearching ? 'Wyszukiwanie w toku' : 'Rozpocznij wyszukiwanie zakwaterowań'
            "
          >
            <span v-if="!isSearching" class="flex items-center gap-2">
              <i class="fas fa-search" aria-hidden="true"></i>
              Szukaj
            </span>
            <span v-else class="flex items-center gap-2">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
              Szukam...
            </span>
          </AnimatedButton>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
/* Ukryj domyślne formatowanie daty */
input[type='date']::-webkit-datetime-edit {
  opacity: 0;
}

/* Pokaż ikonę kalendarza */
input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 1;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

/* Styl dla inputa */
input[type='date'] {
  min-height: 24px;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none;
  }
}

/* Focus styles */
input:focus-visible,
button:focus-visible,
select:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fa-spin {
  animation: spin 1s linear infinite;
}
</style>
