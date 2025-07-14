// Serwis API Amadeus dla TravelMate z comprehensive typing
// Ten serwis łączy się z naszym serwerem proxy, który komunikuje się z API Amadeus

// POPRAWKA: Import typów i funkcji z podziałem na type imports i value imports
import type {
  ApiResponse,
  ApiError,
  ApiErrorType,
  FlightSearchParams,
  AmadeusFlightOffer,
  HttpMethod,
  RequestConfig,
} from '@/types'

// POPRAWKA: Import funkcji jako wartości (nie types)
import {
  isValidIATACode,
  isValidDate,
  isValidPassengerCount,
  isValidFlightSearchParams,
} from '@/types'

// Interface dla health check response - specyficzna dla tego serwisu
interface HealthCheckResponse {
  status: 'OK' | 'ERROR'
  timestamp: string
  services?: {
    amadeus?: boolean
    database?: boolean
  }
  version?: string
}

// Konfiguracja API
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// Type guard dla Amadeus flight offer - specyficzny dla tego serwisu
const isAmadeusFlightOffer = (offer: unknown): offer is AmadeusFlightOffer => {
  if (!offer || typeof offer !== 'object') return false

  const o = offer as Record<string, unknown>
  return !!(
    typeof o.id === 'string' &&
    o.price &&
    typeof o.price === 'object' &&
    Array.isArray(o.itineraries) &&
    o.itineraries.length > 0
  )
}

// Funkcja sanityzacji parametrów - używa centralnych type guards
const sanitizeSearchParams = (params: FlightSearchParams): FlightSearchParams => {
  return {
    origin: params.origin.trim().toUpperCase().substring(0, 3),
    destination: params.destination.trim().toUpperCase().substring(0, 3),
    departureDate: params.departureDate.trim(),
    returnDate: params.returnDate ? params.returnDate.trim() : null,
    adults: Math.max(1, Math.min(9, Math.floor(params.adults))),
  }
}

// Funkcja tworzenia błędu API - używa centralnych typów
const createApiError = (
  type: ApiErrorType,
  message: string,
  code?: string | number,
  details?: Record<string, unknown>,
): ApiError => ({
  type,
  message,
  code,
  details,
  timestamp: new Date().toISOString(),
  requestId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
})

// Funkcja opóźnienia dla retry logic
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

// Główna funkcja do wykonywania requestów z retry logic - używa centralnych typów
const makeRequest = async <T>(
  url: string,
  config: RequestConfig = { method: 'GET' },
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    timeout = API_CONFIG.DEFAULT_TIMEOUT,
    retries = API_CONFIG.MAX_RETRIES,
    abortSignal,
    headers = {},
  } = config

  let lastError: ApiError | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // Combine signals if provided
      const signal = abortSignal
        ? AbortSignal.any
          ? AbortSignal.any([abortSignal, controller.signal])
          : controller.signal
        : controller.signal

      const startTime = Date.now()

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        signal,
      })

      clearTimeout(timeoutId)
      const processingTime = Date.now() - startTime

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        throw createApiError(
          response.status >= 500 ? 'server' : 'validation',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          { url, method, responseBody: errorData },
        )
      }

      // Parse response
      const data = await response.json()

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw createApiError('server', 'Invalid response format from server', 'INVALID_RESPONSE', {
          url,
          method,
          responseType: typeof data,
        })
      }

      return {
        success: true,
        data: data.data || data,
        meta: {
          processingTime,
          requestId: data.requestId || crypto.randomUUID?.() || Date.now().toString(),
        },
      }
    } catch (error) {
      // POPRAWKA: Bezpieczne type casting dla Error objects
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = createApiError(
            abortSignal?.aborted ? 'abort' : 'timeout',
            abortSignal?.aborted ? 'Request was aborted' : 'Request timed out',
            'REQUEST_TIMEOUT',
            { url, method, timeout, attempt: attempt + 1 },
          )
        } else if (error.message.includes('fetch')) {
          lastError = createApiError('network', 'Network error occurred', 'NETWORK_ERROR', {
            url,
            method,
            originalError: error.message,
            attempt: attempt + 1,
          })
        } else {
          // POPRAWKA: Sprawdź czy error ma już strukturę ApiError
          if (
            typeof error === 'object' &&
            error !== null &&
            'type' in error &&
            'message' in error &&
            'timestamp' in error
          ) {
            lastError = error as ApiError
          } else {
            lastError = createApiError('server', error.message || 'Unknown error', 'SERVER_ERROR', {
              url,
              method,
              originalError: error.message,
              attempt: attempt + 1,
            })
          }
        }
      } else {
        lastError = createApiError('server', 'Unknown error occurred', 'UNKNOWN_ERROR', {
          url,
          method,
          error: String(error),
          attempt: attempt + 1,
        })
      }

      // Don't retry on certain error types
      if (lastError.type === 'validation' || lastError.type === 'abort') {
        break
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const retryDelay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt)
        await delay(retryDelay)

        if (import.meta.env.DEV) {
          console.warn(
            `API Request retry ${attempt + 1}/${retries} after ${retryDelay}ms:`,
            lastError,
          )
        }
      }
    }
  }

  return {
    success: false,
    error: lastError || createApiError('server', 'Request failed after all retries'),
  }
}

/**
 * Wyszukaj loty za pomocą proxy API Amadeus z comprehensive validation
 * Używa centralnych typów i walidatorów
 */
export const searchFlights = async (
  params: FlightSearchParams,
): Promise<ApiResponse<AmadeusFlightOffer[]>> => {
  try {
    // POPRAWKA: Type assertion na początku by uniknąć never inference
    const searchParams = params as FlightSearchParams

    // POPRAWKA: Alternative validation - sprawdź każde pole osobno
    const hasValidOrigin =
      typeof searchParams.origin === 'string' && searchParams.origin.length === 3
    const hasValidDestination =
      typeof searchParams.destination === 'string' && searchParams.destination.length === 3
    const hasValidDepartureDate =
      typeof searchParams.departureDate === 'string' && searchParams.departureDate.length > 0
    const hasValidAdults =
      typeof searchParams.adults === 'number' &&
      searchParams.adults >= 1 &&
      searchParams.adults <= 9
    const hasValidReturnDate =
      !searchParams.returnDate ||
      (typeof searchParams.returnDate === 'string' && searchParams.returnDate.length > 0)

    if (
      !hasValidOrigin ||
      !hasValidDestination ||
      !hasValidDepartureDate ||
      !hasValidAdults ||
      !hasValidReturnDate
    ) {
      return {
        success: false,
        error: createApiError('validation', 'Invalid flight search parameters', 'INVALID_PARAMS', {
          origin: hasValidOrigin ? 'valid' : 'invalid',
          destination: hasValidDestination ? 'valid' : 'invalid',
          departureDate: hasValidDepartureDate ? 'valid' : 'invalid',
          returnDate: hasValidReturnDate ? 'valid' : 'invalid',
          adults: hasValidAdults ? 'valid' : 'invalid',
          sameOriginDestination: searchParams.origin === searchParams.destination,
        }),
      }
    }

    // POPRAWKA: Dodatowa walidacja przez type guards jeśli są dostępne
    try {
      if (!isValidFlightSearchParams(searchParams)) {
        return {
          success: false,
          error: createApiError(
            'validation',
            'Flight search parameters failed advanced validation',
            'ADVANCED_VALIDATION_FAILED',
          ),
        }
      }
    } catch (validationError) {
      // Fallback if type guards are not working
      console.warn(
        'AmadeusApi: Type guard validation failed, using basic validation:',
        validationError,
      )
    }

    // Sanityzacja parametrów
    const sanitizedParams = sanitizeSearchParams(searchParams)

    // Zbuduj parametry zapytania
    const queryParams = new URLSearchParams({
      origin: sanitizedParams.origin,
      destination: sanitizedParams.destination,
      departureDate: sanitizedParams.departureDate,
      adults: sanitizedParams.adults.toString(),
    })

    // Dodaj opcjonalne parametry
    if (sanitizedParams.returnDate) {
      queryParams.append('returnDate', sanitizedParams.returnDate)
    }

    const url = `${API_CONFIG.BASE_URL}/flights/search?${queryParams.toString()}`

    // Wykonaj zapytanie
    const response = await makeRequest<AmadeusFlightOffer[]>(url, {
      method: 'GET',
    })

    // Walidacja odpowiedzi dla flight offers
    if (response.success && response.data) {
      const validOffers = Array.isArray(response.data)
        ? response.data.filter(isAmadeusFlightOffer)
        : []

      if (validOffers.length !== (response.data as unknown[]).length && import.meta.env.DEV) {
        console.warn('AmadeusApi: Some flight offers were filtered out due to invalid structure:', {
          total: (response.data as unknown[]).length,
          valid: validOffers.length,
        })
      }

      return {
        ...response,
        data: validOffers,
        meta: {
          ...response.meta,
          count: validOffers.length,
        },
      }
    }

    return response
  } catch (error) {
    console.error('AmadeusApi: Unexpected error in searchFlights:', error)

    return {
      success: false,
      error: createApiError(
        'server',
        'Unexpected error occurred while searching flights',
        'UNEXPECTED_ERROR',
        { originalError: String(error) },
      ),
    }
  }
}

/**
 * Sprawdź stan zdrowia serwera API z proper typing
 */
export const checkApiHealth = async (
  abortSignal?: AbortSignal,
): Promise<ApiResponse<HealthCheckResponse>> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/health`

    const response = await makeRequest<HealthCheckResponse>(url, {
      method: 'GET',
      timeout: 5000, // Shorter timeout for health check
      retries: 1, // Less retries for health check
      abortSignal,
    })

    // Additional validation for health check response
    if (response.success && response.data) {
      const healthData = response.data
      if (!healthData.status || !['OK', 'ERROR'].includes(healthData.status)) {
        return {
          success: false,
          error: createApiError(
            'server',
            'Invalid health check response format',
            'INVALID_HEALTH_RESPONSE',
            { receivedData: healthData },
          ),
        }
      }
    }

    return response
  } catch (error) {
    console.error('AmadeusApi: Unexpected error in checkApiHealth:', error)

    return {
      success: false,
      error: createApiError('network', 'Health check failed', 'HEALTH_CHECK_FAILED', {
        originalError: String(error),
      }),
    }
  }
}

/**
 * Helper function for checking if API is available
 */
export const isApiAvailable = async (abortSignal?: AbortSignal): Promise<boolean> => {
  const healthResponse = await checkApiHealth(abortSignal)
  return healthResponse.success && healthResponse.data?.status === 'OK'
}

/**
 * Helper function for getting API status with details
 */
export const getApiStatus = async (
  abortSignal?: AbortSignal,
): Promise<{
  available: boolean
  services?: Record<string, boolean>
  version?: string
  error?: ApiError
}> => {
  const healthResponse = await checkApiHealth(abortSignal)

  // POPRAWKA: Kompletna implementacja funkcji
  if (healthResponse.success && healthResponse.data) {
    return {
      available: healthResponse.data.status === 'OK',
      services: healthResponse.data.services,
      version: healthResponse.data.version,
    }
  }

  return {
    available: false,
    // POPRAWKA: Upewnij się że error jest typu ApiError lub undefined
    error:
      healthResponse.error && typeof healthResponse.error === 'object'
        ? healthResponse.error
        : undefined,
  }
}

// POPRAWKA: Export tylko typów specyficznych dla tego modułu
export type { HealthCheckResponse }

// Walidacja konfiguracji przy developmencie
if (import.meta.env.DEV) {
  if (!API_CONFIG.BASE_URL) {
    console.warn('AmadeusApi: Brak konfiguracji VITE_API_BASE_URL, używam domyślnej wartości')
  }

  if (API_CONFIG.DEFAULT_TIMEOUT < 5000) {
    console.warn('AmadeusApi: Bardzo krótki timeout, może powodować problemy z siecią')
  }

  // Test połączenia z API przy starcie (tylko w dev)
  isApiAvailable()
    .then((available) => {
      console.info('AmadeusApi: Status API:', available ? 'Dostępne' : 'Niedostępne')
    })
    .catch((error) => {
      console.warn('AmadeusApi: Nie można sprawdzić statusu API:', error)
    })
}

// Default export dla backward compatibility
export default {
  searchFlights,
  checkApiHealth,
  isApiAvailable,
  getApiStatus,
}
