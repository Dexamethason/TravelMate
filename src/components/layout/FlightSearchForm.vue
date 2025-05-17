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
    city => city.name.toLowerCase().includes(searchTerm) || 
            city.code.toLowerCase().includes(searchTerm)
  )
})

const toSuggestions = computed(() => {
  if (!toInput.value) return []
  const searchTerm = toInput.value.toLowerCase()
  return popularDestinations.filter(
    city => city.name.toLowerCase().includes(searchTerm) || 
            city.code.toLowerCase().includes(searchTerm)
  )
})

// Obsługa wyboru podpowiedzi
const selectFromSuggestion = (suggestion: { code: string, name: string }) => {
  fromInput.value = `${suggestion.name} (${suggestion.code})`
  showFromSuggestions.value = false
}

const selectToSuggestion = (suggestion: { code: string, name: string }) => {
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

// Funkcjonalność wyszukiwania
const emit = defineEmits(['search'])

const handleSearch = () => {
  if (!fromInput.value || !toInput.value || !departDate.value || (tripType.value === 'roundtrip' && !returnDate.value)) {
    alert('Proszę wypełnić wszystkie wymagane pola')
    return
  }
  
  emit('search', {
    from: fromInput.value,
    to: toInput.value,
    departDate: departDate.value,
    returnDate: tripType.value === 'roundtrip' ? returnDate.value : null,
    passengers: passengers.value,
    tripType: tripType.value
  })
}

// Dzisiejsza data do ograniczenia minimalnej wartości
const today = new Date().toISOString().split('T')[0]
</script>

<template>  
  <div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">      <!-- Selektor typu podróży z nowocześniejszym wyglądem -->
    <div class="mb-6 sm:mb-8" role="radiogroup" aria-labelledby="tripTypeLabel">
      <h3 id="tripTypeLabel" class="text-sm font-medium text-gray-700 pb-5">Typ podróży</h3>
      <div class="flex flex-wrap bg-gray-100 p-1 rounded-lg shadow-sm">
        <!-- Opcja w obie strony -->
        <label 
          class="flex-1 min-w-[120px] relative cursor-pointer"
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
          >          <span 
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-center transition-all"
            :class="tripType === 'roundtrip' ? 'bg-white font-medium text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
            </svg>
            <span id="roundtripLabel">W obie strony</span>
          </span>
        </label>
        
        <!-- Opcja w jedną stronę -->
        <label 
          class="flex-1 min-w-[120px] relative cursor-pointer"
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
          >          <span 
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-center transition-all"
            :class="tripType === 'oneway' ? 'bg-white font-medium text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span id="onewayLabel">W jedną stronę</span>
          </span>
        </label>
      </div>
    </div>
    
    <!-- Formularz wyszukiwania -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 mb-6">
      <!-- Miejsce wylotu -->
      <div class="relative">
        <label for="from" class="block text-sm font-medium text-gray-700 mt-5 mb-1">Z</label>          <input
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
        <label for="to" class="block text-sm font-medium text-gray-700 mb-1">Do</label>        <input
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
        <label for="departDate" class="block text-sm font-medium text-gray-700 mb-1">Data wylotu</label>        <input
          type="date"
          id="departDate"
          v-model="departDate"
          :min="today"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 transition-all"
          aria-label="Data wylotu"
        />
      </div>      
      
      <!-- Data powrotu (warunkowa) -->
      <div v-if="tripType === 'roundtrip'">
        <label for="returnDate" class="block text-sm font-medium text-gray-700 mb-1">Data powrotu</label>        <input
          type="date"
          id="returnDate"
          v-model="returnDate"
          :min="departDate || today"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 transition-all"
          :disabled="!departDate"
          aria-label="Data powrotu"
          aria-describedby="returnDateHint"
        />
        <p id="returnDateHint" class="sr-only">Wybierz datę powrotu, najpierw musisz wybrać datę wylotu</p>
      </div>      
      
      <!-- Pasażerowie (widoczne gdy w jedną stronę lub w widoku mobilnym) -->
      <div v-if="tripType === 'oneway' || true" class="md:col-span-2 lg:col-span-1">
        <label for="passengers" class="block text-sm font-medium text-gray-700 mb-1">Pasażerowie</label>
        <div class="flex border border-gray-300 rounded-md overflow-hidden transition-all hover:border-gray-400 focus-within:border-primary-500">
          <button 
            @click="decrementPassengers"
            type="button"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors"
            :disabled="passengers <= 1"
            aria-label="Zmniejsz liczbę pasażerów"
          >
            <span class="sr-only">Zmniejsz liczbę pasażerów</span>
            <span aria-hidden="true">-</span>
          </button>
          <div class="flex-1 flex items-center justify-center" aria-live="polite">
            <span>{{ passengers }}</span>
            <span class="sr-only">{{ passengers === 1 ? 'pasażer' : 'pasażerów' }}</span>
          </div>
          <button
            @click="incrementPassengers"
            type="button"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors"
            :disabled="passengers >= 9"
            aria-label="Zwiększ liczbę pasażerów"
          >
            <span class="sr-only">Zwiększ liczbę pasażerów</span>
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">Maksymalnie 9 pasażerów</p>
      </div>    
    </div>    
    
    <!-- Przycisk wyszukiwania -->
    <div class="flex justify-center p-4 sm:p-8" >
      <AnimatedButton 
        variant="primary" 
        class="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
        @click="handleSearch"
      >
        Szukaj lotów
      </AnimatedButton>
    </div>
  </div>
</template>
