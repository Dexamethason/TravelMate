<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import FlightSearchForm from '@/components/layout/FlightSearchForm.vue'
import FlightsList from '@/components/layout/FlightsList.vue'
import FlightFilterSidebar from '@/components/layout/FlightFilterSidebar.vue'
import SectionHeading from '@/components/layout/SectionHeading.vue'
import { mockFlights, type Flight } from '@/mock/mockFlights'
import { searchFlights } from '@/services/amadeusApi'

// Stan wyszukiwania
const hasSearched = ref(false)
const searchParams = ref<any>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Filtry i sortowanie
const sortOptions = [
  { value: 'price-asc', label: 'Cena (rosnąco)' },
  { value: 'price-desc', label: 'Cena (malejąco)' },
  { value: 'duration-asc', label: 'Najkrótszy czas' },
]
const currentSort = ref('price-asc')

// Stan filtrów
const filters = ref({
  priceRange: [0, 0] as [number, number],
  durationMax: 0,
  stops: {
    direct: true,
    oneStop: true,
    multiStop: true,
  },
  airlines: [] as string[],
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

// Dodaję funkcję do parsowania ISO 8601 duration format (PT2H30M)
const parseISO8601Duration = (duration: string): string => {
  if (!duration) return '0h 0m'
  
  // Regex dla formatu PT[H]H[M]M lub PT[M]M
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/
  const matches = duration.match(regex)
  
  if (!matches) return '0h 0m'
  
  const hours = parseInt(matches[1] || '0')
  const minutes = parseInt(matches[2] || '0')
  
  return `${hours}h ${minutes}m`
}

// Funkcja do mapowania kodów linii lotniczych na pełne nazwy
const getAirlineName = (carrierCode: string): string => {
  const airlineMap: Record<string, string> = {
    'LO': 'LOT Polish Airlines',
    'FR': 'Ryanair',
    'LH': 'Lufthansa',
    'W6': 'Wizz Air',
    'KL': 'KLM',
    'AF': 'Air France',
    'U2': 'EasyJet',
    'LX': 'Swiss International Air Lines',
    'BA': 'British Airways',
    'IB': 'Iberia',
    'VY': 'Vueling',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'AZ': 'ITA Airways',
    'SK': 'SAS',
    'DL': 'Delta Air Lines',
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'EW': 'Eurowings',
    '4U': 'Germanwings',
    'TP': 'TAP Air Portugal',
    'DY': 'Norwegian',
    'WF': 'Widerøe',
    'TK': 'Turkish Airlines',
    'QR': 'Qatar Airways',
    'EK': 'Emirates',
    'MS': 'EgyptAir',
    'ET': 'Ethiopian Airlines',
    'SA': 'South African Airways',
    'EY': 'Etihad Airways',
    'SV': 'Saudi Arabian Airlines',
    'AI': 'Air India',
    'NH': 'ANA',
    'JL': 'Japan Airlines',
    'CX': 'Cathay Pacific',
    'SQ': 'Singapore Airlines',
    'TG': 'Thai Airways',
    'MH': 'Malaysia Airlines',
    'GA': 'Garuda Indonesia',
    'AC': 'Air Canada',
    'WS': 'WestJet',
    'AM': 'Aeroméxico',
    'CM': 'Copa Airlines',
    'LA': 'LATAM Airlines',
    'AR': 'Aerolíneas Argentinas',
    'AV': 'Avianca',
    'JJ': 'TAM Airlines',
    'G3': 'Gol Linhas Aéreas',
    'AD': 'Azul Brazilian Airlines',
    'QF': 'Qantas',
    'JQ': 'Jetstar Airways',
    'VA': 'Virgin Australia',
    'NZ': 'Air New Zealand',
    'FJ': 'Fiji Airways',
    'PX': 'Air Niugini'
  }
  
  return airlineMap[carrierCode] || carrierCode
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

// Funkcja do wyszukiwania lotów
const handleSearch = async (params: any) => {
  isLoading.value = true
  error.value = null
  hasSearched.value = true
  searchParams.value = params
  showFilters.value = false // Zamknij filtry mobilne po wyszukiwaniu

  try {
    // Wyodrębnij kod IATA z nazwy miasta (np. "Warszawa (WAW)" -> "WAW")
    const originCode = params.from.match(/\(([A-Z]{3})\)/)?.[1]
    const destinationCode = params.to.match(/\(([A-Z]{3})\)/)?.[1]

    if (!originCode || !destinationCode) {
      throw new Error('Nieprawidłowy format kodu lotniska')
    }

    const response = await searchFlights({
      origin: originCode,
      destination: destinationCode,
      departureDate: params.departDate,
      returnDate: params.returnDate,
      adults: params.passengers
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Nie udało się pobrać danych o lotach')
    }

    // Konwertuj odpowiedź z API Amadeus na format używany w aplikacji
    allFlights.value = response.data.map((offer: any) => {
      const itinerary = offer.itineraries[0]
      const segment = itinerary.segments[0]
      const price = offer.price.total

      return {
        id: offer.id,
        airline: getAirlineName(segment.carrierCode),
        airlineCode: segment.carrierCode,
        airlineLogo: `/src/assets/mock/airlines/${segment.carrierCode.toLowerCase()}.png`,
        departureCity: segment.departure.iataCode,
        departureAirport: segment.departure.iataCode,
        departureAirportCode: segment.departure.iataCode,
        departureTime: segment.departure.at.split('T')[1].substring(0, 5),
        departureDate: segment.departure.at.split('T')[0],
        arrivalCity: segment.arrival.iataCode,
        arrivalAirport: segment.arrival.iataCode,
        arrivalAirportCode: segment.arrival.iataCode,
        arrivalTime: segment.arrival.at.split('T')[1].substring(0, 5),
        arrivalDate: segment.arrival.at.split('T')[0],
        duration: parseISO8601Duration(itinerary.duration),
        stops: itinerary.segments.length - 1,
        stopLocations: itinerary.segments.slice(1).map((s: any) => `${s.departure.iataCode}`),
        price: parseFloat(price),
        currency: offer.price.currency
      }
    })

    // Ustaw początkowy zakres cen
    const prices = allFlights.value.map((flight) => flight.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    filters.value.priceRange = [minPrice, maxPrice]

    // Ustaw początkowy maksymalny czas trwania
    const durations = allFlights.value.map((flight) => {
      const [hours, minutes] = flight.duration.replace('h', '').replace('m', '').trim().split(' ')
      return parseInt(hours) * 60 + parseInt(minutes)
    })
    filters.value.durationMax = Math.max(...durations)

    // Ustaw początkowe linie lotnicze
    const uniqueAirlines = [...new Set(allFlights.value.map((flight) => flight.airlineCode))]
    filters.value.airlines = uniqueAirlines as string[]
  } catch (err: unknown) {
    console.error('Błąd podczas wyszukiwania lotów:', err)
    error.value = err instanceof Error ? err.message : 'Nie udało się pobrać danych o lotach'
  } finally {
    isLoading.value = false
  }
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

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Wystąpił błąd</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Results content -->
      <div v-else class="flex flex-col lg:flex-row gap-6">
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
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Filters sidebar -->
        <div
          id="flight-filters"
          :class="[
            'lg:w-1/4',
            showFilters ? 'block' : 'hidden lg:block'
          ]"
        >
          <FlightFilterSidebar
            :filters="filters"
            @update:filters="handleFilterChange"
          />
        </div>

        <!-- Results list -->
        <div class="lg:w-3/4">
          <!-- Sort options -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">
                Znaleziono {{ sortedFlights.length }} lotów
              </span>
              <select
                v-model="currentSort"
                class="text-sm border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Flights list -->
          <FlightsList
            :flights="sortedFlights"
            :favorite-flights="favoriteFlights"
            @toggle-favorite="toggleFavorite"
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
