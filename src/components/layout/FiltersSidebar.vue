<script setup lang="ts">
// importy
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { ref } from 'vue'

// zmienna do otwierania filtrow na mobile
const isOpen = ref(false)
</script>

<template>
  <div class="flex flex-col">
    <!-- glowny panel filtrow -->
    <div class="bg-white rounded-lg shadow-sm p-6 lg:block"> <!-- na desktopie normalnie widoczny -->
      <div class="space-y-8">
        <!-- najczesciej uzywane filtry -->
        <div>
          <h3 class="text-base font-semibold text-gray-800 mb-4">Popularne filtry</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="peer sr-only" />
                <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors 
                           peer-checked:border-primary-600 peer-checked:bg-primary-600 
                           group-hover:border-primary-400">
                </div>
                <div class="absolute left-1 top-1 text-white opacity-0 
                           peer-checked:opacity-100 transition-opacity">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" 
                          stroke-width="3" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600 transition-colors">
                Śniadanie wliczone w cenę
              </span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="peer sr-only" />
                <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors 
                           peer-checked:border-primary-600 peer-checked:bg-primary-600 
                           group-hover:border-primary-400">
                </div>
                <div class="absolute left-1 top-1 text-white opacity-0 
                           peer-checked:opacity-100 transition-opacity">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" 
                          stroke-width="3" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600 transition-colors">
                Bezpłatne odwołanie
              </span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <div class="relative flex items-center">
                <input type="checkbox" class="peer sr-only" />
                <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors 
                           peer-checked:border-primary-600 peer-checked:bg-primary-600 
                           group-hover:border-primary-400">
                </div>
                <div class="absolute left-1 top-1 text-white opacity-0 
                           peer-checked:opacity-100 transition-opacity">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" 
                          stroke-width="3" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600 transition-colors">
                Parking na miejscu
              </span>
            </label>
          </div>
        </div>

        <!-- hajs -->
        <div>
          <h3 class="text-base font-semibold text-gray-800 mb-4">Twój budżet</h3>
          <div class="space-y-6">
            <div class="relative pt-1">
              <input type="range" 
                     class="w-full h-2 bg-gray-200 rounded-lg appearance-none 
                            cursor-pointer accent-primary-600 focus:outline-none"
                     min="0" 
                     max="1000" 
              />
              <div class="flex justify-between mt-2">
                <div class="flex flex-col items-center">
                  <span class="text-xs text-gray-500">Min</span>
                  <span class="text-sm font-medium text-gray-700">0 zł</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-xs text-gray-500">Max</span>
                  <span class="text-sm font-medium text-gray-700">1000+ zł</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- gwiazdki hotelu -->
        <div>
          <h3 class="text-base font-semibold text-gray-800 mb-4">Kategoria (gwiazdki)</h3>
          <div class="space-y-3">
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                          peer-checked:border-primary-600 peer-checked:bg-primary-600
                          group-hover:border-primary-400">
              </div>
              <span class="ml-3 text-yellow-400 flex space-x-1">
                ★★★★★
                <span class="text-gray-500 text-sm ml-2">(54)</span>
              </span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                          peer-checked:border-primary-600 peer-checked:bg-primary-600
                          group-hover:border-primary-400">
              </div>
              <span class="ml-3 text-yellow-400 flex space-x-1">
                ★★★★
                <span class="text-gray-500 text-sm ml-2">(32)</span>
              </span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                          peer-checked:border-primary-600 peer-checked:bg-primary-600
                          group-hover:border-primary-400">
              </div>
              <span class="ml-3 text-yellow-400 flex space-x-1">
                ★★★
                <span class="text-gray-500 text-sm ml-2">(12)</span>
              </span>
            </label>
          </div>
        </div>

        <!-- dodatkowe opcje -->
        <div>
          <h3 class="text-base font-semibold text-gray-800 mb-4">Udogodnienia</h3>
          <!-- ikonki do dodania pozniej xd -->
          <div class="grid grid-cols-1 gap-3">
            <label class="flex items-center group cursor-pointer p-2 rounded-lg
                         hover:bg-gray-50 transition-colors">
              <input type="checkbox" class="peer sr-only" />
              <div class="relative flex items-center">
                <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                            peer-checked:border-primary-600 peer-checked:bg-primary-600">
                </div>
                <svg class="w-4 h-4 text-gray-400 ml-3" viewBox="0 0 24 24">
                  <!-- Add icon for each amenity -->
                </svg>
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600">WiFi</span>
              <span class="ml-auto text-sm text-gray-400">(234)</span>
            </label>
            <label class="flex items-center group cursor-pointer p-2 rounded-lg
                         hover:bg-gray-50 transition-colors">
              <input type="checkbox" class="peer sr-only" />
              <div class="relative flex items-center">
                <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                            peer-checked:border-primary-600 peer-checked:bg-primary-600">
                </div>
                <svg class="w-4 h-4 text-gray-400 ml-3" viewBox="0 0 24 24">
                  <!-- Add icon for each amenity -->
                </svg>
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600">Klimatyzacja</span>
              <span class="ml-auto text-sm text-gray-400">(123)</span>
            </label>
            <label class="flex items-center group cursor-pointer p-2 rounded-lg
                         hover:bg-gray-50 transition-colors">
              <input type="checkbox" class="peer sr-only" />
              <div class="relative flex items-center">
                <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                            peer-checked:border-primary-600 peer-checked:bg-primary-600">
                </div>
                <svg class="w-4 h-4 text-gray-400 ml-3" viewBox="0 0 24 24">
                  <!-- Add icon for each amenity -->
                </svg>
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600">Basen</span>
              <span class="ml-auto text-sm text-gray-400">(45)</span>
            </label>
            <label class="flex items-center group cursor-pointer p-2 rounded-lg
                         hover:bg-gray-50 transition-colors">
              <input type="checkbox" class="peer sr-only" />
              <div class="relative flex items-center">
                <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                            peer-checked:border-primary-600 peer-checked:bg-primary-600">
                </div>
                <svg class="w-4 h-4 text-gray-400 ml-3" viewBox="0 0 24 24">
                  <!-- Add icon for each amenity -->
                </svg>
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600">Siłownia</span>
              <span class="ml-auto text-sm text-gray-400">(67)</span>
            </label>
          </div>
        </div>

        <!-- gdzie to jest -->
        <div>
          <h3 class="text-base font-semibold text-gray-800 mb-4">Lokalizacja</h3>
          <div class="space-y-2">
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                          peer-checked:border-primary-600 peer-checked:bg-primary-600
                          group-hover:border-primary-400">
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600">Centrum (< 1km)</span>
            </label>
            <label class="flex items-center group cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-5 h-5 border-2 border-gray-300 rounded transition-colors
                          peer-checked:border-primary-600 peer-checked:bg-primary-600
                          group-hover:border-primary-400">
              </div>
              <span class="ml-3 text-gray-700 group-hover:text-primary-600">Okolice centrum (< 3km)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- wysuwane filtry na mobile -->
  <div class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" v-if="isOpen">
    <div class="absolute right-0 top-0 bottom-0 w-[280px] bg-white p-4">
      <!-- tu bedzie to samo co wyzej -->
    </div>
  </div>
</template>