import type { Coordinates, Currency } from './common'

// PRZENIESIONE Z filters.ts - Union types dla sortowania
export type AccommodationSortOption =
  | 'recommended'
  | 'price-desc'
  | 'price-asc'
  | 'rating-desc'
  | 'rating-asc'
  | 'stars-desc'
  | 'stars-asc'

// PRZENIESIONE Z filters.ts - Interface dla filtrów zakwaterowań
export interface AccommodationFilterState {
  budget: number
  features: string[]
  stars: number[]
  location: string[]
}

// Interface główny dla zakwaterowania
export interface Accommodation {
  id: string
  name: string
  title?: string
  image?: string
  type: 'hotel' | 'apartment' | 'hostel' | 'guesthouse' | 'villa'
  address: string
  city: string
  country: string
  coordinates?: Coordinates
  price: number
  currency: Currency
  rating?: number
  stars: number
  reviewCount?: number
  images?: string[]
  amenities?: string[]
  description?: string
  availability: boolean
  checkInTime?: string
  checkOutTime?: string
  cancellationPolicy?: string
  distanceFromCenter?: number
  features?: AccommodationFeatures
}

// Interface dla udogodnień zakwaterowania
export interface AccommodationFeatures {
  breakfast?: boolean
  freeCancel?: boolean
  parking?: boolean
  wifi?: boolean
  pool?: boolean
  gym?: boolean
  airCon?: boolean
  spa?: boolean
  restaurant?: boolean
  roomService?: boolean
  petFriendly?: boolean
}

// PRZENIESIONE Z filters.ts - Type guards dla filtrów zakwaterowań
export const isValidAccommodationSortOption = (
  option: string,
): option is AccommodationSortOption => {
  const validOptions: AccommodationSortOption[] = [
    'recommended',
    'price-desc',
    'price-asc',
    'rating-desc',
    'rating-asc',
    'stars-desc',
    'stars-asc',
  ]
  return validOptions.includes(option as AccommodationSortOption)
}

export const isValidAccommodationFilterState = (
  filters: unknown,
): filters is AccommodationFilterState => {
  if (!filters || typeof filters !== 'object') return false

  const f = filters as Record<string, unknown>
  return (
    typeof f.budget === 'number' &&
    Array.isArray(f.features) &&
    Array.isArray(f.stars) &&
    Array.isArray(f.location)
  )
}

// PRZENIESIONE Z filters.ts - Utility functions dla filtrów zakwaterowań
export const createDefaultAccommodationFilters = (): AccommodationFilterState => ({
  budget: 1000,
  features: [],
  stars: [],
  location: [],
})

// Type guards dla zakwaterowań
export const isValidAccommodation = (accommodation: unknown): accommodation is Accommodation => {
  if (!accommodation || typeof accommodation !== 'object') return false

  const a = accommodation as Record<string, unknown>
  return !!(
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    typeof a.type === 'string' &&
    typeof a.address === 'string' &&
    typeof a.city === 'string' &&
    typeof a.country === 'string' &&
    typeof a.price === 'number' &&
    typeof a.currency === 'string' &&
    typeof a.stars === 'number' &&
    typeof a.availability === 'boolean'
  )
}

export const hasValidCoordinates = (accommodation: Accommodation): boolean => {
  return !!(
    accommodation.coordinates &&
    typeof accommodation.coordinates.lat === 'number' &&
    typeof accommodation.coordinates.lng === 'number' &&
    accommodation.coordinates.lat >= -90 &&
    accommodation.coordinates.lat <= 90 &&
    accommodation.coordinates.lng >= -180 &&
    accommodation.coordinates.lng <= 180
  )
}

// Utility functions
export const formatAccommodationPrice = (price: number, currency: Currency): string => {
  const currencySymbols: Record<Currency, string> = {
    PLN: 'zł',
    EUR: '€',
    USD: '$',
    GBP: '£',
  }

  return `${price.toFixed(2)} ${currencySymbols[currency]}`
}

export const getAccommodationTypeLabel = (type: Accommodation['type']): string => {
  const typeLabels: Record<Accommodation['type'], string> = {
    hotel: 'Hotel',
    apartment: 'Apartament',
    hostel: 'Hostel',
    guesthouse: 'Pensjonat',
    villa: 'Willa',
  }

  return typeLabels[type] || type
}

export const calculateAccommodationScore = (accommodation: Accommodation): number => {
  let score = 0

  // Bazowa ocena
  if (accommodation.rating) {
    score += accommodation.rating * 20
  }

  // Bonus za gwiazdki
  score += accommodation.stars * 10

  // Bonus za liczbę recenzji
  if (accommodation.reviewCount) {
    score += Math.min(accommodation.reviewCount / 10, 20)
  }

  // Bonus za dostępność
  if (accommodation.availability) {
    score += 10
  }

  // Bonus za udogodnienia
  if (accommodation.features) {
    const featuresCount = Object.values(accommodation.features).filter(Boolean).length
    score += featuresCount * 2
  }

  return score
}
