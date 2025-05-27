<script setup lang="ts">
import { ref, computed } from 'vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { popularDestinations, popularOrigins } from '@/mock/mockFlights'

// Typ podróży - 'roundtrip' (w obie strony) lub 'oneway' (w jedną stronę)
// Domyślnie 'oneway' (w jedną stronę)
const tripType = ref('oneway')

// Dane formularza
const fromInput = ref('')
const toInput = ref('')
const departDate = ref('')
const returnDate = ref('')
const passengers = ref(1)

// Autouzupełnianie
const showFromSuggestions = ref(false)
const showToSuggestions = ref(false)

// Filtrowane podpowiedzi
const fromSuggestions = computed(() => {
  if (!fromInput.value) return []
  const searchTerm = fromInput.value.toLowerCase()
  return popularOrigins.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm) || city.code.toLowerCase().includes(searchTerm),
  )
})

const toSuggestions = computed(() => {
  if (!toInput.value) return []
  const searchTerm = toInput.value.toLowerCase()
  return popularDestinations.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm) || city.code.toLowerCase().includes(searchTerm),
  )
})

// Obsługa wyboru podpowiedzi
const selectFromSuggestion = (suggestion: { code: string; name: string }) => {
  fromInput.value = `${suggestion.name} (${suggestion.code})`
  showFromSuggestions.value = false
}

const selectToSuggestion = (suggestion: { code: string; name: string }) => {
  toInput.value = `${suggestion.name} (${suggestion.code})`
  showToSuggestions.value = false
}

// Obsługa zdarzenia utraty fokusu
const hideFromSuggestions = () => {
  setTimeout(() => {
    showFromSuggestions.value = false
  }, 200)
}

const hideToSuggestions = () => {
  setTimeout(() => {
    showToSuggestions.value = false
  }, 200)
}

// Zarządzanie liczbą pasażerów
const incrementPassengers = () => {
  if (passengers.value < 9) passengers.value++
}

const decrementPassengers = () => {
  if (passengers.value > 1) passengers.value--
}

// System notyfikacji
const notification = ref({
  show: false,
  message: '',
  type: 'error',
})

// Funkcja do pokazywania notyfikacji
const showNotification = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
  notification.value = {
    show: true,
    message,
    type,
  }

  // Automatyczne ukrycie po 4 sekundach
  setTimeout(() => {
    notification.value.show = false
  }, 4000)
}

// Funkcja do ukrywania notyfikacji
const hideNotification = () => {
  notification.value.show = false
}

// Funkcjonalność wyszukiwania
const emit = defineEmits(['search'])

const isSearching = ref(false)

const handleSearch = () => {
  if (
    !fromInput.value ||
    !toInput.value ||
    !departDate.value ||
    (tripType.value === 'roundtrip' && !returnDate.value)
  ) {
    showNotification('Proszę wypełnić wszystkie wymagane pola', 'warning')
    return
  }

  // Walidacja dat
  if (tripType.value === 'roundtrip' && returnDate.value && departDate.value) {
    const departureDate = new Date(departDate.value)
    const returnDateObj = new Date(returnDate.value)

    if (returnDateObj < departureDate) {
      showNotification('Data powrotu nie może być wcześniejsza niż data wylotu', 'error')
      return
    }
  }

  // Rozpocznij loading
  isSearching.value = true

  emit('search', {
    from: fromInput.value,
    to: toInput.value,
    departDate: departDate.value,
    returnDate: tripType.value === 'roundtrip' ? returnDate.value : null,
    passengers: passengers.value,
    tripType: tripType.value,
  })

  // Symulacja czasu wyszukiwania - w rzeczywistości zakończy się po otrzymaniu odpowiedzi
  setTimeout(() => {
    isSearching.value = false
  }, 2000)
}

// Dzisiejsza data do ograniczenia minimalnej wartości
const today = new Date().toISOString().split('T')[0]

// Referencje do ukrytych inputów kalendarza
const departDateInput = ref<HTMLInputElement>()
const returnDateInput = ref<HTMLInputElement>()

// Funkcja do określenia optymalnej pozycji kalendarza
const getOptimalCalendarPosition = () => {
  const screenWidth = window.innerWidth

  if (screenWidth < 768) {
    // Małe ekrany
    return 'inset-0 opacity-0 pointer-events-none'
  } else {
    // Większe ekrany
    return 'left-4 top-1/2 transform -translate-y-1/2 opacity-0 pointer-events-none w-0 h-0 z-0'
  }
}

// Reaktywna pozycja kalendarza
const calendarPosition = ref(getOptimalCalendarPosition())

// Nasłuchiwanie zmiany rozmiaru okna
const updateCalendarPosition = () => {
  calendarPosition.value = getOptimalCalendarPosition()
}

// Dodaj event listener w onMounted
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  window.addEventListener('resize', updateCalendarPosition)
  updateCalendarPosition()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCalendarPosition)
})

// Funkcje otwierania kalendarzy
const openDepartCalendar = () => {
  if (departDateInput.value) {
    // Zaktualizuj pozycję przed otwarciem
    updateCalendarPosition()
    departDateInput.value.showPicker()
  }
}

const openReturnCalendar = () => {
  if (returnDateInput.value) {
    // Zaktualizuj pozycję przed otwarciem
    updateCalendarPosition()
    returnDateInput.value.showPicker()
  }
}

// Formatowanie daty do wyświetlenia
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  return date.toLocaleDateString('pl-PL', options)
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
              ></i>
            </div>
            <div class="ml-2 sm:ml-3 flex-1 pt-0.5">
              <p class="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                {{ notification.message }}
              </p>
            </div>
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
          @focus="showFromSuggestions = true"
          @blur="hideFromSuggestions"
          aria-label="Miejsce wylotu"
          aria-describedby="fromHint"
        />
        <p id="fromHint" class="sr-only">Wprowadź nazwę miasta lub kod lotniska</p>
        <div
          v-if="showFromSuggestions && fromSuggestions.length > 0"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden"
          role="listbox"
          aria-label="Sugestie miejsc wylotu"
        >
          <ul class="max-h-60 overflow-auto">
            <li
              v-for="suggestion in fromSuggestions"
              :key="suggestion.code"
              @mousedown="selectFromSuggestion(suggestion)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer focus-within:bg-primary-50"
              role="option"
              tabindex="0"
              @keydown.enter="selectFromSuggestion(suggestion)"
            >
              {{ suggestion.name }} ({{ suggestion.code }})
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
          @focus="showToSuggestions = true"
          @blur="hideToSuggestions"
          aria-label="Miejsce przylotu"
          aria-describedby="toHint"
        />
        <p id="toHint" class="sr-only">Wprowadź nazwę miasta lub kod lotniska</p>
        <div
          v-if="showToSuggestions && toSuggestions.length > 0"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden"
          role="listbox"
          aria-label="Sugestie miejsc przylotu"
        >
          <ul class="max-h-60 overflow-auto">
            <li
              v-for="suggestion in toSuggestions"
              :key="suggestion.code"
              @mousedown="selectToSuggestion(suggestion)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer focus-within:bg-primary-50"
              role="option"
              tabindex="0"
              @keydown.enter="selectToSuggestion(suggestion)"
            >
              {{ suggestion.name }} ({{ suggestion.code }})
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
          >
            <span :class="departDate ? 'text-gray-900' : 'text-gray-500'">
              {{ departDate ? formatDisplayDate(departDate) : 'Wybierz datę wylotu' }}
            </span>
            <i class="fas fa-calendar-alt text-gray-400"></i>
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
          >
            <span :class="returnDate ? 'text-gray-900' : 'text-gray-500'">
              {{ returnDate ? formatDisplayDate(returnDate) : 'Wybierz datę powrotu' }}
            </span>
            <i class="fas fa-calendar-alt text-gray-400"></i>
          </button>
        </div>
      </div>

      <!-- Pasażerowie (widoczne gdy w jedną stronę lub w widoku mobilnym) -->
      <div v-if="tripType === 'oneway' || true" class="md:col-span-2 lg:col-span-1">
        <label for="passengers" class="block text-sm font-medium text-gray-700 mb-1"
          >Pasażerowie</label
        >
        <div
          class="flex border border-gray-300 rounded-md overflow-hidden transition-all hover:border-gray-400 focus-within:border-primary-500"
        >
          <button
            @click="decrementPassengers"
            type="button"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors cursor-pointer"
            :disabled="passengers <= 1"
            aria-label="Zmniejsz liczbę pasażerów"
          >
            <span class="sr-only">Zmniejsz liczbę pasażerów</span>
            <i class="fas fa-minus text-gray-600" aria-hidden="true"></i>
          </button>
          <div class="flex-1 flex items-center justify-center" aria-live="polite">
            <span>{{ passengers }}</span>
            <span class="sr-only">{{ passengers === 1 ? 'pasażer' : 'pasażerów' }}</span>
          </div>
          <button
            @click="incrementPassengers"
            type="button"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors cursor-pointer"
            :disabled="passengers >= 9"
            aria-label="Zwiększ liczbę pasażerów"
          >
            <span class="sr-only">Zwiększ liczbę pasażerów</span>
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
      >
        <span v-if="!isSearching">Szukaj lotów</span>
        <span v-else class="flex items-center">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          Szukam...
        </span>
      </AnimatedButton>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter, .fade-leave-to {
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
</style>
