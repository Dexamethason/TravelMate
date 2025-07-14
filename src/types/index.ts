// Re-export wszystkich typów bez filters.ts

// Common types
export * from './common'
export * from './api'

// Flights types (zawiera teraz typy filtrów lotów)
export type {
  Flight,
  FlightSearchParams,
  FlightSearchData,
  FlightFilterState,
  FlightFilters, // Alias dla kompatybilności
  FlightSortOption,
  AmadeusFlightOffer,
  FlightItinerary,
  FlightSegment,
  FlightPrice,
  Aircraft,
  Operating,
  TripType,
  CabinClass,
  AirlineMapping,
} from './flights'

export {
  isValidIATACode,
  isValidDate,
  isValidPassengerCount,
  isValidFlightSearchParams,
  isValidFlight,
  isValidTripType,
  isValidFlightSortOption,
  isValidFlightFilterState,
  createDefaultFlightFilters,
  formatFlightDate,
  formatFlightTime,
  calculateFlightDuration,
  convertSearchDataToParams,
  convertParamsToSearchData,
} from './flights'

// Accommodation types (zawiera teraz typy filtrów zakwaterowań)
export type {
  Accommodation,
  AccommodationFeatures,
  AccommodationSortOption,
  AccommodationFilterState,
} from './accommodation'

export {
  isValidAccommodation,
  hasValidCoordinates,
  isValidAccommodationSortOption,
  isValidAccommodationFilterState,
  createDefaultAccommodationFilters,
  formatAccommodationPrice,
  getAccommodationTypeLabel,
  calculateAccommodationScore,
} from './accommodation'

// Forms types (zawiera teraz SortOption i SearchFilters)
export type {
  FormValidation,
  NotificationState,
  NotificationType,
  SearchFormData,
  GuestOption,
  SearchFilters,
  SortOption,
  TopFilterBarSortOption, // DODANE
} from './forms'

export {
  isValidNotificationType,
  isValidSearchFormData,
  isValidSearchFilters,
  isValidTopFilterBarSortOption, // DODANE
  isValidEmailAddress,
  isValidPhoneNumber,
  sanitizeText,
} from './forms'

// POPRAWKA: Usunięto nieistniejące pliki typów
// Dodaj te linie ponownie gdy pliki będą istnieć:

// Router types
// export * from './router'

// Navigation types
// export * from './navigation'

// UI types
// export * from './ui'
