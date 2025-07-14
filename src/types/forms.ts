// Union types dla notyfikacji
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// POPRAWKA: Specyficzne typy dla TopFilterBar
export type TopFilterBarSortOption =
  | 'popular'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'rating-asc'

// POPRAWKA: Generic interface dla opcji sortowania
export interface SortOption<T = string> {
  value: T
  label: string
}

// Interface dla walidacji formularza
export interface FormValidation {
  isValid: boolean
  errors?: Record<string, string>
  error?: string
}

// Interface dla notyfikacji
export interface NotificationState {
  show: boolean
  message: string
  type: NotificationType
}

// Interface dla danych wyszukiwania zakwaterowań
export interface SearchFormData {
  location: string
  checkInDate: string
  checkOutDate: string
  guests: {
    persons: number
    beds: number
    display: string
  }
}

// Interface dla opcji gości
export interface GuestOption {
  persons: number
  beds: number
  display: string
  value: string
}

// Interface dla filtrów wyszukiwania
export interface SearchFilters {
  city: string
  dates: {
    checkIn: string
    checkOut: string
  }
  guests: string
}

// Type guards dla formularzy
export const isValidNotificationType = (type: string): type is NotificationType => {
  return ['success', 'error', 'warning', 'info'].includes(type)
}

export const isValidTopFilterBarSortOption = (option: string): option is TopFilterBarSortOption => {
  return ['popular', 'price-asc', 'price-desc', 'rating-desc', 'rating-asc'].includes(option)
}

export const isValidSearchFormData = (data: unknown): data is SearchFormData => {
  if (!data || typeof data !== 'object') return false

  const d = data as Record<string, unknown>
  return !!(
    typeof d.location === 'string' &&
    typeof d.checkInDate === 'string' &&
    typeof d.checkOutDate === 'string' &&
    d.guests &&
    typeof d.guests === 'object'
  )
}

export const isValidSearchFilters = (filters: unknown): filters is SearchFilters => {
  if (!filters || typeof filters !== 'object') return false

  const f = filters as Record<string, unknown>
  return !!(
    typeof f.city === 'string' &&
    f.dates &&
    typeof f.dates === 'object' &&
    typeof f.guests === 'string'
  )
}

// Utility functions dla walidacji
export const isValidEmailAddress = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone.trim()) && phone.replace(/\D/g, '').length >= 9
}

export const sanitizeText = (text: string, maxLength: number = 100): string => {
  return text.replace(/[<>]/g, '').trim().substring(0, maxLength)
}
