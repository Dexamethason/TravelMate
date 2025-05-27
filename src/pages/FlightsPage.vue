<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import FlightSearchForm from '@/components/layout/FlightSearchForm.vue'
import FlightsList from '@/components/layout/FlightsList.vue'
import FlightFilterSidebar from '@/components/layout/FlightFilterSidebar.vue'
import SectionHeading from '@/components/layout/SectionHeading.vue'
import { mockFlights, type Flight } from '@/mock/mockFlights'

// Stan wyszukiwania
const hasSearched = ref(false)
const searchParams = ref<any>(null)

// Filtry i sortowanie
const sortOptions = [
  { value: 'price-asc', label: 'Cena (rosnąco)' },
  { value: 'price-desc', label: 'Cena (malejąco)' },
  { value: 'duration-asc', label: 'Najkrótszy czas' },
]
const currentSort = ref('price-asc')

// Stan filtrów
const filters = ref({
  priceRange: [0, 0],
  durationMax: 0,
  stops: {
    direct: true,
    oneStop: true,
    multiStop: true,
  },
  airlines: [],
})

// Widoczność filtrów na urządzeniach mobilnych
const showFilters = ref(false)

// Ulubione loty
const favoriteFlights = ref<string[]>([])

// Wczytaj początkowe dane lotów
const allFlights = ref<Flight[]>([])

onMounted(() => {
  allFlights.value = mockFlights

  // Ustaw początkowy zakres cen
  const prices = allFlights.value.map((flight) => flight.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  filters.value.priceRange = [minPrice, maxPrice]

  // Ustaw początkowy maksymalny czas trwania (konwertuj stringowy czas trwania na minuty do filtrowania)
  const durations = allFlights.value.map((flight) => {
    const [hours, minutes] = flight.duration.replace('h', '').replace('m', '').trim().split(' ')
    return parseInt(hours) * 60 + parseInt(minutes)
  })
  filters.value.durationMax = Math.max(...durations)

  // Ustaw początkowe linie lotnicze
  const uniqueAirlines = [...new Set(allFlights.value.map((flight) => flight.airlineCode))]
  filters.value.airlines = uniqueAirlines as string[]
})

// Konwertuj string czasu trwania na minuty do filtrowania
const durationToMinutes = (duration: string) => {
  const [hours, minutes] = duration.replace('h', '').replace('m', '').trim().split(' ')
  return parseInt(hours) * 60 + parseInt(minutes)
}

// Obliczone loty z zastosowanymi filtrami i sortowaniem
const filteredFlights = computed(() => {
  if (!hasSearched.value) return []

  return allFlights.value.filter((flight) => {
    // Filtr ceny
    if (flight.price < filters.value.priceRange[0] || flight.price > filters.value.priceRange[1]) {
      return false
    }

    // Filtr przesiadek
    if (flight.stops === 0 && !filters.value.stops.direct) return false
    if (flight.stops === 1 && !filters.value.stops.oneStop) return false
    if (flight.stops > 1 && !filters.value.stops.multiStop) return false

    // Filtr czasu trwania
    const durationMinutes = durationToMinutes(flight.duration)
    if (durationMinutes > filters.value.durationMax) return false

    // Filtr linii lotniczych
    if (
      filters.value.airlines.length > 0 &&
      !(filters.value.airlines as string[]).includes(flight.airlineCode)
    ) {
      return false
    }

    return true
  })
})

const sortedFlights = computed(() => {
  const flights = [...filteredFlights.value]

  switch (currentSort.value) {
    case 'price-asc':
      return flights.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return flights.sort((a, b) => b.price - a.price)
    case 'duration-asc':
      return flights.sort((a, b) => {
        const durationA = durationToMinutes(a.duration)
        const durationB = durationToMinutes(b.duration)
        return durationA - durationB
      })
    default:
      return flights
  }
})

// Obsługa wyszukiwania
const handleSearch = (params: any) => {
  // W rzeczywistej aplikacji, tutaj byłoby wywołanie API z parametrami wyszukiwania
  searchParams.value = params
  hasSearched.value = true
  showFilters.value = false // Zamknij filtry mobilne po wyszukiwaniu
}

// Obsługa zmiany filtrów
const handleFilterChange = (newFilters: any) => {
  filters.value = { ...filters.value, ...newFilters }
}

// Przełącz ulubione
const toggleFavorite = (id: string) => {
  const index = favoriteFlights.value.indexOf(id)
  if (index > -1) {
    favoriteFlights.value.splice(index, 1)
  } else {
    favoriteFlights.value.push(id)
  }
}

// Otwórz szczegóły lotu (w rzeczywistej aplikacji, przekierowałoby do strony szczegółów)
const handleSelectFlight = (id: string) => {
  alert(`Wybrano lot o ID: ${id}`)
}
</script>

<template>
  <AppLayout>
    <!-- Sekcja wyszukiwania -->
    <section class="py-8 sm:py-12 px-4">
      <SectionHeading
        title="Wyszukaj loty"
        subtitle="Znajdź najlepsze oferty lotów do wymarzonego miejsca"
      />
      <FlightSearchForm @search="handleSearch" />
    </section>

    <!-- Results section -->
    <section v-if="hasSearched" class="py-8 sm:py-12 px-4">
      <!-- Results title -->
      <div class="p-3 sm:p-4 mb-6 sm:mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
          Loty z {{ searchParams.from }} do {{ searchParams.to }}
        </h2>
        <p class="text-gray-600 text-sm sm:text-base mt-1">
          {{ searchParams.departDate }}
          <template v-if="searchParams.tripType === 'roundtrip'">
            - {{ searchParams.returnDate }}
          </template>
          · {{ searchParams.passengers }}
          {{ searchParams.passengers === 1 ? 'pasażer' : 'pasażerów' }}
        </p>
      </div>

      <!-- Mobile filter toggle with improved styling -->
      <div class="lg:hidden p-2 mb-4">
        <button
          @click="showFilters = !showFilters"
          class="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-md shadow-sm flex justify-between items-center transition-all hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :aria-expanded="showFilters"
          aria-controls="flight-filters"
        >
          <span class="font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2 text-primary-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clip-rule="evenodd"
              />
            </svg>
            {{ showFilters ? 'Ukryj filtry' : 'Pokaż filtry' }}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-primary-600 transition-transform duration-200"
            :class="{ 'rotate-180': showFilters }"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <!-- Sidebar with filters -->
        <aside
          id="flight-filters"
          class="lg:w-1/4"
          :class="{ hidden: !showFilters, 'lg:block': true }"
        >
          <FlightFilterSidebar
            :min-price="Math.min(...allFlights.map((f) => f.price))"
            :max-price="Math.max(...allFlights.map((f) => f.price))"
            :max-duration="Math.max(...allFlights.map((f) => durationToMinutes(f.duration)))"
            @filter-change="handleFilterChange"
          />
        </aside>

        <!-- Results list -->
        <div class="flex-1">
          <!-- Sort controls with improved styling -->
          <div
            class="bg-white p-3 sm:p-5 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            style="margin-bottom: 25px"
          >
            <div class="p-1 sm:p-2">
              <span class="text-gray-600 font-medium"
                >{{ sortedFlights.length }}
                {{ sortedFlights.length === 1 ? 'wynik' : 'wyników' }}</span
              >
            </div>
            <div class="flex items-center w-full sm:w-auto p-1 sm:p-2">
              <label for="sort" class="mr-3 text-gray-600 font-medium">Sortuj:</label>
              <div class="relative w-full sm:w-auto">
                <select
                  id="sort"
                  v-model="currentSort"
                  class="appearance-none pl-3 pr-10 py-2 sm:py-2.5 border-2 border-gray-200 rounded-md text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all hover:border-gray-300 w-full"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div
            v-if="sortedFlights.length === 0"
            class="bg-white p-8 rounded-lg shadow-md text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 class="text-xl font-semibold mb-2">Nie znaleziono lotów</h3>
            <p class="text-gray-600">Spróbuj zmienić kryteria wyszukiwania lub filtry</p>
          </div>

          <!-- Results list -->
          <FlightsList
            v-else
            :flights="sortedFlights"
            @add-to-favorites="toggleFavorite"
            @select-flight="handleSelectFlight"
          />
        </div>
      </div>
    </section>

    <!-- Initial state - before search -->
    <section v-else class="py-12 sm:py-20 text-center">
      <div class="max-w-3xl mx-auto">
        <img
          src="/src/assets/images/hero/mainPage-hero-small.jpg"
          alt="Search for flights"
          class="w-48 h-48 sm:w-64 sm:h-64 object-cover mx-auto rounded-full mb-8 sm:mb-10"
        />
        <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          Wyszukaj loty, by zobaczyć dostępne połączenia
        </h2>
        <p class="text-gray-600 mb-6 sm:mb-8">
          Wypełnij formularz wyszukiwania, aby znaleźć najlepsze oferty lotów. Możesz filtrować
          wyniki według ceny, liczby przesiadek i czasu lotu.
        </p>
      </div>
    </section>
  </AppLayout>
</template>
