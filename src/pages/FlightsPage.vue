<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import FlightSearchForm from '@/components/layout/FlightSearchForm.vue'
import FlightsList from '@/components/layout/FlightsList.vue'
import FlightFilterSidebar from '@/components/layout/FlightFilterSidebar.vue'
import SectionHeading from '@/components/layout/SectionHeading.vue'
import { mockFlights } from '@/mock/mockFlights'
import { searchFlights } from '@/services/amadeusApi'

// POPRAWKA: Import typów z odpowiednich plików
import type {
  Flight,
  FlightSearchParams,
  FlightSearchData,
  FlightFilterState,
  FlightSortOption,
  TripType,
  AmadeusFlightOffer,
  AirlineMapping,
  ApiResponse,
  ApiError,
  SortOption,
} from '@/types'

// POPRAWKA: Import funkcji z odpowiednich plików (bez convertSearchDataToParams)
import {
  isValidFlightSearchParams,
  isValidFlight,
  isValidFlightSortOption,
  isValidTripType,
  createDefaultFlightFilters,
  isApiError,
} from '@/types'

// POPRAWKA: Lokalna definicja convertSearchDataToParams
const convertSearchDataToParams = (data: FlightSearchData): FlightSearchParams => {
  return {
    origin: data.from,
    destination: data.to,
    departureDate: data.departDate,
    returnDate: data.returnDate,
    adults: data.passengers,
  }
}

// Stan wyszukiwania z typowaniem z centralnych typów
const hasSearched = ref<boolean>(false)
const searchParams = ref<FlightSearchData | null>(null)
const isLoading = ref<boolean>(false)
const error = ref<string | null>(null)

// Opcje sortowania z typowaniem z centralnych typów
const sortOptions: readonly SortOption<FlightSortOption>[] = [
  { value: 'price-asc', label: 'Cena (rosnąco)' },
  { value: 'price-desc', label: 'Cena (malejąco)' },
  { value: 'duration-asc', label: 'Najkrótszy czas' },
] as const

const currentSort = ref<FlightSortOption>('price-asc')

// Stan filtrów z typowaniem z centralnych typów
const filters = ref<FlightFilterState>(createDefaultFlightFilters())

// Widoczność filtrów na urządzeniach mobilnych
const showFilters = ref<boolean>(false)

// Ulubione loty z typowaniem
const favoriteFlights = ref<string[]>([])

// Wszystkie loty z typowaniem z centralnych typów
const allFlights = ref<Flight[]>([])

// Mapowanie kodów linii lotniczych z typowaniem z centralnych typów
const airlineMapping: AirlineMapping = {
  LO: 'LOT Polish Airlines',
  FR: 'Ryanair',
  LH: 'Lufthansa',
  W6: 'Wizz Air',
  KL: 'KLM',
  AF: 'Air France',
  U2: 'EasyJet',
  LX: 'Swiss International Air Lines',
  BA: 'British Airways',
  IB: 'Iberia',
  VY: 'Vueling',
  OS: 'Austrian Airlines',
  SN: 'Brussels Airlines',
  AZ: 'ITA Airways',
  SK: 'SAS',
  DL: 'Delta Air Lines',
  AA: 'American Airlines',
  UA: 'United Airlines',
  EW: 'Eurowings',
  '4U': 'Germanwings',
  TP: 'TAP Air Portugal',
  DY: 'Norwegian',
  WF: 'Widerøe',
  TK: 'Turkish Airlines',
  QR: 'Qatar Airways',
  EK: 'Emirates',
  MS: 'EgyptAir',
  ET: 'Ethiopian Airlines',
  SA: 'South African Airways',
  EY: 'Etihad Airways',
  SV: 'Saudi Arabian Airlines',
  AI: 'Air India',
  NH: 'ANA',
  JL: 'Japan Airlines',
  CX: 'Cathay Pacific',
  SQ: 'Singapore Airlines',
  TG: 'Thai Airways',
  MH: 'Malaysia Airlines',
  GA: 'Garuda Indonesia',
  AC: 'Air Canada',
  WS: 'WestJet',
  AM: 'Aeroméxico',
  CM: 'Copa Airlines',
  LA: 'LATAM Airlines',
  AR: 'Aerolíneas Argentinas',
  AV: 'Avianca',
  JJ: 'TAM Airlines',
  G3: 'Gol Linhas Aéreas',
  AD: 'Azul Brazilian Airlines',
  QF: 'Qantas',
  JQ: 'Jetstar Airways',
  VA: 'Virgin Australia',
  NZ: 'Air New Zealand',
  FJ: 'Fiji Airways',
  PX: 'Air Niugini',
} as const

// Funkcje pomocnicze z typowaniem
const durationToMinutes = (duration: string): number => {
  try {
    const cleaned = duration.replace(/[hm]/g, '').trim()
    const parts = cleaned.split(' ')

    if (parts.length !== 2) return 0

    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0

    return hours * 60 + minutes
  } catch {
    return 0
  }
}

const parseISO8601Duration = (duration: string): string => {
  if (!duration || typeof duration !== 'string') return '0h 0m'

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/
  const matches = duration.match(regex)

  if (!matches) return '0h 0m'

  const hours = parseInt(matches[1] || '0')
  const minutes = parseInt(matches[2] || '0')

  return `${hours}h ${minutes}m`
}

const getAirlineName = (carrierCode: string): string => {
  if (!carrierCode || typeof carrierCode !== 'string') return 'Unknown Airline'
  return airlineMapping[carrierCode] || carrierCode
}

// Funkcja inicjalizacji z typowaniem z centralnych typów
const initializeFilters = (flights: Flight[]): void => {
  if (flights.length === 0) return

  // Ustaw zakres cen
  const prices = flights.map((flight) => flight.price).filter((price) => typeof price === 'number')
  if (prices.length > 0) {
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    filters.value.priceRange = [minPrice, maxPrice + 1]
  }

  // Ustaw maksymalny czas trwania
  const durations = flights
    .map((flight) => durationToMinutes(flight.duration))
    .filter((duration) => duration > 0)

  if (durations.length > 0) {
    filters.value.durationMax = Math.max(...durations)
  }

  // Ustaw dostępne linie lotnicze
  const uniqueAirlines = [...new Set(flights.map((flight) => flight.airlineCode))].filter(
    (code) => typeof code === 'string' && code.length > 0,
  )

  filters.value.airlines = []
  filters.value.availableAirlines = uniqueAirlines
}

// Computed properties z typowaniem z centralnych typów
const filteredFlights = computed<Flight[]>(() => {
  if (!hasSearched.value || allFlights.value.length === 0) return []

  return allFlights.value.filter((flight: Flight): boolean => {
    // Walidacja podstawowa z centralnych type guards
    if (!isValidFlight(flight)) {
      if (import.meta.env.DEV) {
        console.warn('FlightsPage: Pomijanie nieprawidłowego lotu:', flight)
      }
      return false
    }

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

    // Filtr linii lotniczych (wykluczenie zaznaczonych)
    if (filters.value.airlines.includes(flight.airlineCode)) {
      return false
    }

    return true
  })
})

const sortedFlights = computed<Flight[]>(() => {
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
      if (import.meta.env.DEV) {
        console.warn('FlightsPage: Nieznana opcja sortowania:', currentSort.value)
      }
      return flights
  }
})

// Computed properties dla statystyk
const flightStats = computed(() => ({
  total: allFlights.value.length,
  filtered: filteredFlights.value.length,
  averagePrice:
    filteredFlights.value.length > 0
      ? Math.round(
          filteredFlights.value.reduce((sum, flight) => sum + flight.price, 0) /
            filteredFlights.value.length,
        )
      : 0,
  cheapestPrice:
    filteredFlights.value.length > 0
      ? Math.min(...filteredFlights.value.map((flight) => flight.price))
      : 0,
  currency: allFlights.value.length > 0 ? allFlights.value[0].currency : 'EUR',
}))

// Reszta kodu pozostaje bez zmian...
// (mapAmadeusToFlight, handleSearch, event handlers, etc.)

// POPRAWKA: Główna funkcja wyszukiwania z typowaniem - obsługuje oba typy
const handleSearch = async (searchData: unknown): Promise<void> => {
  // Sprawdzenie czy to FlightSearchData czy FlightSearchParams
  let apiParams: FlightSearchParams

  if (searchData && typeof searchData === 'object') {
    const data = searchData as any

    // Jeśli ma pola FlightSearchData, konwertuj na FlightSearchParams
    if ('from' in data && 'to' in data) {
      apiParams = convertSearchDataToParams(data as FlightSearchData) // POPRAWKA: Teraz działa
      // Zapisz dane formularza dla template
      searchParams.value = data as FlightSearchData
    }
    // Jeśli ma już pola FlightSearchParams, użyj bezpośrednio
    else if ('origin' in data && 'destination' in data) {
      apiParams = data as FlightSearchParams
      // Konwertuj na FlightSearchData dla template
      searchParams.value = {
        from: data.origin,
        to: data.destination,
        departDate: data.departureDate,
        returnDate: data.returnDate,
        passengers: data.adults,
        tripType: data.returnDate ? 'roundtrip' : 'oneway',
      }
    } else {
      console.warn('FlightsPage: Nieprawidłowe parametry wyszukiwania:', searchData)
      error.value = 'Nieprawidłowe parametry wyszukiwania'
      return
    }
  } else {
    console.warn('FlightsPage: Nieprawidłowe parametry wyszukiwania:', searchData)
    error.value = 'Nieprawidłowe parametry wyszukiwania'
    return
  }

  // Walidacja z centralnych type guards
  if (!isValidFlightSearchParams(apiParams)) {
    console.warn('FlightsPage: Nieprawidłowe parametry API:', apiParams)
    error.value = 'Nieprawidłowe parametry wyszukiwania'
    return
  }

  isLoading.value = true
  error.value = null
  hasSearched.value = true
  showFilters.value = false

  try {
    // API call z typowaniem z centralnych typów
    const response: ApiResponse<AmadeusFlightOffer[]> = await searchFlights(apiParams)

    if (!response.success || !response.data) {
      // Proper error handling z centralnych type guards
      const errorMessage = isApiError(response.error)
        ? response.error.message
        : typeof response.error === 'string'
          ? response.error
          : 'Nie udało się pobrać danych o lotach'

      throw new Error(errorMessage)
    }

    // Mapowanie danych z walidacją z centralnych type guards
    const mappedFlights = response.data
      .map(mapAmadeusToFlight)
      .filter((flight): flight is Flight => flight !== null && isValidFlight(flight))

    if (mappedFlights.length === 0) {
      throw new Error('Nie znaleziono żadnych lotów dla podanych kryteriów')
    }

    allFlights.value = mappedFlights
    initializeFilters(mappedFlights)
  } catch (err: unknown) {
    console.error('FlightsPage: Błąd podczas wyszukiwania lotów:', err)

    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Wystąpił nieoczekiwany błąd podczas wyszukiwania lotów'
    }

    // Fallback do mock data w przypadku błędu API
    if (import.meta.env.DEV) {
      console.info('FlightsPage: Używanie mock data jako fallback')
      allFlights.value = mockFlights
      initializeFilters(mockFlights)
    }
  } finally {
    isLoading.value = false
  }
}

// Event handlers z typowaniem z centralnych typów
const handleFilterChange = (newFilters: unknown): void => {
  if (typeof newFilters === 'object' && newFilters !== null) {
    filters.value = { ...filters.value, ...(newFilters as Partial<FlightFilterState>) }
  }
}

const handleSortChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const newSort = target.value

  if (isValidFlightSortOption(newSort)) {
    currentSort.value = newSort
  }
}

const toggleFavorite = (id: string): void => {
  if (!id || typeof id !== 'string') return

  const index = favoriteFlights.value.indexOf(id)
  if (index > -1) {
    favoriteFlights.value.splice(index, 1)
  } else {
    favoriteFlights.value.push(id)
  }
}

const handleSelectFlight = (id: string): void => {
  if (!id || typeof id !== 'string') return

  if (import.meta.env.DEV) {
    console.info('FlightsPage: Wybrano lot o ID:', id)
  }

  alert(`Wybrano lot o ID: ${id}`)
}

const toggleMobileFilters = (): void => {
  showFilters.value = !showFilters.value
}

// Funkcja formatowania tekstu wyników
const formatResultsText = (count: number): string => {
  if (count === 0) return 'Brak lotów'
  if (count === 1) return 'Znaleziono 1 lot'
  if (count < 5) return `Znaleziono ${count} loty`
  return `Znaleziono ${count} lotów`
}

// POPRAWKA: Funkcja mapAmadeusToFlight - reszta implementacji
const mapAmadeusToFlight = (offer: AmadeusFlightOffer): Flight | null => {
  try {
    if (!offer.itineraries || offer.itineraries.length === 0) return null

    const itinerary = offer.itineraries[0]
    const segments = itinerary.segments

    if (!segments || segments.length === 0) return null

    const firstSegment = segments[0]
    const lastSegment = segments[segments.length - 1]

    const originalPrice = parseFloat(offer.price.total)
    if (isNaN(originalPrice) || originalPrice <= 0) return null

    // Helper function do mapowania kodu lotniska na miasto
    const getAirportCity = (airportCode: string): string => {
      // Mapowanie popularnych kodów lotnisk na miasta
      const airportCityMap: Record<string, string> = {
        WAW: 'Warszawa',
        KRK: 'Kraków',
        GDN: 'Gdańsk',
        WRO: 'Wrocław',
        KTW: 'Katowice',
        POZ: 'Poznań',
        SZZ: 'Szczecin',
        LUZ: 'Lublin',
        RZE: 'Rzeszów',
        BZG: 'Bydgoszcz',
        LCJ: 'Łódź',
        IEG: 'Zielona Góra',
        OSZ: 'Koszalin',

        // Międzynarodowe
        LHR: 'Londyn',
        CDG: 'Paryż',
        FRA: 'Frankfurt',
        AMS: 'Amsterdam',
        FCO: 'Rzym',
        MAD: 'Madryt',
        BCN: 'Barcelona',
        MUC: 'Monachium',
        VIE: 'Wiedeń',
        ZUR: 'Zurych',
        CPH: 'Kopenhaga',
        ARN: 'Sztokholm',
        OSL: 'Oslo',
        HEL: 'Helsinki',
        DUB: 'Dublin',
        BRU: 'Bruksela',
        LIS: 'Lizbona',
        ATH: 'Ateny',
        PRG: 'Praga',
        BUD: 'Budapeszt',
        BUH: 'Bukareszt',
        SOF: 'Sofia',
        ZAG: 'Zagrzeb',
        LJU: 'Lublana',
        VNO: 'Wilno',
        RIX: 'Ryga',
        TLL: 'Tallin',

        // USA
        JFK: 'Nowy Jork',
        LAX: 'Los Angeles',
        ORD: 'Chicago',
        MIA: 'Miami',
        DFW: 'Dallas',
        SFO: 'San Francisco',
        LAS: 'Las Vegas',
        SEA: 'Seattle',
        BOS: 'Boston',
        IAD: 'Washington',

        // Azja
        NRT: 'Tokio',
        ICN: 'Seul',
        PEK: 'Pekin',
        PVG: 'Szanghaj',
        HKG: 'Hongkong',
        SIN: 'Singapur',
        BKK: 'Bangkok',
        KUL: 'Kuala Lumpur',
        CGK: 'Dżakarta',
        MNL: 'Manila',

        // Australia
        SYD: 'Sydney',
        MEL: 'Melbourne',
        BNE: 'Brisbane',
        PER: 'Perth',
        AKL: 'Auckland',

        // Afryka
        CAI: 'Kair',
        JNB: 'Johannesburg',
        CPT: 'Kapsztad',
        ADD: 'Addis Abeba',
        LOS: 'Lagos',
        CAS: 'Casablanca',

        // Bliski Wschód
        DXB: 'Dubaj',
        DOH: 'Doha',
        AUH: 'Abu Zabi',
        KWI: 'Kuwejt',
        RUH: 'Rijad',
        TLV: 'Tel Awiw',
        IST: 'Stambuł',

        // Ameryka Południowa
        GRU: 'São Paulo',
        GIG: 'Rio de Janeiro',
        EZE: 'Buenos Aires',
        BOG: 'Bogota',
        LIM: 'Lima',
        SCL: 'Santiago',
        CCS: 'Caracas',
        UIO: 'Quito',
        ASU: 'Asunción',
        MVD: 'Montevideo',
      }

      return airportCityMap[airportCode] || airportCode
    }

    // Helper function do generowania URL logo linii lotniczej
    const getAirlineLogo = (carrierCode: string): string => {
      // Format: https://images.kiwi.com/airlines/64/{carrierCode}.png
      return `https://images.kiwi.com/airlines/64/${carrierCode}.png`
    }

    const mappedFlight: Flight = {
      id: offer.id,
      airline: getAirlineName(firstSegment.carrierCode),
      airlineCode: firstSegment.carrierCode,
      airlineLogo: getAirlineLogo(firstSegment.carrierCode),
      departureTime: firstSegment.departure.at.split('T')[1].substring(0, 5),
      arrivalTime: lastSegment.arrival.at.split('T')[1].substring(0, 5),
      departureAirport: firstSegment.departure.iataCode,
      arrivalAirport: lastSegment.arrival.iataCode,
      departureAirportCode: firstSegment.departure.iataCode,
      arrivalAirportCode: lastSegment.arrival.iataCode,
      departureCity: getAirportCity(firstSegment.departure.iataCode),
      arrivalCity: getAirportCity(lastSegment.arrival.iataCode),
      departureDate: firstSegment.departure.at.split('T')[0],
      arrivalDate: lastSegment.arrival.at.split('T')[0],
      duration: parseISO8601Duration(itinerary.duration),
      stops: segments.length - 1,
      stopLocations: segments
        .slice(1)
        .map((s) => s.departure.iataCode)
        .filter(Boolean),
      price: originalPrice,
      currency: offer.price.currency,
    }

    return isValidFlight(mappedFlight) ? mappedFlight : null
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('FlightsPage: Błąd mapowania lotu Amadeus:', error, offer)
    }
    return null
  }
}

// Lifecycle hook
onMounted((): void => {
  allFlights.value = mockFlights
  initializeFilters(mockFlights)
})

// Walidacja przy developmencie
if (import.meta.env.DEV) {
  mockFlights.forEach((flight, index) => {
    if (!isValidFlight(flight)) {
      console.warn(`FlightsPage: Nieprawidłowy lot w mock data na pozycji ${index}:`, flight)
    }
  })

  const missingAirlines = mockFlights
    .map((flight) => flight.airlineCode)
    .filter((code) => !airlineMapping[code])

  if (missingAirlines.length > 0) {
    console.warn('FlightsPage: Brakujące mapowania linii lotniczych:', [
      ...new Set(missingAirlines),
    ])
  }
}
</script>

<!-- Template pozostaje bez zmian -->
<template>
  <AppLayout>
    <!-- Sekcja wyszukiwania -->
    <section class="py-8 sm:py-12 px-4" role="search" aria-label="Sekcja wyszukiwania lotów">
      <SectionHeading
        title="Wyszukaj loty"
        subtitle="Znajdź najlepsze oferty lotów do wymarzonego miejsca"
        level="h1"
        aria-label="Nagłówek strony wyszukiwania lotów"
      />
      <FlightSearchForm @search="handleSearch" aria-label="Formularz wyszukiwania lotów" />
    </section>

    <!-- Results section -->
    <section
      v-if="hasSearched"
      class="py-8 sm:py-12 px-4"
      role="main"
      aria-label="Wyniki wyszukiwania lotów"
    >
      <!-- Results title -->
      <div class="p-3 sm:p-4 mb-6 sm:mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
          Loty z {{ searchParams?.from }} do {{ searchParams?.to }}
        </h2>
        <p class="text-gray-600 text-sm sm:text-base mt-1">
          {{ searchParams?.departDate }}
          <template v-if="searchParams?.tripType === 'roundtrip' && searchParams?.returnDate">
            - {{ searchParams.returnDate }}
          </template>
          · {{ searchParams?.passengers }}
          {{ searchParams?.passengers === 1 ? 'pasażer' : 'pasażerów' }}
        </p>

        <!-- Statystyki -->
        <div
          v-if="flightStats.filtered > 0"
          class="text-xs text-gray-500 mt-2 flex items-center gap-4"
          aria-label="Statystyki wyników"
        >
          <span>Średnia cena: {{ flightStats.averagePrice }} {{ flightStats.currency }}</span>
          <span>Najtańszy: {{ flightStats.cheapestPrice }} {{ flightStats.currency }}</span>
        </div>
      </div>

      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="flex justify-center items-center py-12"
        role="status"
        aria-label="Ładowanie wyników wyszukiwania"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span class="sr-only">Wyszukiwanie lotów...</span>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        role="alert"
        aria-label="Błąd wyszukiwania"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
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
        <!-- Mobile filter toggle -->
        <div class="lg:hidden p-2 mb-4">
          <button
            @click="toggleMobileFilters"
            class="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-md shadow-sm flex justify-between items-center transition-all hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            :aria-expanded="showFilters"
            aria-controls="flight-filters"
            :aria-label="showFilters ? 'Ukryj filtry lotów' : 'Pokaż filtry lotów'"
          >
            <span class="font-medium flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2 text-primary-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
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
              class="h-5 w-5 text-gray-400 transition-transform"
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

        <!-- Filters sidebar -->
        <aside
          id="flight-filters"
          :class="['lg:w-1/4', showFilters ? 'block' : 'hidden lg:block']"
          role="complementary"
          aria-label="Filtry lotów"
        >
          <FlightFilterSidebar
            v-if="hasSearched && allFlights.length > 0"
            :filters="filters"
            :min-price="Math.min(...allFlights.map((f) => f.price))"
            :max-price="Math.max(...allFlights.map((f) => f.price)) + 1"
            :max-duration="Math.max(...allFlights.map((f) => durationToMinutes(f.duration)))"
            :currency="allFlights[0]?.currency || 'EUR'"
            @update:filters="handleFilterChange"
            :class="{ block: showFilters, hidden: !showFilters }"
            class="lg:block"
            aria-label="Panel filtrów lotów"
          />
        </aside>

        <!-- Results list -->
        <main class="lg:w-3/4">
          <!-- Sort options -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="text-sm text-gray-600">
                {{ formatResultsText(sortedFlights.length) }}
              </span>
              <div class="flex items-center gap-2">
                <label for="sortSelect" class="text-sm text-gray-600 hidden sm:block">
                  Sortuj:
                </label>
                <select
                  id="sortSelect"
                  :value="currentSort"
                  @change="handleSortChange"
                  class="text-sm border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  aria-label="Wybierz sposób sortowania lotów"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Flights list -->
          <FlightsList
            :flights="
              sortedFlights.map((flight) => ({
                ...flight,
                airlineLogo: flight.airlineLogo || '/src/assets/mock/airlines/default.png',
              }))
            "
            :favorite-flights="favoriteFlights"
            @toggle-favorite="toggleFavorite"
            @select-flight="handleSelectFlight"
            :loading="isLoading"
            :empty-message="
              allFlights.length > 0
                ? 'Brak lotów spełniających wybrane kryteria. Spróbuj zmienić filtry.'
                : 'Brak dostępnych lotów dla podanych kryteriów.'
            "
            aria-label="Lista znalezionych lotów"
          />
        </main>
      </div>
    </section>

    <!-- Initial state - before search -->
    <section
      v-else
      class="py-12 sm:py-20 text-center"
      role="banner"
      aria-label="Stan początkowy przed wyszukiwaniem"
    >
      <div class="max-w-3xl mx-auto">
        <img
          src="/src/assets/images/hero/mainPage-hero-small.jpg"
          alt="Wyszukiwanie lotów - ilustracja samolotu"
          class="w-48 h-48 sm:w-64 sm:h-64 object-cover mx-auto rounded-full mb-8 sm:mb-10"
          loading="lazy"
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

<style scoped>
/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-transform {
    transition: none;
  }

  .animate-spin {
    animation: none;
  }
}

/* Focus styles */
button:focus-visible,
select:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>