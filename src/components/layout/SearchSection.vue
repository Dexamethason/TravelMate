<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

const checkInInput = ref<HTMLInputElement | null>(null)
const checkOutInput = ref<HTMLInputElement | null>(null)
const checkInDate = ref('')
const checkOutDate = ref('')

// Lokalizacja input i dropdown
const locationInput = ref('')
const showLocationSuggestions = ref(false)

// Dzisiejsza data do ograniczenia minimalnej wartości
const today = new Date().toISOString().split('T')[0]

// Popularne lokalizacje hotelowe (kody miast IATA)
const popularLocations = [
  { code: 'WAW', name: 'Warszawa' },
  { code: 'KRK', name: 'Kraków' },
  { code: 'GDN', name: 'Gdańsk' },
  { code: 'WRO', name: 'Wrocław' },
  { code: 'POZ', name: 'Poznań' },
  { code: 'KTW', name: 'Katowice' },
  { code: 'BCN', name: 'Barcelona' },
  { code: 'ROM', name: 'Rzym' },
  { code: 'PAR', name: 'Paryż' },
  { code: 'LON', name: 'Londyn' },
  { code: 'BER', name: 'Berlin' },
  { code: 'VIE', name: 'Wiedeń' },
  { code: 'PRA', name: 'Praga' },
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'MAD', name: 'Madryt' },
  { code: 'LIS', name: 'Lizbona' },
  { code: 'ATH', name: 'Ateny' },
  { code: 'IST', name: 'Stambuł' },
  { code: 'DXB', name: 'Dubaj' },
  { code: 'NYC', name: 'Nowy Jork' },
  { code: 'TYO', name: 'Tokio' },
  { code: 'BKK', name: 'Bangkok' },
  { code: 'SIN', name: 'Singapur' },
]

// Filtrowane podpowiedzi lokalizacji
const locationSuggestions = computed(() => {
  if (!locationInput.value) return []
  const searchTerm = locationInput.value.toLowerCase()
  return popularLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm) || 
      location.code.toLowerCase().includes(searchTerm)
  )
})

// Obsługa wyboru lokalizacji
const selectLocationSuggestion = (suggestion: { code: string; name: string }) => {
  locationInput.value = `${suggestion.name} (${suggestion.code})`
  showLocationSuggestions.value = false
}

// Obsługa ukrycia podpowiedzi lokalizacji
const hideLocationSuggestions = () => {
  setTimeout(() => {
    showLocationSuggestions.value = false
  }, 200)
}

// Funkcja do określenia optymalnej pozycji kalendarza
const getOptimalCalendarPosition = () => {
  const screenWidth = window.innerWidth
  if (screenWidth < 768) {
    return 'inset-0 opacity-0 pointer-events-none'
  } else {
    return 'left-4 top-1/2 transform -translate-y-1/2 opacity-0 pointer-events-none w-0 h-0 z-0'
  }
}

const calendarPosition = ref(getOptimalCalendarPosition())

// Nasłuchiwanie zmiany rozmiaru okna
const updateCalendarPosition = () => {
  calendarPosition.value = getOptimalCalendarPosition()
}

onMounted(() => {
  window.addEventListener('resize', updateCalendarPosition)
  updateCalendarPosition()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCalendarPosition)
})

// Funkcje otwierania kalendarzy
const openDatePicker = (type: 'checkIn' | 'checkOut') => {
  updateCalendarPosition()
  if (type === 'checkIn' && checkInInput.value) {
    checkInInput.value.showPicker()
  } else if (type === 'checkOut' && checkOutInput.value) {
    checkOutInput.value.showPicker()
  }
}

// Formatowanie daty
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
  return date.toLocaleDateString('pl-PL', options)
}

const guestsInput = ref<HTMLSelectElement | null>(null)
const selectedGuests = ref('2')

const openGuestsPicker = () => {
  if (guestsInput.value) {
    guestsInput.value.click()
  }
}

const guestOptions = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8+'
]

// Funkcjonalność wyszukiwania
const emit = defineEmits(['search'])

const isSearching = ref(false)

const handleSearch = () => {
  if (!locationInput.value || !checkInDate.value || !checkOutDate.value) {
    alert('Proszę wypełnić wszystkie pola')
    return
  }

  // Walidacja dat
  const checkInDateObj = new Date(checkInDate.value)
  const checkOutDateObj = new Date(checkOutDate.value)
  
  if (checkOutDateObj <= checkInDateObj) {
    alert('Data wymeldowania musi być późniejsza niż data zameldowania')
    return
  }

  // Wyciągnij kod miasta z inputa (np. "Warszawa (WAW)" -> "WAW")
  const cityCodeMatch = locationInput.value.match(/\(([^)]+)\)/)
  const cityCode = cityCodeMatch ? cityCodeMatch[1] : locationInput.value

  isSearching.value = true

  emit('search', {
    cityCode,
    checkIn: checkInDate.value,
    checkOut: checkOutDate.value,
    guests: selectedGuests.value
  })

  // Zatrzymaj loading po 2 sekundach
  setTimeout(() => {
    isSearching.value = false
  }, 2000)
}
</script>

<template>
  <section class="py-12 bg-white -mt-24 relative z-10">
    <!-- Marketing text container with improved spacing -->
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

    <!-- Search form container with improved spacing -->
    <div class="container mx-auto px-4">
      <form class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <!-- lokalizacja -->
        <div class="flex flex-col relative">
          <span class="text-sm text-gray-600 mb-1">Lokalizacja</span>
          <input
            type="text"
            v-model="locationInput"
            placeholder="Gdzie chcesz nocować?"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 transition-all bg-gray-50"
            @focus="showLocationSuggestions = true"
            @blur="hideLocationSuggestions"
            aria-label="Lokalizacja"
          />
          <div
            v-if="showLocationSuggestions && locationSuggestions.length > 0"
            class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden top-full"
            role="listbox"
            aria-label="Sugestie lokalizacji"
          >
            <ul class="max-h-60 overflow-auto">
              <li
                v-for="suggestion in locationSuggestions"
                :key="suggestion.code"
                @mousedown="selectLocationSuggestion(suggestion)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer focus-within:bg-primary-50"
                role="option"
                tabindex="0"
                @keydown.enter="selectLocationSuggestion(suggestion)"
              >
                {{ suggestion.name }} ({{ suggestion.code }})
              </li>
            </ul>
          </div>
        </div>

        <!-- daty with improved gap -->
        <div class="col-span-2 grid grid-cols-2 gap-3">
          <!-- zameldowanie -->
          <div class="flex flex-col">
            <span class="text-sm text-gray-600 mb-1">Zameldowanie</span>
            <div class="relative">
              <!-- Ukryty input kalendarza -->
              <input
                ref="checkInInput"
                type="date"
                v-model="checkInDate"
                :min="today"
                :class="`absolute ${calendarPosition}`"
                aria-hidden="true"
              />
              <!-- Widoczny przycisk -->
              <button
                type="button"
                @click="openDatePicker('checkIn')"
                class="w-full px-4 py-2 border border-gray-300 rounded-md text-left bg-gray-50 hover:border-gray-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span :class="checkInDate ? 'text-gray-900' : 'text-gray-500'">
                  {{ checkInDate ? formatDisplayDate(checkInDate) : 'Wybierz datę' }}
                </span>
                <i class="fas fa-calendar-alt text-gray-400"></i>
              </button>
            </div>
          </div>

          <!-- wymeldowanie -->
          <div class="flex flex-col">
            <span class="text-sm text-gray-600 mb-1">Wymeldowanie</span>
            <div class="relative">
              <!-- Ukryty input kalendarza -->
              <input
                ref="checkOutInput"
                type="date"
                v-model="checkOutDate"
                :min="checkInDate || today"
                :class="`absolute ${calendarPosition}`"
                aria-hidden="true"
              />
              <!-- Widoczny przycisk -->
              <button
                type="button"
                @click="openDatePicker('checkOut')"
                class="w-full px-4 py-2 border border-gray-300 rounded-md text-left bg-gray-50 hover:border-gray-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span :class="checkOutDate ? 'text-gray-900' : 'text-gray-500'">
                  {{ checkOutDate ? formatDisplayDate(checkOutDate) : 'Wybierz datę' }}
                </span>
                <i class="fas fa-calendar-alt text-gray-400"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- goscie -->
        <div class="flex flex-col">
          <span class="text-sm text-gray-600 mb-1">Liczba gości</span>
          <div 
            class="relative w-full text-left bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors cursor-pointer"
            @click="openGuestsPicker"
          >
            <select
              ref="guestsInput"
              v-model="selectedGuests"
              class="w-full bg-transparent text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-0 appearance-none"
            >
              <option 
                v-for="option in guestOptions" 
                :key="option" 
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>
        </div>

        <!-- search button with improved spacing -->
        <div class="md:col-span-4 flex justify-center mt-6">
          <AnimatedButton 
            class="px-8 py-3"
            :disabled="isSearching"
            @click="handleSearch"
          >
            <span v-if="!isSearching">Szukaj</span>
            <span v-else class="flex items-center">
              <i class="fas fa-spinner fa-spin mr-2"></i>
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
input[type="date"]::-webkit-datetime-edit {
  opacity: 0;
}

/* Pokaż ikonę kalendarza */
input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 1;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

/* Styl dla inputa */
input[type="date"] {
  min-height: 24px;
}
</style>
