<script setup lang="ts">
import { ref, computed } from 'vue'

// Właściwości filtra
const props = defineProps({
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  maxDuration: { type: Number, required: true }, 
})

const priceRange = ref([props.minPrice, props.maxPrice])

const durationRange = ref(props.maxDuration)

const stopFilters = ref({
  direct: true,
  oneStop: true,
  multiStop: true
})

// docelowo zrobić dynamiczne
const airlines = ref([
  { name: 'LOT Polish Airlines', code: 'LO', checked: true },
  { name: 'Ryanair', code: 'FR', checked: true },
  { name: 'Wizz Air', code: 'W6', checked: true },
  { name: 'Lufthansa', code: 'LH', checked: true },
  { name: 'KLM', code: 'KL', checked: true }
])

// Formatowanie czasu
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Formatowanie ceny
const formatPrice = (price: number) => {
  return `${price} PLN`
}

// Wybrane linie 
const selectedAirlines = computed(() => {
  return airlines.value
    .filter(airline => airline.checked)
    .map(airline => airline.code)
})

const emit = defineEmits(['filter-change'])

// Gdy dowolny filtr się zmienia, emituj zmianę
const emitFilterChange = () => {
  emit('filter-change', {
    priceRange: priceRange.value,
    durationMax: durationRange.value,
    stops: {
      direct: stopFilters.value.direct,
      oneStop: stopFilters.value.oneStop,
      multiStop: stopFilters.value.multiStop
    },
    airlines: selectedAirlines.value
  })
}

// Obserwuj zmiany w filtrach
const watchFilters = () => {
  emitFilterChange()
}

// Metody dla wyświetlania suwaka zakresu
const getPriceThumbPosition = (index: number) => {
  const range = props.maxPrice - props.minPrice
  const value = priceRange.value[index] - props.minPrice
  return (value / range) * 100
}

const getPriceRangeStyle = () => {
  const start = getPriceThumbPosition(0)
  const end = getPriceThumbPosition(1)
  return {
    left: `${start}%`,
    width: `${end - start}%`
  }
}

const getDurationRangeStyle = () => {
  const percentage = (durationRange.value / props.maxDuration) * 100
  return {
    width: `${percentage}%`
  }
}

// Poprawione funkcje wyświetlania kciuka suwaka z lepszym pozycjonowaniem
const getPriceThumbLeftStyle = () => {
  return { left: `calc(${getPriceThumbPosition(0)}% - 12px)`, top: '-7px', zIndex: 20 }
}

const getPriceThumbRightStyle = () => {
  return { left: `calc(${getPriceThumbPosition(1)}% - 12px)`, top: '-7px', zIndex: 20 }
}

const getDurationThumbStyle = () => {
  return { left: `calc(${(durationRange.value / props.maxDuration) * 100}% - 12px)`, top: '-7px', zIndex: 10 }
}

// Oblicz kolory aktywnego toru
const getPriceTrackColor = () => {
  const percent = getPriceThumbPosition(1) - getPriceThumbPosition(0)
  // Zwróć mocniejsze kolory dla szerszych zakresów
  return {
    background: `linear-gradient(to right, #10B981, #059669 ${percent}%)`
  }
}

// Oblicz kolor toru czasu trwania
const getDurationTrackColor = () => {
  const percent = (durationRange.value / props.maxDuration) * 100
  return {
    background: `linear-gradient(to right, #10B981, #059669 ${percent}%)`
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
    <h3 class="text-lg font-semibold p-2 mb-4 sm:mb-6 flex items-center space-x-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
      </svg>
      <span>Filtry</span>
    </h3>
      <!-- Filtr ceny -->
    <div class="mb-8 sm:mb-10">
      <h4 class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-2" id="priceRangeLabel">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
        </svg>
        <span>Cena</span>
      </h4>
        <div class="p-2">
        <!-- Nowoczesny design suwaka zakresu cen -->
        <div class="bg-gray-50 rounded-xl p-4 shadow-inner">
          <!-- Wartości zakresu z ulepszonym wyświetlaniem -->
          <div class="flex justify-between pb-6">
            <div class="bg-white px-3 py-1.5 rounded-md shadow-sm ring-1 ring-gray-200">
              <span class="text-sm font-medium text-primary-700">{{ formatPrice(priceRange[0]) }}</span>
            </div>
            <div class="bg-white px-3 py-1.5 rounded-md shadow-sm ring-1 ring-gray-200">
              <span class="text-sm font-medium text-primary-700">{{ formatPrice(priceRange[1]) }}</span>
            </div>
          </div>
          
          <!-- Suwak zakresu z ulepszonymi elementami wizualnymi oraz dostępnością -->
          <div 
            class="relative h-2 bg-gray-200 rounded-full mb-6"
            role="group" 
            aria-labelledby="priceRangeLabel"
          >
            <div class="sr-only">Zakres ceny od {{ formatPrice(priceRange[0]) }} do {{ formatPrice(priceRange[1]) }}</div>
            
            <!-- Zaznaczenie zakresu z gradientem -->
            <div 
              class="absolute h-2 rounded-full bg-gradient-to-r from-green-500 to-green-700"
              :style="getPriceRangeStyle()"
            ></div>
            
            <!-- Lewy suwak -->
            <div 
              class="absolute w-6 h-6 bg-white rounded-full shadow-md cursor-move z-20"
              :style="getPriceThumbLeftStyle()"
            ></div>

            <!-- Prawy suwak -->
            <div 
              class="absolute w-6 h-6 bg-white rounded-full shadow-md cursor-move z-20"
              :style="getPriceThumbRightStyle()"
            ></div>

            <!-- Inputy suwaka -->
            <input 
              type="range" 
              :min="minPrice" 
              :max="maxPrice" 
              v-model.number="priceRange[0]" 
              class="absolute w-full h-2 opacity-0 cursor-pointer z-30"
              @input="watchFilters"
            />
            <input 
              type="range" 
              :min="minPrice" 
              :max="maxPrice" 
              v-model.number="priceRange[1]" 
              class="absolute w-full h-2 opacity-0 cursor-pointer z-30"
              @input="watchFilters"
            />
          </div>
        </div>
      </div>    </div>      <!-- Filtr przesiadek -->
    <div class="mb-8 sm:mb-10">
      <h4 class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-2" id="stopFiltersHeading">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
        </svg>
        <span>Przesiadki</span>
      </h4>
        <div class="p-2" role="group" aria-labelledby="stopFiltersHeading">
        <!-- Karta opcji z ulepszoną stylistyką -->
        <div class="bg-gray-50 rounded-xl p-4 shadow-inner">
          <div class="space-y-3">
            <label class="flex items-center justify-between cursor-pointer group p-2 rounded-lg transition-all hover:bg-white hover:shadow-sm">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-800 font-medium">Bez przesiadek</span>
              </div>
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  v-model="stopFilters.direct" 
                  @change="watchFilters"
                  class="peer sr-only"
                  id="stopFilterDirect"
                  aria-label="Bez przesiadek"
                />
                <div 
                  class="w-10 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500" 
                ></div>
              </div>
            </label>
            
            <label class="flex items-center justify-between cursor-pointer group p-2 rounded-lg transition-all hover:bg-white hover:shadow-sm">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-800 font-medium">1 przesiadka</span>
              </div>
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  v-model="stopFilters.oneStop" 
                  @change="watchFilters"
                  class="peer sr-only"
                  id="stopFilterOneStop"
                  aria-label="1 przesiadka"
                />
                <div 
                  class="w-10 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500" 
                ></div>
              </div>
            </label>
            
            <label class="flex items-center justify-between cursor-pointer group p-2 rounded-lg transition-all hover:bg-white hover:shadow-sm">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-800 font-medium">2+ przesiadek</span>
              </div>
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  v-model="stopFilters.multiStop" 
                  @change="watchFilters"
                  class="peer sr-only"
                  id="stopFilterMultiStop"
                  aria-label="2+ przesiadki"
                />
                <div 
                  class="w-10 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500" 
                ></div>
              </div>
            </label>
          </div>
        </div>
      </div></div>      <!-- Filtr czasu trwania -->
    <div class="mb-8 sm:mb-10">
      <h4 class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-2" id="durationRangeLabel">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        <span>Czas podróży</span>
      </h4>
        <div class="p-2">
        <!-- Nowoczesny design suwaka czasu trwania -->
        <div class="bg-gray-50 rounded-xl p-4 shadow-inner">
          <!-- Wartość z ulepszonym wyświetlaniem -->
          <div class="flex justify-center pb-5">
            <div class="bg-white px-4 py-2 rounded-lg shadow-sm ring-1 ring-gray-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium text-primary-700">{{ formatDuration(durationRange) }}</span>
            </div>
          </div>
          
          <!-- Suwak czasu z ulepszoną stylistyką wizualną i dostępnością -->
          <div 
            class="relative h-2 bg-gray-200 rounded-full mb-10"
            role="slider"
            aria-labelledby="durationRangeLabel"
            :aria-valuemin="60"
            :aria-valuemax="maxDuration"
            :aria-valuenow="durationRange"
            :aria-valuetext="formatDuration(durationRange)"
          >
            <!-- Zaznaczenie zakresu z gradientem -->
            <div 
              class="absolute h-2 rounded-full" 
              :style="[getDurationRangeStyle(), getDurationTrackColor()]"
              aria-hidden="true"
            ></div>
            
            <!-- Skala czasu pod suwakiem -->
            <div class="absolute bottom-5 left-0 right-0 flex justify-between mt-2">
              <span class="text-xs text-gray-500">{{ formatDuration(60) }}</span>
              <span class="text-xs text-gray-500">{{ formatDuration(maxDuration) }}</span>
            </div>
            
            <!-- Ulepszony element suwaka z animacją -->
            <div 
              class="absolute w-6 h-6 flex items-center justify-center z-10 cursor-pointer touch-manipulation transform hover:scale-110 transition-transform"
              :style="getDurationThumbStyle()"
              aria-hidden="true"
            >
              <div class="w-5 h-5 bg-white rounded-full shadow-md border-primary-500 transition-all"></div>
            </div>
            
            <!-- Dostępny input -->
            <input 
              type="range" 
              :min="60" 
              :max="maxDuration" 
              v-model.number="durationRange" 
              @input="watchFilters"
              class="absolute w-full h-6 opacity-0 cursor-pointer z-20 touch-manipulation"
              aria-label="Maksymalny czas podróży"
            />
          </div>
          
          <p class="text-xs text-gray-600 text-center pt-5">
            Przesuń suwak, aby dostosować maksymalny czas lotu
          </p>
        </div>
      </div>    </div>      <!-- Filtr linii lotniczych z ulepszonym stylem wizualnym -->
    <div>
      <h4 class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-2" id="airlinesFilterHeading">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.725-.962l-5-1.429a1 1 0 01.725-.962l5-1.429a1 1 0 00.725-.962V3.4a1.5 1.5 0 00-2.5-1.1l.5.6a1 1 0 01.5 1.1v2.8a1 1 0 01-.725.962l-5 1.429a1 1 0 00-.725.962v3.143a1 1 0 01-.5.866l-5-1.429A1 1 0 010 15l7 14a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.429A1 1 0 009 15.571v4.143a1 1 0 00.788.962l5 1.429a1 1 0 001.169-1.409l-7-14z" />
        </svg>
        <span>Linie lotnicze</span>
      </h4>
      
      <div class="space-y-4 max-h-120 overflow-y-auto p-2" role="group" aria-labelledby="airlinesFilterHeading">
        <!-- Dodano tło dla sekcji filtrów linii lotniczych -->
        <div class="bg-gray-50 rounded-xl p-4 shadow-inner">
          <div class="space-y-3">
            <label 
              v-for="airline in airlines" 
              :key="airline.code"
              class="flex items-center justify-between cursor-pointer group p-2 rounded-lg transition-all hover:bg-white hover:shadow-sm"
              :for="`airline-${airline.code}`"
            >
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.725-.962l-5-1.429a1 1 0 01.725-.962l5-1.429a1 1 0 00.725-.962V3.4a1.5 1.5 0 00-2.5-1.1l.5.6a1 1 0 01.5 1.1v2.8a1 1 0 01-.725.962l-5 1.429a1 1 0 00-.725.962v3.143a1 1 0 01-.5.866l-5-1.429A1 1 0 010 15l7 14a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.429A1 1 0 009 15.571v4.143a1 1 0 00.788.962l5 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
                <span class="text-gray-800 font-medium">{{ airline.name }}</span>
              </div>
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  v-model="airline.checked" 
                  @change="watchFilters"
                  class="peer sr-only"
                  :id="`airline-${airline.code}`"
                  :aria-label="`${airline.name} (${airline.code})`"
                />
                <div 
                  class="w-10 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500" 
                ></div>
              </div>
            </label>
          </div>
        </div>
        
        <div v-if="airlines.length === 0" class="text-gray-500 py-2 text-center">
          Brak dostępnych linii lotniczych
        </div>
      </div>
    </div>
  </div>
</template>
