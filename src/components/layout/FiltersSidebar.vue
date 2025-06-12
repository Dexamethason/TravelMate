<script setup lang="ts">
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { ref, reactive } from 'vue'

// zmienna do otwierania filtrow na mobile
const isOpen = ref(false)

// stany filtrow
const filters = reactive({
  features: {
    breakfast: false,
    freeCancel: false,
    parking: false,
    wifi: false,
    pool: false,
    gym: false,
    airCon: false
  },
  stars: {
    five: false,
    four: false,
    three: false
  },
  location: {
    center: false,
    nearCenter: false
  }
})

const budget = ref(1000)
const maxBudget = 1000

const formatPrice = (value: number) => {
  return `${value} zł`
}

// zamykanie mobilnych filtrow
const closeFilters = () => {
  isOpen.value = false
}

// aplikowanie filtrow
const emit = defineEmits(['apply-filters', 'reset-filters'])

const applyFilters = () => {
  emit('apply-filters', {
    budget: budget.value,
    features: Object.entries(filters.features)
      .filter(([_, value]) => value)
      .map(([key]) => key),
    stars: Object.entries(filters.stars)
      .filter(([_, value]) => value)
      .map(([key]) => {
        if (key === 'five') return 5
        if (key === 'four') return 4
        if (key === 'three') return 3
        return 0
      })
      .filter(star => star > 0)
  })
  closeFilters()
}

// reset filtrow
const resetFilters = () => {
  budget.value = maxBudget
  Object.keys(filters.features).forEach(key => {
    filters.features[key] = false
  })
  Object.keys(filters.stars).forEach(key => {
    filters.stars[key] = false
  })
  emit('reset-filters')
  closeFilters()
}
</script>

<template>
  <div class="flex flex-col">
    <!-- panel filtrow -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="space-y-10 sm:space-y-12">
        <!-- popularne filtry -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Popularne filtry</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.breakfast"
                />
                <span class="ml-2 text-sm text-gray-700">Śniadanie w cenie</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                             focus:ring-primary-500 cursor-pointer" 
                v-model="filters.features.freeCancel"
                />
                <span class="ml-2 text-sm text-gray-700">Bezpłatne odwołanie</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                             focus:ring-primary-500 cursor-pointer" 
                v-model="filters.features.parking"
                />
                <span class="ml-2 text-sm text-gray-700">Parking na miejscu</span>
              </div>
            </label>
          </div>
        </div>

        <!-- budzet -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Twój budżet</h3>
          <div class="space-y-4">
            <!-- slider and value display -->
            <div class="flex items-center gap-4">
              <input 
                type="range" 
                v-model="budget"
                class="w-full accent-primary-600" 
                min="0" 
                :max="maxBudget" 
                step="50"
              />
              <span class="min-w-[80px] text-sm text-gray-700 font-medium">
                {{ formatPrice(budget) }}
              </span>
            </div>
            <!-- range labels -->
            <div class="flex justify-between text-sm text-gray-600">
              <span>0 zł</span>
              <span>{{ formatPrice(maxBudget) }}+</span>
            </div>
          </div>
        </div>

        <!-- gwiazdki hotelu XD - poprawione checkboxy -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Kategoria (gwiazdki)</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  v-model="filters.stars.five"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span class="ml-3 text-yellow-400 flex items-center">
                  ★★★★★
                  <span class="text-gray-500 text-sm ml-2">(54)</span>
                </span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                             focus:ring-primary-500 cursor-pointer" />
                <span class="ml-3 text-yellow-400 flex items-center">
                  ★★★★
                  <span class="text-gray-500 text-sm ml-2">(32)</span>
                </span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                             focus:ring-primary-500 cursor-pointer" />
                <span class="ml-3 text-yellow-400 flex items-center">
                  ★★★
                  <span class="text-gray-500 text-sm ml-2">(12)</span>
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Udogodnienia -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Udogodnienia</h3>
          <div class="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-4">
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.wifi"
                />
                <span class="ml-2 text-sm text-gray-700">WiFi</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.airCon"
                />
                <span class="ml-2 text-sm text-gray-700">Klimatyzacja</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.pool"
                />
                <span class="ml-2 text-sm text-gray-700">Basen</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.gym"
                />
                <span class="ml-2 text-sm text-gray-700">Siłownia</span>
              </div>
            </label>
          </div>
        </div>

        <!-- gdzie to jest -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Lokalizacja</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  v-model="filters.location.center"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span class="ml-3 text-gray-700">Centrum (< 1km)</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  v-model="filters.location.nearCenter"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span class="ml-3 text-gray-700">Okolice centrum (< 3km)</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- przyciski na dole -->
      <div class="mt-8 flex flex-col gap-3">
        <AnimatedButton variant="primary" @click="applyFilters">
          Zastosuj filtry
        </AnimatedButton>
        <AnimatedButton variant="outline" @click="resetFilters">
          Wyczyść wszystko
        </AnimatedButton>
      </div>
    </div>

    <!-- mobilny drawer -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 lg:hidden"
      @click.self="closeFilters"
    >
      <!-- overlay -->
      <div class="absolute inset-0 bg-black/50"></div>
      
      <!-- panel z filtrami -->
      <div class="absolute right-0 top-0 bottom-0 w-[90%] max-w-[320px] bg-white p-4 overflow-y-auto">
        <!-- naglowek z przyciskiem zamykania -->
        <div class="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 class="text-lg font-semibold">Filtry</h2>
          <button 
            @click="closeFilters"
            class="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- zawartosc filtrow -->
        <div class="space-y-6">
        <!-- popularne filtry -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Popularne filtry</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.breakfast"
                />
                <span class="ml-2 text-sm text-gray-700">Śniadanie w cenie</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                             focus:ring-primary-500 cursor-pointer" 
                v-model="filters.features.freeCancel"
                />
                <span class="ml-2 text-sm text-gray-700">Bezpłatne odwołanie</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                             focus:ring-primary-500 cursor-pointer" 
                v-model="filters.features.parking"
                />
                <span class="ml-2 text-sm text-gray-700">Parking na miejscu</span>
              </div>
            </label>
          </div>
        </div>

        <!-- budzet -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Twój budżet</h3>
          <div class="space-y-4 sm:space-y-6">
            <div class="relative pt-1">
              <input type="range" 
                     class="w-full h-2 bg-gray-200 rounded-lg appearance-none 
                            cursor-pointer accent-primary-600 focus:outline-none"
                     v-model="budget"
                     min="0" 
                     :max="maxBudget" 
                     step="50"
              />
              <div class="flex justify-between mt-2">
                <div class="flex flex-col items-center">
                  <span class="text-xs text-gray-500">Min</span>
                  <span class="text-sm font-medium text-gray-700">0 zł</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-xs text-gray-500">Max</span>
                  <span class="text-sm font-medium text-gray-700">{{ formatPrice(maxBudget) }}+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- gwiazdki hotelu -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Kategoria (gwiazdki)</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <input 
                type="checkbox" 
                v-model="filters.stars.five"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span class="ml-3 text-yellow-400 flex items-center">
                ★★★★★
                <span class="text-gray-500 text-sm ml-2">(54)</span>
              </span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                           focus:ring-primary-500 cursor-pointer" />
              <span class="ml-3 text-yellow-400 flex items-center">
                ★★★★
                <span class="text-gray-500 text-sm ml-2">(32)</span>
              </span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                                           focus:ring-primary-500 cursor-pointer" />
              <span class="ml-3 text-yellow-400 flex items-center">
                ★★★
                <span class="text-gray-500 text-sm ml-2">(12)</span>
              </span>
            </label>
          </div>
        </div>

        <!-- udogodnienia -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Udogodnienia</h3>
          <div class="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-4">
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.wifi"
                />
                <span class="ml-2 text-sm text-gray-700">WiFi</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.airCon"
                />
                <span class="ml-2 text-sm text-gray-700">Klimatyzacja</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.pool"
                />
                <span class="ml-2 text-sm text-gray-700">Basen</span>
              </div>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded 
                         focus:ring-primary-500 cursor-pointer"
                  v-model="filters.features.gym"
                />
                <span class="ml-2 text-sm text-gray-700">Siłownia</span>
              </div>
            </label>
          </div>
        </div>

        <!-- gdzie to jest -->
        <div class="pt-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-4">Lokalizacja</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                          peer-checked:border-primary-600 peer-checked:bg-primary-600
                          group-hover:border-primary-400">
              </div>
              <span class="ml-3 text-gray-700">Centrum (< 1km)</span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                          peer-checked:border-primary-600 peer-checked:bg-primary-600
                          group-hover:border-primary-400">
              </div>
              <span class="ml-3 text-gray-700">Okolice centrum (< 3km)</span>
            </label>
          </div>
        </div>
        </div>

        <!-- przyciski na dole (sticky) -->
        <div class="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-6 border-t">
          <div class="space-y-3">
            <AnimatedButton 
              variant="primary" 
              class="w-full"
              @click="applyFilters"
            >
              Zastosuj filtry
            </AnimatedButton>
            <AnimatedButton 
              variant="outline" 
              class="w-full"
              @click="resetFilters"
            >
              Anuluj
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>