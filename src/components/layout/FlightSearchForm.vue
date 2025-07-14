<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { popularDestinations, popularOrigins } from '@/mock/mockFlights'

// Union types dla lepszego typowania
type TripType = 'oneway' | 'roundtrip'
type NotificationType = 'error' | 'success' | 'warning'

// Interface dla destynacji/pochodzenia
interface CityDestination {
  code: string
  name: string
  country?: string
}

// Interface dla stanu notyfikacji
interface NotificationState {
  show: boolean
  message: string
  type: NotificationType
}

// Interface dla danych wyszukiwania lotów
interface FlightSearchData {
  from: string
  to: string
  departDate: string
  returnDate: string | null
  passengers: number
  tripType: TripType
}

// Interface dla eventów emitowanych przez komponent
interface FlightSearchFormEmits {
  (event: 'search', data: FlightSearchData): void
}

// Definicja emitów
const emit = defineEmits<FlightSearchFormEmits>()

// Stan komponentu z typowaniem
const tripType = ref<TripType>('oneway')
const fromInput = ref<string>('')
const toInput = ref<string>('')
const departDate = ref<string>('')
const returnDate = ref<string>('')
const passengers = ref<number>(1)

// Stan autouzupełniania
const showFromSuggestions = ref<boolean>(false)
const showToSuggestions = ref<boolean>(false)

// Stan wyszukiwania i notyfikacji
const isSearching = ref<boolean>(false)
const notification = ref<NotificationState>({
  show: false,
  message: '',
  type: 'error',
})

// Template refs z typowaniem
const departDateInput = ref<HTMLInputElement | null>(null)
const returnDateInput = ref<HTMLInputElement | null>(null)

// Timeouts dla cleanup
let notificationTimeout: ReturnType<typeof setTimeout> | null = null
let fromSuggestionsTimeout: ReturnType<typeof setTimeout> | null = null
let toSuggestionsTimeout: ReturnType<typeof setTimeout> | null = null

// Computed properties z typowaniem
const fromSuggestions = computed<CityDestination[]>(() => {
  if (!fromInput.value) return []
  const searchTerm = fromInput.value.toLowerCase()
  return popularOrigins.filter(
    (city: CityDestination) =>
      city.name.toLowerCase().includes(searchTerm) || city.code.toLowerCase().includes(searchTerm),
  )
})

const toSuggestions = computed<CityDestination[]>(() => {
  if (!toInput.value) return []
  const searchTerm = toInput.value.toLowerCase()
  return popularDestinations.filter(
    (city: CityDestination) =>
      city.name.toLowerCase().includes(searchTerm) || city.code.toLowerCase().includes(searchTerm),
  )
})

// Dzisiejsza data dla walidacji
const today = computed<string>(() => new Date().toISOString().split('T')[0])

// Pozycja kalendarza responsywna
const calendarPosition = ref<string>('')

// Type guards dla walidacji
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && date >= new Date(today.value)
}

const isValidTripType = (type: string): type is TripType => {
  return ['oneway', 'roundtrip'].includes(type)
}

const isValidPassengerCount = (count: number): boolean => {
  return Number.isInteger(count) && count >= 1 && count <= 9
}

// Funkcje obsługi sugestii z typowaniem
const selectFromSuggestion = (suggestion: CityDestination): void => {
  fromInput.value = `${suggestion.name} (${suggestion.code})`
  showFromSuggestions.value = false
}

const selectToSuggestion = (suggestion: CityDestination): void => {
  toInput.value = `${suggestion.name} (${suggestion.code})`
  showToSuggestions.value = false
}

// Funkcje ukrywania sugestii z cleanup
const hideFromSuggestions = (): void => {
  if (fromSuggestionsTimeout) {
    clearTimeout(fromSuggestionsTimeout)
  }
  fromSuggestionsTimeout = setTimeout(() => {
    showFromSuggestions.value = false
  }, 200)
}

const hideToSuggestions = (): void => {
  if (toSuggestionsTimeout) {
    clearTimeout(toSuggestionsTimeout)
  }
  toSuggestionsTimeout = setTimeout(() => {
    showToSuggestions.value = false
  }, 200)
}

// Zarządzanie liczbą pasażerów z walidacją
const incrementPassengers = (): void => {
  if (passengers.value < 9) {
    passengers.value++
  }
}

const decrementPassengers = (): void => {
  if (passengers.value > 1) {
    passengers.value--
  }
}

// System notyfikacji z typowaniem
const showNotification = (message: string, type: NotificationType = 'error'): void => {
  notification.value = {
    show: true,
    message,
    type,
  }

  // Cleanup poprzedniego timeoutu
  if (notificationTimeout) {
    clearTimeout(notificationTimeout)
  }

  // Automatyczne ukrycie po 4 sekundach
  notificationTimeout = setTimeout(() => {
    notification.value.show = false
  }, 4000)
}

const hideNotification = (): void => {
  notification.value.show = false
  if (notificationTimeout) {
    clearTimeout(notificationTimeout)
    notificationTimeout = null
  }
}

// Walidacja formularza z lepszym typowaniem
const validateForm = (): { isValid: boolean; error?: string } => {
  if (!fromInput.value.trim()) {
    return { isValid: false, error: 'Proszę wybrać miejsce wylotu' }
  }

  if (!toInput.value.trim()) {
    return { isValid: false, error: 'Proszę wybrać miejsce przylotu' }
  }

  // POPRAWKA: Walidacja kodów IATA
  const fromCode = extractIATACode(fromInput.value)
  const toCode = extractIATACode(toInput.value)

  if (!fromCode || fromCode.length !== 3) {
    return { isValid: false, error: 'Nieprawidłowy format miejsca wylotu' }
  }

  if (!toCode || toCode.length !== 3) {
    return { isValid: false, error: 'Nieprawidłowy format miejsca przylotu' }
  }

  if (fromCode === toCode) {
    return { isValid: false, error: 'Miejsce wylotu i przylotu nie mogą być takie same' }
  }

  if (!isValidDate(departDate.value)) {
    return { isValid: false, error: 'Proszę wybrać poprawną datę wylotu' }
  }

  if (tripType.value === 'roundtrip') {
    if (!isValidDate(returnDate.value)) {
      return { isValid: false, error: 'Proszę wybrać poprawną datę powrotu' }
    }

    const departureDate = new Date(departDate.value)
    const returnDateObj = new Date(returnDate.value)

    if (returnDateObj < departureDate) {
      return { isValid: false, error: 'Data powrotu nie może być wcześniejsza niż data wylotu' }
    }
  }

  if (!isValidPassengerCount(passengers.value)) {
    return { isValid: false, error: 'Nieprawidłowa liczba pasażerów' }
  }

  return { isValid: true }
}

// Funkcja ekstraktowania kodu IATA z tekstu
const extractIATACode = (input: string): string => {
  if (!input) return ''

  // Sprawdź czy tekst zawiera kod w nawiasach np. "Kraków (KRK)"
  const match = input.match(/\(([A-Z]{3})\)/)
  if (match && match[1]) {
    return match[1]
  }

  // Sprawdź czy to jest bezpośrednio kod IATA (3 litery)
  const trimmed = input.trim().toUpperCase()
  if (/^[A-Z]{3}$/.test(trimmed)) {
    return trimmed
  }

  // Fallback - zwróć pierwsze 3 znaki (dla przypadków gdy użytkownik wpisuje tylko nazwę)
  return trimmed.substring(0, 3)
}

// Główna funkcja wyszukiwania z typowaniem
const handleSearch = (): void => {
  const validation = validateForm()

  if (!validation.isValid) {
    showNotification(validation.error!, 'warning')
    return
  }

  // Rozpocznij loading
  isSearching.value = true

  // POPRAWKA: Ekstraktuj kody IATA z pełnych nazw
  const fromCode = extractIATACode(fromInput.value)
  const toCode = extractIATACode(toInput.value)

  // Walidacja kodów IATA
  if (!fromCode || fromCode.length !== 3) {
    showNotification('Nieprawidłowy kod lotniska wylotu', 'error')
    isSearching.value = false
    return
  }

  if (!toCode || toCode.length !== 3) {
    showNotification('Nieprawidłowy kod lotniska przylotu', 'error')
    isSearching.value = false
    return
  }

  const searchData: FlightSearchData = {
    from: fromCode, // POPRAWKA: Używaj wyekstraktowanego kodu
    to: toCode, // POPRAWKA: Używaj wyekstraktowanego kodu
    departDate: departDate.value,
    returnDate: tripType.value === 'roundtrip' ? returnDate.value : null,
    passengers: passengers.value,
    tripType: tripType.value,
  }

  emit('search', searchData)

  // Symulacja czasu wyszukiwania
  setTimeout(() => {
    isSearching.value = false
  }, 2000)
}

// Funkcje kalendarza z typowaniem
const getOptimalCalendarPosition = (): string => {
  const screenWidth = window.innerWidth

  if (screenWidth < 768) {
    return 'inset-0 opacity-0 pointer-events-none'
  } else {
    return 'left-4 top-1/2 transform -translate-y-1/2 opacity-0 pointer-events-none w-0 h-0 z-0'
  }
}

const updateCalendarPosition = (): void => {
  calendarPosition.value = getOptimalCalendarPosition()
}

const openDepartCalendar = (): void => {
  if (departDateInput.value) {
    updateCalendarPosition()
    departDateInput.value.showPicker()
  }
}

const openReturnCalendar = (): void => {
  if (returnDateInput.value) {
    updateCalendarPosition()
    returnDateInput.value.showPicker()
  }
}

// Formatowanie daty z lepszym typowaniem
const formatDisplayDate = (dateString: string): string => {
  if (!dateString || !isValidDate(dateString)) return ''

  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  return date.toLocaleDateString('pl-PL', options)
}

// Event handlers z typowaniem
const handleFromFocus = (): void => {
  showFromSuggestions.value = true
}

const handleToFocus = (): void => {
  showToSuggestions.value = true
}

const handleSuggestionKeydown = (
  event: KeyboardEvent,
  suggestion: CityDestination,
  type: 'from' | 'to',
): void => {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (type === 'from') {
      selectFromSuggestion(suggestion)
    } else {
      selectToSuggestion(suggestion)
    }
  }
}

// Lifecycle hooks z cleanup
onMounted((): void => {
  window.addEventListener('resize', updateCalendarPosition)
  updateCalendarPosition()
})

onBeforeUnmount((): void => {
  window.removeEventListener('resize', updateCalendarPosition)

  // Cleanup timeouts
  if (notificationTimeout) clearTimeout(notificationTimeout)
  if (fromSuggestionsTimeout) clearTimeout(fromSuggestionsTimeout)
  if (toSuggestionsTimeout) clearTimeout(toSuggestionsTimeout)
})

// Expose funkcji dla parent component
defineExpose({
  validateForm,
  resetForm: (): void => {
    fromInput.value = ''
    toInput.value = ''
    departDate.value = ''
    returnDate.value = ''
    passengers.value = 1
    tripType.value = 'oneway'
    hideNotification()
  },
  showNotification,
  isValid: computed(() => validateForm().isValid),
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  // Sprawdzenie czy mock data ma właściwą strukturę
  popularOrigins.forEach((city, index) => {
    if (!city.code || !city.name) {
      console.warn(`FlightSearchForm: Nieprawidłowa struktura origin city na pozycji ${index}`)
    }
  })

  popularDestinations.forEach((city, index) => {
    if (!city.code || !city.name) {
      console.warn(`FlightSearchForm: Nieprawidłowa struktura destination city na pozycji ${index}`)
    }
  })
}
</script>

<template>
  <div class="bg-white p-4 sm:p-6 rounded-lg shadow-md relative">
    <!-- Custom notyfikacja -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="notification.show"
        class="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto sm:max-w-sm bg-white rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 z-50"
        :class="{
          'border-l-4 border-red-500': notification.type === 'error',
          'border-l-4 border-yellow-500': notification.type === 'warning',
          'border-l-4 border-green-500': notification.type === 'success',
        }"
        role="alert"
        aria-live="assertive"
      >
        <div class="p-3 sm:p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <i
                class="text-base sm:text-lg"
                :class="{
                  'fas fa-exclamation-circle text-red-500': notification.type === 'error',
                  'fas fa-exclamation-triangle text-yellow-500': notification.type === 'warning',
                  'fas fa-check-circle text-green-500': notification.type === 'success',
                }"
                aria-hidden="true"
              ></i>
            </div>
            <div class="ml-2 sm:ml-3 flex-1 pt-0.5">
              <p class="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                {{ notification.message }}
              </p>
            </div>
            <button
              @click="hideNotification"
              class="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Zamknij notyfikację"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Selektor typu podróży -->
    <div class="mb-6 sm:mb-8" role="radiogroup" aria-labelledby="tripTypeLabel">
      <h3 id="tripTypeLabel" class="text-sm font-medium text-gray-700 pb-5">Typ podróży</h3>
      <div class="flex flex-wrap bg-gray-100 p-1 rounded-lg shadow-sm gap-1">
        <!-- Opcja w jedną stronę -->
        <label
          class="flex-1 min-w-[120px] relative cursor-pointer overflow-hidden rounded-md"
          for="tripTypeOneway"
        >
          <input
            type="radio"
            name="tripType"
            value="oneway"
            v-model="tripType"
            class="peer sr-only"
            id="tripTypeOneway"
            aria-labelledby="onewayLabel"
          />
          <span
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-center transition-all relative z-10 w-full h-full"
            :class="
              tripType === 'oneway'
                ? 'bg-white font-medium text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            "
          >
            <i class="fas fa-plane-departure h-4 w-4" aria-hidden="true"></i>
            <span id="onewayLabel">W jedną stronę</span>
          </span>
        </label>

        <!-- Opcja w obie strony -->
        <label
          class="flex-1 min-w-[120px] relative cursor-pointer overflow-hidden rounded-md"
          for="tripTypeRoundtrip"
        >
          <input
            type="radio"
            name="tripType"
            value="roundtrip"
            v-model="tripType"
            class="peer sr-only"
            id="tripTypeRoundtrip"
            aria-labelledby="roundtripLabel"
          />
          <span
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-center transition-all relative z-10 w-full h-full"
            :class="
              tripType === 'roundtrip'
                ? 'bg-white font-medium text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            "
          >
            <i class="fas fa-exchange-alt h-4 w-4" aria-hidden="true"></i>
            <span id="roundtripLabel">W obie strony</span>
          </span>
        </label>
      </div>
    </div>

    <!-- Formularz wyszukiwania -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 mb-6">
      <!-- Miejsce wylotu -->
      <div class="relative">
        <label for="from" class="block text-sm font-medium text-gray-700 mb-1">Z</label>
        <input
          type="text"
          id="from"
          v-model="fromInput"
          placeholder="Miasto lub lotnisko"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 transition-all"
          @focus="handleFromFocus"
          @blur="hideFromSuggestions"
          aria-label="Miejsce wylotu"
          aria-describedby="fromHint"
          autocomplete="off"
        />
        <p id="fromHint" class="sr-only">Wprowadź nazwę miasta lub kod lotniska</p>
        <div
          v-if="showFromSuggestions && fromSuggestions.length > 0"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden border border-gray-200"
          role="listbox"
          aria-label="Sugestie miejsc wylotu"
        >
          <ul class="max-h-60 overflow-auto">
            <li
              v-for="suggestion in fromSuggestions"
              :key="suggestion.code"
              @mousedown="selectFromSuggestion(suggestion)"
              @keydown="(e: KeyboardEvent) => handleSuggestionKeydown(e, suggestion, 'from')"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer focus-within:bg-primary-50 border-b border-gray-100 last:border-b-0"
              role="option"
              tabindex="0"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium text-gray-900">{{ suggestion.name }}</span>
                <span class="text-sm text-gray-500">{{ suggestion.code }}</span>
              </div>
              <div v-if="suggestion.country" class="text-xs text-gray-400">
                {{ suggestion.country }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Miejsce przylotu -->
      <div class="relative">
        <label for="to" class="block text-sm font-medium text-gray-700 mb-1">Do</label>
        <input
          type="text"
          id="to"
          v-model="toInput"
          placeholder="Miasto lub lotnisko"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 transition-all"
          @focus="handleToFocus"
          @blur="hideToSuggestions"
          aria-label="Miejsce przylotu"
          aria-describedby="toHint"
          autocomplete="off"
        />
        <p id="toHint" class="sr-only">Wprowadź nazwę miasta lub kod lotniska</p>
        <div
          v-if="showToSuggestions && toSuggestions.length > 0"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden border border-gray-200"
          role="listbox"
          aria-label="Sugestie miejsc przylotu"
        >
          <ul class="max-h-60 overflow-auto">
            <li
              v-for="suggestion in toSuggestions"
              :key="suggestion.code"
              @mousedown="selectToSuggestion(suggestion)"
              @keydown="(e: KeyboardEvent) => handleSuggestionKeydown(e, suggestion, 'to')"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer focus-within:bg-primary-50 border-b border-gray-100 last:border-b-0"
              role="option"
              tabindex="0"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium text-gray-900">{{ suggestion.name }}</span>
                <span class="text-sm text-gray-500">{{ suggestion.code }}</span>
              </div>
              <div v-if="suggestion.country" class="text-xs text-gray-400">
                {{ suggestion.country }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Data wylotu -->
      <div>
        <label for="departDate" class="block text-sm font-medium text-gray-700 mb-1">
          Data wylotu
        </label>
        <div class="relative">
          <!-- Ukryty input kalendarza -->
          <input
            ref="departDateInput"
            type="date"
            id="departDate"
            v-model="departDate"
            :min="today"
            :class="`absolute ${calendarPosition}`"
            aria-hidden="true"
          />
          <!-- Widoczny przycisk -->
          <button
            type="button"
            @click="openDepartCalendar"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 transition-all text-left bg-white hover:border-gray-400 cursor-pointer flex items-center justify-between relative z-10"
            aria-label="Wybierz datę wylotu"
            :aria-expanded="false"
          >
            <span :class="departDate ? 'text-gray-900' : 'text-gray-500'">
              {{ departDate ? formatDisplayDate(departDate) : 'Wybierz datę wylotu' }}
            </span>
            <i class="fas fa-calendar-alt text-gray-400" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <!-- Data powrotu -->
      <div v-if="tripType === 'roundtrip'">
        <label for="returnDate" class="block text-sm font-medium text-gray-700 mb-1">
          Data powrotu
        </label>
        <div class="relative">
          <!-- Ukryty input kalendarza -->
          <input
            ref="returnDateInput"
            type="date"
            id="returnDate"
            v-model="returnDate"
            :min="departDate || today"
            :class="`absolute ${calendarPosition}`"
            aria-hidden="true"
          />
          <!-- Widoczny przycisk -->
          <button
            type="button"
            @click="openReturnCalendar"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 transition-all text-left bg-white hover:border-gray-400 cursor-pointer flex items-center justify-between relative z-10"
            aria-label="Wybierz datę powrotu"
            :aria-expanded="false"
          >
            <span :class="returnDate ? 'text-gray-900' : 'text-gray-500'">
              {{ returnDate ? formatDisplayDate(returnDate) : 'Wybierz datę powrotu' }}
            </span>
            <i class="fas fa-calendar-alt text-gray-400" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <!-- Pasażerowie -->
      <div v-if="tripType === 'oneway' || true" class="md:col-span-2 lg:col-span-1">
        <label for="passengers" class="block text-sm font-medium text-gray-700 mb-1"
          >Pasażerowie</label
        >
        <div
          class="flex border border-gray-300 rounded-md overflow-hidden transition-all hover:border-gray-400 focus-within:border-primary-500"
          role="group"
          aria-labelledby="passengersLabel"
        >
          <button
            @click="decrementPassengers"
            type="button"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="passengers <= 1"
            aria-label="Zmniejsz liczbę pasażerów"
          >
            <i class="fas fa-minus text-gray-600" aria-hidden="true"></i>
          </button>
          <div class="flex-1 flex items-center justify-center bg-white" aria-live="polite">
            <span class="font-medium">{{ passengers }}</span>
            <span class="sr-only">{{ passengers === 1 ? 'pasażer' : 'pasażerów' }}</span>
          </div>
          <button
            @click="incrementPassengers"
            type="button"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="passengers >= 9"
            aria-label="Zwiększ liczbę pasażerów"
          >
            <i class="fas fa-plus text-gray-600" aria-hidden="true"></i>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">Maksymalnie 9 pasażerów</p>
      </div>
    </div>

    <!-- Przycisk wyszukiwania z loading spinner -->
    <div class="flex flex-col items-center p-4 sm:p-8">
      <AnimatedButton
        variant="primary"
        class="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
        :disabled="isSearching"
        @click="handleSearch"
        :aria-label="isSearching ? 'Wyszukiwanie w toku' : 'Rozpocznij wyszukiwanie lotów'"
      >
        <span v-if="!isSearching" class="flex items-center justify-center gap-2">
          <i class="fas fa-search" aria-hidden="true"></i>
          Szukaj lotów
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
          Szukam...
        </span>
      </AnimatedButton>

      <p class="text-xs text-gray-500 mt-2 text-center max-w-sm">
        Wyszukamy najlepsze oferty lotów dostępne w wybranym terminie
      </p>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animacja Loading Spinnera */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Ukrywanie spinnerów w date inputs */
input[type='date']::-webkit-calendar-picker-indicator {
  display: none;
}

input[type='date']::-webkit-inner-spin-button,
input[type='date']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
