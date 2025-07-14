// Union types dla API
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type ApiErrorType = 'network' | 'validation' | 'server' | 'amadeus' | 'timeout' | 'abort'

// Interface dla błędów API
export interface ApiError {
  type: ApiErrorType
  message: string
  code?: string | number
  details?: Record<string, unknown>
  timestamp: string
  requestId?: string
}

// Interface dla odpowiedzi API z proper typing
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError | string
  meta?: {
    count?: number
    requestId?: string
    processingTime?: number
  }
}

// Interface dla request configuration
export interface RequestConfig {
  method: HttpMethod
  timeout?: number
  retries?: number
  abortSignal?: AbortSignal
  headers?: Record<string, string>
}

// Type guards dla API
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'message' in error && 'type' in error
}

export const isApiResponse = <T>(response: unknown): response is ApiResponse<T> => {
  return typeof response === 'object' && response !== null && 'success' in response
}

export const isSuccessfulApiResponse = <T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { data: T } => {
  return response.success && response.data !== undefined
}

// POPRAWKA: Dodanie helper function dla tworzenia błędów API
export const createApiError = (
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
