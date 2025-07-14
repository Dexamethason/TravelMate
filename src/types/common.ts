// Union types dla podstawowych wartości
export type Currency = 'PLN' | 'EUR' | 'USD' | 'GBP'
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'
export type ImagePath = `${string}.${ImageFormat}`

// Interface dla koordynat geograficznych
export interface Coordinates {
  lat: number
  lng: number
}

// Interface dla zakresu dat
export interface DateRange {
  checkIn: string
  checkOut: string
}

// Interface dla statystyk
export interface Statistics {
  total: number
  filtered?: number
  averagePrice?: number
  averageRating?: number
  currency?: Currency
}

// Type guards dla typów wspólnych
export const isValidCurrency = (currency: string | undefined): currency is Currency => {
  if (!currency || typeof currency !== 'string') return false
  const validCurrencies: Currency[] = ['PLN', 'EUR', 'USD', 'GBP']
  return validCurrencies.includes(currency as Currency)
}

export const isValidCoordinates = (coords: unknown): coords is Coordinates => {
  if (!coords || typeof coords !== 'object') return false

  const c = coords as Record<string, unknown>
  return !!(
    typeof c.lat === 'number' &&
    typeof c.lng === 'number' &&
    c.lat >= -90 &&
    c.lat <= 90 &&
    c.lng >= -180 &&
    c.lng <= 180
  )
}

export const isValidDateRange = (range: unknown): range is DateRange => {
  if (!range || typeof range !== 'object') return false

  const r = range as Record<string, unknown>
  return !!(
    typeof r.checkIn === 'string' &&
    typeof r.checkOut === 'string' &&
    new Date(r.checkIn) < new Date(r.checkOut)
  )
}

// Utility functions
export const formatPrice = (price: number, currency: Currency): string => {
  const currencySymbols: Record<Currency, string> = {
    PLN: 'zł',
    EUR: '€',
    USD: '$',
    GBP: '£',
  }

  return `${price.toFixed(2)} ${currencySymbols[currency]}`
}

export const formatCoordinates = (coords: Coordinates): string => {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
}

export const generateId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
}
