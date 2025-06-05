<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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
  multiStop: true,
})

// Docelowo zrobić dynamiczne
const airlines = ref([
  { name: 'LOT Polish Airlines', code: 'LO', checked: true },
  { name: 'Ryanair', code: 'FR', checked: true },
  { name: 'Wizz Air', code: 'W6', checked: true },
  { name: 'Lufthansa', code: 'LH', checked: true },
  { name: 'KLM', code: 'KL', checked: true },
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
  return airlines.value.filter((airline) => airline.checked).map((airline) => airline.code)
})

const emit = defineEmits(['filter-change'])

// Debounced emit dla wydajności - opóźniona emisja filtrów
let emitTimeout: ReturnType<typeof setTimeout> | null = null

const emitFilterChange = () => {
  // Anuluj poprzedni timeout
  if (emitTimeout) {
    clearTimeout(emitTimeout)
  }

  // Ustaw nowy timeout - emit po 100ms bez zmian
  emitTimeout = setTimeout(() => {
    emit('filter-change', {
      priceRange: priceRange.value,
      durationMax: durationRange.value,
      stops: {
        direct: stopFilters.value.direct,
        oneStop: stopFilters.value.oneStop,
        multiStop: stopFilters.value.multiStop,
      },
      airlines: selectedAirlines.value,
    })
  }, 100)
}

// Natychmiastowa aktualizacja UI
const watchFilters = () => {
  emitFilterChange()
}

// Obsługa suwaka czasu
const updateDuration = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = parseInt(target.value)

  // Natychmiastowa aktualizacja wartości dla responsywności UI
  durationRange.value = newValue

  // Natymiastowy emit bez debounce dla suwaka czasu
  emit('filter-change', {
    priceRange: priceRange.value,
    durationMax: durationRange.value,
    stops: {
      direct: stopFilters.value.direct,
      oneStop: stopFilters.value.oneStop,
      multiStop: stopFilters.value.multiStop,
    },
    airlines: selectedAirlines.value,
  })
}

// Stan aktywnego suwaka (tylko dla suwaka ceny)
const activeSlider = ref<'min' | 'max' | null>(null)

// Poprawione metody dla suwaka ceny - z wykrywaniem pozycji kliknięcia
const handleSliderInteraction = (event: MouseEvent | TouchEvent) => {
  const slider = event.currentTarget as HTMLElement
  const rect = slider.getBoundingClientRect()

  // Oblicz pozycję kliknięcia jako procent
  let clientX: number
  if (event instanceof MouseEvent) {
    clientX = event.clientX
  } else {
    clientX = event.touches[0].clientX
  }

  const clickPosition = (clientX - rect.left) / rect.width

  // Oblicz pozycje kciuków jako procenty
  const minPosition = getPriceThumbPosition(0) / 100
  const maxPosition = getPriceThumbPosition(1) / 100

  // Określ, który suwak jest bliżej
  const distanceToMin = Math.abs(clickPosition - minPosition)
  const distanceToMax = Math.abs(clickPosition - maxPosition)

  activeSlider.value = distanceToMin < distanceToMax ? 'min' : 'max'
}

// Uniwersalna funkcja do aktualizacji ceny
const updatePrice = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = parseInt(target.value)

  // Natychmiastowa aktualizacja bez walidacji dla płynności
  if (activeSlider.value === 'min') {
    if (newValue <= priceRange.value[1]) {
      priceRange.value[0] = newValue
    } else {
      // Pozwól na przeciągnięcie przez max
      priceRange.value[0] = newValue
      priceRange.value[1] = newValue
    }
  } else if (activeSlider.value === 'max') {
    if (newValue >= priceRange.value[0]) {
      priceRange.value[1] = newValue
    } else {
      // Pozwól na przeciągnięcie przez min
      priceRange.value[1] = newValue
      priceRange.value[0] = newValue
    }
  }

  watchFilters()
}

// Metody dla wyświetlania suwaka zakresu
const getPriceThumbPosition = (index: number) => {
  const range = props.maxPrice - props.minPrice
  if (range === 0) return 0
  const value = priceRange.value[index] - props.minPrice
  return (value / range) * 100
}

const getPriceRangeStyle = () => {
  const start = getPriceThumbPosition(0)
  const end = getPriceThumbPosition(1)
  return {
    left: `${start}%`,
    width: `${Math.max(0, end - start)}%`,
    background: 'linear-gradient(to right, #10B981, #059669)',
  }
}

// funkcja dla pozycji suwaka czasu 
const getDurationThumbPosition = () => {
  const range = props.maxDuration - 60
  if (range === 0) return 0
  const value = durationRange.value - 60
  return (value / range) * 100
}

// funkcja dla stylu zakresu czasu
const getDurationRangeStyle = () => {
  const percentage = getDurationThumbPosition()
  return {
    left: '0%',
    width: `${percentage}%`,
    background: 'linear-gradient(to right, #10B981, #059669)',
  }
}

// Funkcje dla kciuków suwaka ceny
const getPriceThumbLeftStyle = () => {
  return {
    left: `calc(${getPriceThumbPosition(0)}% - 12px)`,
    top: '-7px',
    zIndex: activeSlider.value === 'min' ? 6 : 5,
  }
}

const getPriceThumbRightStyle = () => {
  return {
    left: `calc(${getPriceThumbPosition(1)}% - 12px)`,
    top: '-7px',
    zIndex: activeSlider.value === 'max' ? 6 : 5,
  }
}

// Funkcja dla kciuka czasu
const getDurationThumbStyle = () => {
  return {
    left: `calc(${getDurationThumbPosition()}% - 12px)`,
    top: '-7px',
    zIndex: 5,
  }
}

// Reaktywny watch na zmiany props
watch(
  () => [props.minPrice, props.maxPrice],
  () => {
    priceRange.value = [props.minPrice, props.maxPrice]
  },
  { immediate: true },
)

// Reset aktywnego suwaka po zakończeniu interakcji (tylko dla suwaka ceny)
const resetActiveSlider = () => {
  activeSlider.value = null
}

// Cleanup timeout przy unmount
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  if (emitTimeout) {
    clearTimeout(emitTimeout)
  }
})
</script>

<template>
  <div class="FlightFilterSidebar bg-white rounded-lg shadow-md p-4 sm:p-6">
    <!-- Nagłówek filtrów -->
    <h3 class="text-lg font-semibold p-2 mb-4 sm:mb-6 flex items-center space-x-3">
      <i class="fas fa-filter text-primary-600 text-base" aria-hidden="true"></i>
      <span class="text-gray-800">Filtry</span>
    </h3>

    <!-- Filtr ceny -->
    <div class="mb-8 sm:mb-10">
      <h4 class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-3" id="priceRangeLabel">
        <i class="fas fa-euro-sign text-primary-500 text-base" aria-hidden="true"></i>
        <span class="text-gray-800">Cena</span>
      </h4>

      <div class="p-2">
        <div
          class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner border border-gray-200"
        >
          <!-- Wartości zakresu z lepszym stylem -->
          <div class="flex justify-between pb-6">
            <div
              class="bg-white px-3 py-1.5 rounded-lg shadow-sm ring-1 ring-primary-200 border border-primary-100"
            >
              <span class="text-sm font-semibold text-primary-700">{{
                formatPrice(priceRange[0])
              }}</span>
            </div>
            <div
              class="bg-white px-3 py-1.5 rounded-lg shadow-sm ring-1 ring-primary-200 border border-primary-100"
            >
              <span class="text-sm font-semibold text-primary-700">{{
                formatPrice(priceRange[1])
              }}</span>
            </div>
          </div>

          <!-- Suwak ceny -->
          <div class="relative h-2 bg-gray-200 rounded-full mb-6 price-slider-container">
            <div class="sr-only">
              Zakres ceny od {{ formatPrice(priceRange[0]) }} do {{ formatPrice(priceRange[1]) }}
            </div>

            <!-- Zaznaczenie zakresu z ulepszonym gradientem -->
            <div class="absolute h-2 rounded-full" :style="getPriceRangeStyle()"></div>

            <!-- Kciuki suwaka z lepszymi kolorami -->
            <div
              class="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-primary-500 cursor-pointer thumb-left"
              :style="getPriceThumbLeftStyle()"
              :class="{
                'ring-2 ring-primary-400 shadow-xl scale-105 border-primary-600':
                  activeSlider === 'min',
              }"
            ></div>
            <div
              class="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-primary-500 cursor-pointer thumb-right"
              :style="getPriceThumbRightStyle()"
              :class="{
                'ring-2 ring-primary-400 shadow-xl scale-105 border-primary-600':
                  activeSlider === 'max',
              }"
            ></div>

            <!-- Input suwaka -->
            <input
              type="range"
              :min="minPrice"
              :max="maxPrice"
              :value="activeSlider === 'max' ? priceRange[1] : priceRange[0]"
              @mousedown="handleSliderInteraction"
              @touchstart="handleSliderInteraction"
              @input="updatePrice"
              @mouseup="resetActiveSlider"
              @touchend="resetActiveSlider"
              class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer price-range-input"
              aria-label="Zakres ceny"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Filtr przesiadek -->
    <div class="mb-8 sm:mb-10">
      <h4 class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-3" id="stopFiltersHeading">
        <i class="fas fa-route text-primary-500 text-base" aria-hidden="true"></i>
        <span class="text-gray-800">Przesiadki</span>
      </h4>

      <div class="p-2">
        <div
          class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner border border-gray-200"
        >
          <div class="space-y-3">
            <!-- Bez przesiadek -->
            <label
              class="flex items-center cursor-pointer group p-3 rounded-lg transition-all hover:bg-white hover:shadow-sm hover:border-primary-200 border border-transparent"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="flex-shrink-0 w-5 flex justify-center">
                  <i class="fas fa-plane-departure text-primary-500 text-sm" aria-hidden="true"></i>
                </div>
                <span class="text-gray-800 font-medium text-sm group-hover:text-primary-700">
                  Bez przesiadek
                </span>
              </div>
              <div class="flex items-center ml-4">
                <input
                  type="checkbox"
                  v-model="stopFilters.direct"
                  @change="watchFilters"
                  class="sr-only"
                  id="stopFilterDirect"
                  aria-label="Bez przesiadek"
                />
                <div
                  class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-all duration-300 shadow-sm ring-1"
                  :class="
                    stopFilters.direct
                      ? 'bg-primary-500 shadow-primary-200 ring-primary-300'
                      : 'bg-gray-200 hover:bg-gray-300 ring-gray-300'
                  "
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300"
                    :class="
                      stopFilters.direct ? 'translate-x-6 shadow-primary-100' : 'translate-x-1'
                    "
                  ></span>
                </div>
              </div>
            </label>

            <!-- 1 przesiadka -->
            <label
              class="flex items-center cursor-pointer group p-3 rounded-lg transition-all hover:bg-white hover:shadow-sm hover:border-primary-200 border border-transparent"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="flex-shrink-0 w-5 flex justify-center">
                  <i class="fas fa-exchange-alt text-primary-500 text-sm" aria-hidden="true"></i>
                </div>
                <span class="text-gray-800 font-medium text-sm group-hover:text-primary-700">
                  1 przesiadka
                </span>
              </div>
              <div class="flex items-center ml-4">
                <input
                  type="checkbox"
                  v-model="stopFilters.oneStop"
                  @change="watchFilters"
                  class="sr-only"
                  id="stopFilterOneStop"
                  aria-label="1 przesiadka"
                />
                <div
                  class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-all duration-300 shadow-sm ring-1"
                  :class="
                    stopFilters.oneStop
                      ? 'bg-primary-500 shadow-primary-200 ring-primary-300'
                      : 'bg-gray-200 hover:bg-gray-300 ring-gray-300'
                  "
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300"
                    :class="
                      stopFilters.oneStop ? 'translate-x-6 shadow-primary-100' : 'translate-x-1'
                    "
                  ></span>
                </div>
              </div>
            </label>

            <!-- 2+ przesiadek -->
            <label
              class="flex items-center cursor-pointer group p-3 rounded-lg transition-all hover:bg-white hover:shadow-sm hover:border-primary-200 border border-transparent"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="flex-shrink-0 w-5 flex justify-center">
                  <i class="fas fa-code-branch text-primary-500 text-sm" aria-hidden="true"></i>
                </div>
                <span class="text-gray-800 font-medium text-sm group-hover:text-primary-700">
                  2+ przesiadek
                </span>
              </div>
              <div class="flex items-center ml-4">
                <input
                  type="checkbox"
                  v-model="stopFilters.multiStop"
                  @change="watchFilters"
                  class="sr-only"
                  id="stopFilterMultiStop"
                  aria-label="2+ przesiadki"
                />
                <div
                  class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-all duration-300 shadow-sm ring-1"
                  :class="
                    stopFilters.multiStop
                      ? 'bg-primary-500 shadow-primary-200 ring-primary-300'
                      : 'bg-gray-200 hover:bg-gray-300 ring-gray-300'
                  "
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300"
                    :class="
                      stopFilters.multiStop ? 'translate-x-6 shadow-primary-100' : 'translate-x-1'
                    "
                  ></span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtr czasu trwania -->
    <div class="mb-8 sm:mb-10">
      <h4 class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-3" id="durationRangeLabel">
        <i class="fas fa-clock text-primary-500 text-base" aria-hidden="true"></i>
        <span class="text-gray-800">Czas podróży</span>
      </h4>

      <div class="p-2">
        <div
          class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner border border-gray-200"
        >
          <!-- Wartość czasu -->
          <div class="flex justify-center pb-5">
            <div
              class="bg-white px-4 py-2 rounded-lg shadow-sm ring-1 ring-primary-200 border border-primary-100"
            >
              <span class="text-sm font-semibold text-primary-700"
                >Do {{ formatDuration(durationRange) }}</span
              >
            </div>
          </div>

          <!-- Suwak czasu -->
          <div class="relative h-2 bg-gray-200 rounded-full mb-10">
            <!-- Zaznaczenie zakresu -->
            <div class="absolute h-2 rounded-full" :style="getDurationRangeStyle()"></div>

            <!-- Skala czasu -->
            <div class="absolute -bottom-5 left-0 right-0 flex justify-between">
              <span class="text-xs text-gray-500">{{ formatDuration(60) }}</span>
              <span class="text-xs text-gray-500">{{ formatDuration(maxDuration) }}</span>
            </div>

            <!-- Kciuk suwaka -->
            <div
              class="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-primary-500 cursor-pointer duration-thumb hover:shadow-xl hover:border-primary-600 transition-all"
              :style="getDurationThumbStyle()"
            ></div>

            <!-- Input suwaka -->
            <input
              type="range"
              :min="60"
              :max="maxDuration"
              :value="durationRange"
              @input="updateDuration"
              class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer duration-range-input"
              aria-label="Maksymalny czas podróży"
            />
          </div>

          <p class="text-xs text-gray-600 text-center pt-5">
            Przesuń suwak, aby dostosować maksymalny czas lotu
          </p>
        </div>
      </div>
    </div>

    <!-- Filtr linii lotniczych -->
    <div>
      <h4
        class="font-medium p-2 mb-3 sm:mb-4 flex items-center space-x-3"
        id="airlinesFilterHeading"
      >
        <i class="fas fa-plane text-primary-500 text-base" aria-hidden="true"></i>
        <span class="text-gray-800">Linie lotnicze</span>
      </h4>

      <div class="p-2">
        <div
          class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner border border-gray-200"
        >
          <div class="space-y-3">
            <label
              v-for="airline in airlines"
              :key="airline.code"
              class="flex items-center cursor-pointer group p-3 rounded-lg transition-all hover:bg-white hover:shadow-sm hover:border-primary-200 border border-transparent"
              :for="`airline-${airline.code}`"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="flex-shrink-0 w-5 flex justify-center">
                  <i class="fas fa-building text-primary-500 text-sm" aria-hidden="true"></i>
                </div>
                <div class="flex flex-col min-w-0">
                  <span
                    class="text-gray-800 font-medium text-sm leading-tight group-hover:text-primary-700"
                  >
                    {{ airline.name }}
                  </span>
                  <span class="text-xs text-gray-500 mt-0.5">({{ airline.code }})</span>
                </div>
              </div>

              <div class="flex items-center ml-4">
                <input
                  type="checkbox"
                  v-model="airline.checked"
                  @change="watchFilters"
                  class="sr-only"
                  :id="`airline-${airline.code}`"
                  :aria-label="airline.name"
                />
                <div
                  class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-all duration-300 shadow-sm ring-1"
                  :class="
                    airline.checked
                      ? 'bg-primary-500 shadow-primary-200 ring-primary-300'
                      : 'bg-gray-200 hover:bg-gray-300 ring-gray-300'
                  "
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300"
                    :class="airline.checked ? 'translate-x-6 shadow-primary-100' : 'translate-x-1'"
                  ></span>
                </div>
              </div>
            </label>
          </div>

          <div v-if="airlines.length === 0" class="text-center text-gray-500 py-4">
            <span class="text-sm">Brak dostępnych linii lotniczych</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.price-slider-container {
  position: relative;
  user-select: none;
}

.price-range-input {
  pointer-events: auto;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 10;
}

.price-range-input::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  border: none;
  box-shadow: none;
  pointer-events: auto;
}

.price-range-input::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  border: none;
  box-shadow: none;
  pointer-events: auto;
}

.duration-range-input {
  z-index: 10;
}

.duration-range-input::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  border: none;
  box-shadow: none;
}

.duration-range-input::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  border: none;
  box-shadow: none;
}

.price-range-input::-webkit-slider-track,
.duration-range-input::-webkit-slider-track {
  background: transparent;
  border: none;
  height: 8px;
}

.price-range-input::-moz-range-track,
.duration-range-input::-moz-range-track {
  background: transparent;
  border: none;
  height: 8px;
}

.price-range-input:focus,
.duration-range-input:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.cursor-pointer {
  cursor: pointer;
}

.thumb-left,
.thumb-right,
.duration-thumb {
  pointer-events: none;
}

.thumb-left:hover,
.thumb-right:hover,
.duration-thumb:hover {
  transform: scale(1.1);
  transition: transform 0.15s ease;
}

.thumb-left.scale-105,
.thumb-right.scale-105 {
  transform: scale(1.05);
}

.ring-2 {
  transition: box-shadow 0.15s ease;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1.2;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.3;
}

.leading-tight {
  line-height: 1.25;
}

.shadow-primary-100 {
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}

.shadow-primary-200 {
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

/* POPRAWIONE style dla ring */
.ring-primary-300 {
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
}

.ring-gray-300 {
  box-shadow: 0 0 0 1px rgba(209, 213, 219, 0.8);
}

.bg-primary-500 {
  background-color: #10b981;
}

.hover\:bg-gray-300:hover {
  background-color: #d1d5db;
}

.sr-only:focus + div {
  outline: none;
  border: none;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
}

input:focus,
label:focus,
div:focus,
span:focus {
  outline: none;
  border: none;
}

input[type='checkbox']:focus {
  outline: none;
  box-shadow: none;
}

label:focus-within {
  outline: none;
}

.relative.inline-flex:focus {
  outline: none;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
}

.relative.inline-flex:hover {
  transition: all 0.3s ease;
}

.FlightFilterSidebar .price-range-input:focus,
.FlightFilterSidebar .duration-range-input:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.FlightFilterSidebar input:focus {
  outline: none;
  border: none;
}

.FlightFilterSidebar .relative.inline-flex:focus {
  outline: none;
}

.FlightFilterSidebar .bg-primary-500 {
  background-color: #10b981;
}

.FlightFilterSidebar .cursor-pointer {
  cursor: pointer;
}

.FlightFilterSidebar .thumb-left,
.FlightFilterSidebar .thumb-right,
.FlightFilterSidebar .duration-thumb {
  pointer-events: none;
}

@media (max-width: 640px) {
  .space-x-2 > * + * {
    margin-left: 0.5rem;
  }

  .text-sm {
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .text-xs {
    font-size: 0.75rem;
    line-height: 1.2;
  }
}
</style>
