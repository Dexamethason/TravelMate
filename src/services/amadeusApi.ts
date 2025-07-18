// Serwis API Amadeus dla TravelMate
// Ten serwis łączy się z naszym serwerem proxy, który komunikuje się z API Amadeus

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
}

interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Wyszukaj loty za pomocą proxy API Amadeus
 */
export async function searchFlights(params: FlightSearchParams): Promise<ApiResponse<any>> {
  try {
    // Zbuduj parametry zapytania
    const queryParams = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      adults: params.adults.toString()
    });

    // Dodaj opcjonalne parametry, jeśli są obecne
    if (params.returnDate) {
      queryParams.append('returnDate', params.returnDate);
    }

    // Wykonaj zapytanie do API
    const response = await fetch(`${API_BASE_URL}/flights/search?${queryParams.toString()}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Błąd podczas wyszukiwania lotów:', error);
    return {
      success: false,
      error: 'Nie udało się pobrać danych o lotach. Spróbuj ponownie później.'
    };
  }
}

// Search hoteli
export async function searchHotels(params: HotelSearchParams): Promise<ApiResponse<any>> {
  try {
    // Buduje parametry requestu
    const queryParams = new URLSearchParams({
      cityCode: params.cityCode,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults.toString()
    });

    const response = await fetch(`${API_BASE_URL}/hotels/search?${queryParams.toString()}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Błąd podczas wyszukiwania hoteli:', error);
    return {
      success: false,
      error: 'Nie udało się pobrać danych o hotelach. Spróbuj ponownie później.'
    };
  }
}


/**
 * Sprawdź stan zdrowia serwera API
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'OK';
  } catch (error) {
    console.error('Sprawdzenie stanu zdrowia API nie powiodło się:', error);
    return false;
  }
}

// Eksportuj serwis jako domyślny
export default {
  searchFlights,
  searchHotels,
  checkApiHealth
};