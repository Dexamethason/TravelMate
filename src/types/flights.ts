import type { ApiResponse } from './api'
import type { Coordinates } from './common'

// Union types dla lotów
export type TripType = 'oneway' | 'roundtrip'
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'
export type FlightSortOption = 'price-asc' | 'price-desc' | 'duration-asc'

// PRZENIESIONE Z filters.ts - Typy filtrów lotów
export interface FlightFilterState {
  priceRange: [number, number]
  durationMax: number
  stops: {
    direct: boolean
    oneStop: boolean
    multiStop: boolean
  }
  airlines: string[]
  availableAirlines?: string[]
}

// Alias dla kompatybilności
export type FlightFilters = FlightFilterState

// Główny interfejs Flight
export interface Flight {
  id: string
  airline: string
  airlineCode: string
  airlineLogo?: string
  departureCity: string
  departureAirport: string
  departureAirportCode: string
  departureTime: string
  departureDate: string
  arrivalCity: string
  arrivalAirport: string
  arrivalAirportCode: string
  arrivalTime: string
  arrivalDate: string
  duration: string
  stops: number
  stopLocations: string[]
  price: number
  currency: string
}

// Type dla mapowania linii lotniczych
export interface AirlineMapping {
  [code: string]: string
}

// Interface dla parametrów wyszukiwania lotów
export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string | null
  adults: number
}

// Interface dla danych formularza wyszukiwania lotów
export interface FlightSearchData {
  from: string
  to: string
  departDate: string
  returnDate: string | null
  passengers: number
  tripType: TripType
}

// Interfaces dla Amadeus API
export interface FlightPrice {
  total: string
  currency: string
  base?: string
  fees?: Array<{
    amount: string
    type: string
  }>
}

export interface Aircraft {
  code: string
}

export interface Operating {
  carrierCode: string
}

export interface FlightSegment {
  carrierCode: string
  number: string
  departure: {
    iataCode: string
    at: string
    terminal?: string
  }
  arrival: {
    iataCode: string
    at: string
    terminal?: string
  }
  aircraft?: Aircraft
  operating?: Operating
}

export interface FlightItinerary {
  duration: string
  segments: FlightSegment[]
}

export interface AmadeusFlightOffer {
  id: string
  price: FlightPrice
  itineraries: FlightItinerary[]
  validatingAirlineCodes: string[]
}

// PRZENIESIONE Z filters.ts - Type guards dla filtrów lotów
export const isValidFlightSortOption = (option: string): option is FlightSortOption => {
  return ['price-asc', 'price-desc', 'duration-asc'].includes(option)
}

export const isValidFlightFilterState = (filters: unknown): filters is FlightFilterState => {
  if (!filters || typeof filters !== 'object') return false

  const f = filters as Record<string, unknown>
  return (
    Array.isArray(f.priceRange) &&
    f.priceRange.length === 2 &&
    typeof f.priceRange[0] === 'number' &&
    typeof f.priceRange[1] === 'number' &&
    typeof f.durationMax === 'number' &&
    typeof f.stops === 'object' &&
    f.stops !== null &&
    Array.isArray(f.airlines)
  )
}

// PRZENIESIONE Z filters.ts - Utility functions dla filtrów lotów
export const createDefaultFlightFilters = (): FlightFilterState => ({
  priceRange: [0, 0],
  durationMax: 24 * 60, // 24 hours in minutes
  stops: {
    direct: true,
    oneStop: true,
    multiStop: true,
  },
  airlines: [],
  availableAirlines: [],
})

// Type guards dla lotów
export const isValidFlight = (flight: unknown): flight is Flight => {
  if (!flight || typeof flight !== 'object') return false

  const f = flight as Record<string, unknown>
  return !!(
    typeof f.id === 'string' &&
    typeof f.airline === 'string' &&
    typeof f.airlineCode === 'string' &&
    typeof f.departureCity === 'string' &&
    typeof f.departureAirport === 'string' &&
    typeof f.departureAirportCode === 'string' &&
    typeof f.departureTime === 'string' &&
    typeof f.departureDate === 'string' &&
    typeof f.arrivalCity === 'string' &&
    typeof f.arrivalAirport === 'string' &&
    typeof f.arrivalAirportCode === 'string' &&
    typeof f.arrivalTime === 'string' &&
    typeof f.arrivalDate === 'string' &&
    typeof f.duration === 'string' &&
    typeof f.stops === 'number' &&
    Array.isArray(f.stopLocations) &&
    typeof f.price === 'number' &&
    typeof f.currency === 'string'
  )
}

export const isValidTripType = (type: string): type is TripType => {
  return ['oneway', 'roundtrip'].includes(type)
}

export const isValidIATACode = (code: string): boolean => {
  return typeof code === 'string' && /^[A-Z]{3}$/.test(code.trim().toUpperCase())
}

export const isValidDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return !isNaN(date.getTime()) && date >= today && /^\d{4}-\d{2}-\d{2}$/.test(dateString)
}

export const isValidPassengerCount = (count: number): boolean => {
  return Number.isInteger(count) && count >= 1 && count <= 9
}

export const isValidFlightSearchParams = (params: unknown): params is FlightSearchParams => {
  if (!params || typeof params !== 'object') return false

  const p = params as Record<string, unknown>
  return !!(
    typeof p.origin === 'string' &&
    typeof p.destination === 'string' &&
    typeof p.departureDate === 'string' &&
    typeof p.adults === 'number' &&
    p.adults >= 1 &&
    p.adults <= 9
  )
}

// Utility functions
export const formatFlightDate = (dateString: string): string => {
  if (!dateString || !isValidDate(dateString)) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatFlightTime = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') return ''

  const timeRegex = /^\d{2}:\d{2}$/
  return timeRegex.test(timeString) ? timeString : ''
}

export const calculateFlightDuration = (departureTime: string, arrivalTime: string): string => {
  try {
    const departure = new Date(`2000-01-01T${departureTime}:00`)
    const arrival = new Date(`2000-01-01T${arrivalTime}:00`)

    const diffMs = arrival.getTime() - departure.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  } catch {
    return '0h 0m'
  }
}

export const convertSearchDataToParams = (data: FlightSearchData): FlightSearchParams => {
  return {
    origin: data.from,
    destination: data.to,
    departureDate: data.departDate,
    returnDate: data.returnDate,
    adults: data.passengers,
  }
}

// POPRAWKA: Funkcja convertParamsToSearchData z lepszym typowaniem
export const convertParamsToSearchData = (
  params: FlightSearchParams,
  tripType: TripType = 'oneway',
): FlightSearchData => {
  return {
    from: params.origin,
    to: params.destination,
    departDate: params.departureDate,
    returnDate: params.returnDate || null, // POPRAWKA: explicit null handling
    passengers: params.adults,
    tripType,
  }
}
