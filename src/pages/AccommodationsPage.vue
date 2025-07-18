<script setup lang="ts">
import SearchSection from '@/components/layout/SearchSection.vue'
import FiltersSidebar from '@/components/layout/FiltersSidebar.vue'
import AccommodationsList from '@/components/layout/AccommodationsList.vue'
import SectionHeading from '@/components/layout/SectionHeading.vue'
import MapPlaceholder from '@/components/layout/MapPlaceholder.vue'
import AnimatedButton from '@/components/ui/AnimatedButton.vue'
import { ref, computed } from 'vue'
import { searchHotels } from '@/services/amadeusApi'

// TO JEST CHYBA ZLE, ALE NIE UMIALME INACZEJ XDD
import heroSmall from '@/assets/images/hero/accomodation-hero-small.jpg'
import heroBig from '@/assets/images/hero/accomodation-hero-big.jpg'

const isFilterOpen = ref(false)
const sortBy = ref('recommended')

// Stan wyszukiwania
const hotels = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const hasSearched = ref(false)

const selectedFilters = {
  city: 'Warszawa',
  dates: {
    checkIn: '05.06.2025',
    checkOut: '08.06.2025',
  },
  guests: '2 dorosłych, 1 pokój',
}

// Funkcja do wyszukiwania hoteli z parametrami
const handleHotelSearch = async (searchParams: {
  cityCode: string
  checkIn: string
  checkOut: string
  guests: string
}) => {
  isLoading.value = true
  error.value = null
  hasSearched.value = true
  
  try {
    // Konwertuje gości na liczbę
    const guestsNumber = searchParams.guests === '8+' ? 8 : parseInt(searchParams.guests) || 2;
    
    const response = await searchHotels({ 
      cityCode: searchParams.cityCode,
      checkInDate: searchParams.checkIn,
      checkOutDate: searchParams.checkOut,
      adults: guestsNumber
    })
    
    if (response.success && response.data) {
      // Przekształca dane z API Amadeus na format używany w interfejsie
      hotels.value = response.data.map((hotel: any, index: number) => {
        // Znajduje najlepszą ofertę (najtańszą)
        const bestOffer = hotel.offers?.[0]?.offers?.[0];
        const price = bestOffer?.price?.total || 0;
        const currency = bestOffer?.price?.currency || 'EUR';
        
        return {
          id: index + 1,
          title: hotel.name || 'Hotel bez nazwy',
          description: `${hotel.address?.cityName || ''} ${hotel.address?.countryCode || ''}`.trim() || 'Opis niedostępny',
          price: parseFloat(price),
          currency: currency,
          rating: hotel.offers?.[0]?.hotel?.rating || 0,
          image: `https://via.placeholder.com/300x200?text=Hotel+${index + 1}`,
          amenities: hotel.offers?.[0]?.hotel?.amenities || [],
          address: `${hotel.address?.lines?.join(', ') || ''} ${hotel.address?.cityName || ''}`.trim() || 'Adres niedostępny',
          distanceFromCenter: hotel.distance?.value || 0,
          stars: hotel.offers?.[0]?.hotel?.rating || 0,
          hotelId: hotel.hotelId,
          geoCode: hotel.geoCode,
          offers: hotel.offers,
          // TODO: Dodać prawdziwe udogodnienia zamiast tego xD
          features: {
            breakfast: true,
            freeCancel: true,
            parking: true,
            wifi: true,
            pool: false,
            gym: false,
            airCon: true
          }
        }
      })
    } else {
      throw new Error(response.error || 'Błąd podczas wyszukiwania hoteli')
    }
  } catch (err) {
    error.value = (err as Error).message || 'Nie udało się pobrać danych o hotelach'
    console.error('Błąd wyszukiwania hoteli:', err)
  } finally {
    isLoading.value = false
  }
}



// Add sorting options
const sortOptions = [
  'recommended', 
  'price-desc', 
  'price-asc',
  'stars-desc',
  'stars-asc'
] as const
type SortOption = typeof sortOptions[number]

// Handle sort change
const handleSort = (option: SortOption) => {
  sortBy.value = option
}

// Helper function to calculate recommendation score
const getRecommendationScore = (item: any) => {
  let score = 0
  
  // Higher rating gives more points (0-5 points)
  score += item.rating
  
  // More amenities give more points (0-3 points)
  score += item.amenities.length * 0.3
  
  // Closer to center gives more points (0-2 points)
  score += (5 - item.distanceFromCenter) * 0.4
  
  // More stars give more points (0-2.5 points)
  score += item.stars * 0.5
  
  // Better price/quality ratio gives more points (0-2 points)
  const priceQualityRatio = (item.rating * item.stars) / item.price
  score += priceQualityRatio * 10

  return score
}

// stan filtrów
const activeFilters = ref({
  budget: 1000,
  features: [] as string[],
  stars: [] as number[]
})

// filtrowane hotele
const filteredAccommodations = computed(() => {
  return hotels.value.filter(hotel => {
    // filtr ceny
    if (hotel.price > activeFilters.value.budget) {
      return false
    }

    // filtr udogodnień
    if (activeFilters.value.features.length > 0) {
      if (!activeFilters.value.features.every(feature => 
        hotel.features?.[feature as keyof typeof hotel.features]
      )) {
        return false
      }
    }

    // filtr gwiazdek
    if (activeFilters.value.stars.length > 0) {
      if (!activeFilters.value.stars.includes(hotel.stars)) {
        return false
      }
    }

    return true
  })
})

// połączone filtrowanie i sortowanie
const filteredAndSortedAccommodations = computed(() => {
  // najpierw filtrujemy
  const filtered = hotels.value.filter(hotel => {
    // filtr ceny
    if (hotel.price > activeFilters.value.budget) {
      return false
    }

    // filtr udogodnień
    if (activeFilters.value.features.length > 0) {
      if (!activeFilters.value.features.every(feature => 
        hotel.features?.[feature as keyof typeof hotel.features]
      )) {
        return false
      }
    }

    // filtr gwiazdek
    if (activeFilters.value.stars.length > 0) {
      if (!activeFilters.value.stars.includes(hotel.stars)) {
        return false
      }
    }

    return true
  })

  // potem sortujemy
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'recommended':
        return getRecommendationScore(b) - getRecommendationScore(a)
      case 'price-desc':
        return b.price - a.price
      case 'price-asc':
        return a.price - b.price
      case 'stars-desc':
        return b.stars - a.stars
      case 'stars-asc':
        return a.stars - b.stars
      default:
        return 0
    }
  })
})

// handler filtrów
const handleFilters = (filters: any) => {
  activeFilters.value = filters
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
          <SearchSection @search="handleHotelSearch" />
        </div>
      </div>
    </section>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error state -->
    <div v-if="error && !isLoading" class="flex justify-center items-center py-12">
      <div class="text-red-600 text-center">
        <p class="text-lg font-semibold">Wystąpił błąd</p>
        <p class="mt-2">{{ error }}</p>
      </div>
    </div>

    <!-- glowna sekcja z hotelami -->
    <section v-if="hasSearched && !isLoading && !error" class="py-6 sm:py-8 md:py-12 bg-gray-50">
      <div class="container mx-auto px-4">
        <!-- filtry na mobile -->
        <div class="lg:hidden mb-6">
          <AnimatedButton 
            @click="isFilterOpen = !isFilterOpen"
            class="w-full flex items-center justify-between bg-white rounded-lg shadow-sm p-3 border border-gray-200"
          >
            <span class="text-gray-700 font-medium">Filtry</span>
            <i 
              :class="isFilterOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
              class="text-gray-500 transition-transform"
            ></i>
          </AnimatedButton>
          
          <div v-if="isFilterOpen" class="mt-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <FiltersSidebar 
              @apply-filters="handleFilters"
              class="p-4"
            />
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <!-- sidebar z filtrami na desktop -->
          <aside class="w-full lg:w-1/4 order-2 lg:order-1">
            <div class="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
              <FiltersSidebar 
                @apply-filters="handleFilters"
                class="p-4 md:p-6"
              />
            </div>
          </aside>

          <!-- main content -->
          <main class="w-full lg:w-3/4 order-1 lg:order-2">
            <!-- header with counter -->
            <div class="bg-white rounded-lg shadow-md p-2 sm:p-3 md:p-4 mb-6">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h2 class="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Znaleziono {{ filteredAndSortedAccommodations.length }} obiektów
                </h2>
                <!-- Add sorting controls -->
                <select 
                  v-model="sortBy"
                  class="text-xs sm:text-sm border rounded-lg p-1.5 sm:p-2 w-full sm:w-auto max-w-[160px] sm:max-w-[200px] cursor-pointer"
                >
                  <option value="recommended">Polecane</option>
                  <option value="price-desc">Cena: od najwyższej</option>
                  <option value="price-asc">Cena: od najniższej</option>
                  <option value="stars-desc">Gwiazdki: 5-1</option>
                  <option value="stars-asc">Gwiazdki: 1-5</option>
                </select>
              </div>
            </div>

            <!-- lista hoteli -->
            <div class="bg-transparent pb-24 lg:pb-0">
              <AccommodationsList 
                :accommodations="filteredAndSortedAccommodations"
              />
            </div>
          </main>
        </div>
      </div>
    </section>

    <!-- Initial state - before search -->
    <section v-if="!hasSearched" class="py-12 bg-gray-50">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Rozpocznij wyszukiwanie
        </h2>
        <p class="text-gray-600 mb-8">
          Kliknij jeden z przycisków powyżej, aby wyszukać hotele za pomocą API Amadeus
        </p>
      </div>
    </section>
  </div>
</template>
