<script setup lang="ts">
import SearchSection from '@/components/layout/SearchSection.vue'
import FiltersSidebar from '@/components/layout/FiltersSidebar.vue'
import AccommodationsList from '@/components/layout/AccommodationsList.vue'
import SectionHeading from '@/components/layout/SectionHeading.vue'
import MapPlaceholder from '@/components/layout/MapPlaceholder.vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { ref } from 'vue'

const isFilterOpen = ref(false)

// XDDDD
import hotel1 from '@/assets/mock/hotel1.jpg'
import hotel2 from '@/assets/mock/hotel2.jpg'
import hotel3 from '@/assets/mock/hotel3.jpg'

// TO JEST CHYBA ZLE, ALE NIE UMIALME INACZEJ XDD
import heroSmall from '@/assets/images/hero/accomodation-hero-small.jpg'
import heroBig from '@/assets/images/hero/accomodation-hero-big.jpg'

const mockAccommodations = [
  {
    id: 1,
    title: 'Grand Hotel',
    description: 'Luksusowy hotel w centrum miasta',
    price: 450,
    rating: 5.0,
    image: hotel1,
    amenities: ['Parking', 'WiFi', 'Restauracja'],
    address: 'Warszawa, 350m od centrum'
  },
  {
    id: 2,
    title: 'Apartamenty Centrum',
    description: 'Przytulne apartamenty',
    price: 280,
    rating: 2.5,
    image: hotel2,
    amenities: ['WiFi', 'Kuchnia'],
    address: 'Warszawa, 1.2km od centrum'
  },
  {
    id: 3,
    title: 'Urzond wojewodzki',
    description: 'Spokojny hotel z ogrodem',
    price: 9990,
    rating: 0.1,
    image: hotel3,
    amenities: ['Parking', 'Ogród'],
    address: 'Warszawa, 5km od centrum'
  }
]

const selectedFilters = {
  city: 'Warszawa',
  dates: {
    checkIn: '05.06.2025',
    checkOut: '08.06.2025'
  },
  guests: '2 dorosłych, 1 pokój'
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <!-- hero section with adjusted height -->
    <section class="relative h-[350px] lg:h-[450px] overflow-hidden">
      <!-- hero background -->
      <div class="absolute inset-0">
        <picture>
          <source
            media="(min-width: 1024px)"
            :srcset="heroBig"
          />
          <source
            media="(max-width: 1023px)"
            :srcset="heroSmall"
          />
          <img
            :src="heroBig"
            alt="Accommodation hero"
            class="w-full h-full object-cover object-center brightness-75"
          />
        </picture>
      </div>

      <!-- hero content -->
      <div class="relative h-full z-10">
        <div class="container mx-auto px-4 h-full flex flex-col justify-center items-center">
          <SectionHeading 
            title="Noclegi" 
            subtitle="Znajdź idealne miejsce na nocleg" 
            class="text-white text-center"
          />
        </div>
      </div>
    </section>

    <!-- search section with improved styling -->
    <section class="relative z-20 -mt-24 mb-16">
      <div class="container mx-auto px-4">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <SearchSection />
        </div>
      </div>
    </section>

    <!-- main content with adjusted spacing -->
    <section class="bg-gray-50 pt-4 pb-12">
      <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div class="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <!-- sidebar -->
          <aside class="w-full lg:w-1/4">
            <!-- map (desktop only) -->
            <div class="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <MapPlaceholder class="h-[250px] w-full object-cover" />
            </div>
            
            <!-- mobile filters button -->
            <div class="fixed bottom-4 left-3 right-3 z-40 lg:hidden">
              <AnimatedButton 
                variant="primary" 
                class="w-full flex items-center justify-center gap-2"
                @click="isFilterOpen = true"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
                Filtry
              </AnimatedButton>
            </div>
            
            <!-- desktop filters -->
            <div class="hidden lg:block">
              <FiltersSidebar :is-open="isFilterOpen" @close="isFilterOpen = false" />
            </div>
          </aside>

          <!-- main content -->
          <main class="w-full lg:w-3/4">
            <!-- header with counter -->
            <div class="bg-white rounded-lg shadow-md p-2 sm:p-3 md:p-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h2 class="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Znaleziono {{ mockAccommodations.length }} obiektów
                </h2>
                <select class="text-xs sm:text-sm border rounded-lg p-1.5 sm:p-2 w-full sm:w-auto max-w-[160px] sm:max-w-[200px]">
                  <option>Sortuj: Polecane</option>
                  <option>Cena: od najniższej</option>
                </select>
              </div>
            </div>

            <!-- separator -->
            <div class="h-4 sm:h-6 md:h-8"></div>

            <!-- accommodations list -->
            <div class="bg-transparent pb-24 lg:pb-0">
              <AccommodationsList 
                :accommodations="mockAccommodations"
              />
            </div>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>
