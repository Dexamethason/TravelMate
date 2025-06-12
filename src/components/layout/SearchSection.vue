<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'

const checkInInput = ref<HTMLInputElement | null>(null)
const checkOutInput = ref<HTMLInputElement | null>(null)
const checkInDate = ref('')
const checkOutDate = ref('')

// Dzisiejsza data do ograniczenia minimalnej wartości
const today = new Date().toISOString().split('T')[0]

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
const selectedGuests = ref('2 osoby, 1 łóżko')

const openGuestsPicker = () => {
  if (guestsInput.value) {
    guestsInput.value.click()
  }
}

const guestOptions = [
  '1 osoba, 1 łóżko',
  '2 osoby, 1 łóżko',
  '2 osoby, 2 łóżka',
  '3 osoby, 2 łóżka',
  '3 osoby, 3 łóżka',
  '4 osoby, 2 łóżka',
  '4 osoby, 3 łóżka',
  '4 osoby, 4 łóżka'
]
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
        <div class="flex flex-col">
          <span class="text-sm text-gray-600 mb-1">Lokalizacja</span>
          <div 
            class="relative w-full text-left bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors cursor-pointer"
          >
            <input
              type="text"
              placeholder="Gdzie chcesz nocować?"
              class="w-full bg-transparent text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-0"
            />
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
          <AnimatedButton class="px-8 py-3">Szukaj</AnimatedButton>
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
