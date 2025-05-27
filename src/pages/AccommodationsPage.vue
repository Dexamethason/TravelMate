<script setup lang="ts">
import SearchSection from '@/components/layout/SearchSection.vue'
import FiltersSidebar from '@/components/layout/FiltersSidebar.vue'
import AccommodationsList from '@/components/layout/AccommodationsList.vue'
import DiagonalBlocks from '@/components/ui/DiagonalBlocks.vue'
import SectionHeading from '@/components/layout/SectionHeading.vue'
import MapPlaceholder from '@/components/layout/MapPlaceholder.vue'

// Import mock images
import hotel1 from '@/assets/mock/hotel1.jpg'
import hotel2 from '@/assets/mock/hotel2.jpg'
import hotel3 from '@/assets/mock/hotel3.jpg'
import heroImage from '@/assets/mock/hero-accommodation.jpg'

const mockAccommodations = [
  {
    id: 1,
    title: 'Grand Hotel',
    description: 'Luksusowy hotel w centrum miasta',
    price: 450,
    rating: 5.0,
    image: hotel1,
    amenities: ['Parking', 'WiFi', 'Restauracja'],
    address: 'Warszawa, 350m od centrum',
  },
  {
    id: 2,
    title: 'Apartamenty Centrum',
    description: 'Przytulne apartamenty',
    price: 280,
    rating: 2.5,
    image: hotel2,
    amenities: ['WiFi', 'Kuchnia'],
    address: 'Warszawa, 1.2km od centrum',
  },
  {
    id: 3,
    title: 'Urzond wojewodzki',
    description: 'Spokojny hotel z ogrodem',
    price: 9990,
    rating: 0.1,
    image: hotel3,
    amenities: ['Parking', 'Ogród'],
    address: 'Warszawa, 5km od centrum',
  },
]

const selectedFilters = {
  city: 'Warszawa',
  dates: {
    checkIn: '05.06.2025',
    checkOut: '08.06.2025',
  },
  guests: '2 dorosłych, 1 pokój',
}
</script>

<template>
  <!-- caly kontener -->
  <div class="flex flex-col min-h-screen bg-white">
    <!-- hero image z gradientem -->
    <section class="relative">
      <!-- container na zdjecie w tle -->
      <div class="absolute inset-0 z-0 h-[200px] sm:h-[300px] md:h-[400px]">
        <img
          :src="heroImage"
          alt="Accommodation hero"
          class="w-full h-full object-cover brightness-50"
        />
      </div>

      <!-- nakladka z tekstem -->
      <div
        class="relative z-10 bg-gradient-to-b from-primary-600/90 to-primary-800/90 h-[200px] sm:h-[300px] md:h-[400px]"
      >
        <!-- Stała szerokość 1184px, płynne przesuwanie poniżej -->
        <div
          class="w-full mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-20"
          style="width: min(1184px, 100vw)"
        >
          <SectionHeading
            title="Noclegi"
            subtitle="Znajdź idealne miejsce na nocleg"
            class="text-white text-center"
          />
        </div>
      </div>
    </section>

    <!-- searchbar -->
    <SearchSection />

    <!-- glowna sekcja z hotelami -->
    <section class="bg-gray-50">
      <!-- Stała szerokość 1184px, płynne przesuwanie poniżej -->
      <div class="w-full mx-auto px-3 sm:px-4 py-4 sm:py-8" style="width: min(1184px, 100vw)">
        <!-- flex container na mape i hotele -->
        <div class="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <!-- lewa kolumna -->
          <aside class="w-full lg:w-1/4 space-y-4 sm:space-y-6">
            <!-- mapa (nie pokazuje sie na tel) -->
            <div class="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <MapPlaceholder class="h-[200px] sm:h-[250px] md:h-[300px] w-full" />
            </div>

            <!-- mobilny przycisk do filtrow -->
            <div class="fixed bottom-4 left-3 right-3 z-50 lg:hidden">
              <button
                class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg shadow-lg font-medium flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Filtry
              </button>
            </div>

            <!-- filtry na desktop -->
            <div class="hidden lg:block">
              <FiltersSidebar />
            </div>
          </aside>

          <!-- prawa kolumna z lista hoteli -->
          <main class="w-full lg:w-3/4">
            <!-- naglowek z licznikiem -->
            <div class="bg-white rounded-lg shadow-md p-3 sm:p-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h2 class="text-base sm:text-lg font-semibold text-gray-800">
                  Znaleziono {{ mockAccommodations.length }} obiektów
                </h2>
                <!-- dropdown do sortowania -->
                <select class="text-sm border rounded-lg p-2 w-full sm:w-auto max-w-[200px]">
                  <option>Sortuj: Polecane</option>
                  <option>Cena: od najniższej</option>
                </select>
              </div>
            </div>

            <!-- separator -->
            <div class="h-6 sm:h-8"></div>

            <!-- lista hoteli (padding na dole przez filtr) -->
            <div class="bg-transparent pb-20 lg:pb-0">
              <AccommodationsList :accommodations="mockAccommodations" />
            </div>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>
