const express = require('express');
const cors = require('cors');
const Amadeus = require('amadeus');
const dotenv = require('dotenv');

// ładowanie zmiennych z .env   
dotenv.config();

// init expressa
const app = express();
const PORT = process.env.PORT || 3001;

//  middleware
app.use(express.json());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Init  Amadeusa
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

// Helper do walidacji parametrów wyszukiwania lotów
const validateFlightSearchParams = (params) => {
  const { origin, destination, departureDate, adults } = params;
  const errors = [];

  // Sprawdź, czy wymagane parametry są obecne
  if (!origin) errors.push('Pole "Początek podróży" jest wymagane');
  if (!destination) errors.push('Pole "Cel podróży" jest wymagane');
  if (!departureDate) errors.push('Pole "Data wylotu" jest wymagane');
  if (!adults) errors.push('Pole "Liczba dorosłych" jest wymagane');

  // Podstawowe walidacje formatów
  if (origin && !/^[A-Z]{3}$/.test(origin)) errors.push('Pole "Początek podróży" powinno być 3-literowym kodem IATA');
  if (destination && !/^[A-Z]{3}$/.test(destination)) errors.push('Pole "Cel podróży" powinno być 3-literowym kodem IATA');

  // Walidacja formatu daty (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (departureDate && !dateRegex.test(departureDate)) errors.push('Pole "Data wylotu" powinno być w formacie YYYY-MM-DD');
  if (params.returnDate && !dateRegex.test(params.returnDate)) errors.push('Pole "Data powrotu" powinno być w formacie YYYY-MM-DD');

  // Walidacja liczby dorosłych (powinna być liczbą)
  if (adults && isNaN(parseInt(adults))) errors.push('Pole "Liczba dorosłych" powinno być poprawną liczbą');

  return errors;
};

// Walidacja parametrów dla wyszukiwania hoteli
const validateHotelSearchParams = (params) => {
  const errors = [];
  
  const { cityCode, checkInDate, checkOutDate, adults } = params;
  
  // Wymagane parametry
  if (!cityCode) errors.push('Kod miasta (cityCode) jest wymagany');
  if (!checkInDate) errors.push('Data zameldowania (checkInDate) jest wymagana');
  if (!checkOutDate) errors.push('Data wymeldowania (checkOutDate) jest wymagana');
  if (!adults) errors.push('Liczba dorosłych (adults) jest wymagana');

  // Podstawowe walidacje formatów
  if (cityCode && !/^[A-Z]{3}$/.test(cityCode)) errors.push('Kod miasta powinien być 3-literowym kodem IATA');
  if (checkInDate && !/^\d{4}-\d{2}-\d{2}$/.test(checkInDate)) errors.push('Data zameldowania powinna być w formacie YYYY-MM-DD');
  if (checkOutDate && !/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) errors.push('Data wymeldowania powinna być w formacie YYYY-MM-DD');
  if (adults && (isNaN(adults) || adults < 1 || adults > 8)) errors.push('Liczba dorosłych powinna być liczbą między 1 a 8');

  // Walidacja dat
  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) errors.push('Data zameldowania nie może być wcześniejsza niż dzisiaj');
    if (checkOut <= checkIn) errors.push('Data wymeldowania musi być późniejsza niż data zameldowania');
  }

  return errors;
};

// Endpoint do wyszukiwania hoteli z ofertami
app.get('/api/hotels/search', async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate, adults } = req.query;

    // Walidacja parametrów wejściowych
    const validationErrors = validateHotelSearchParams(req.query);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        errors: validationErrors 
      });
    }

    console.log('Wyszukiwanie hoteli z parametrami:', { cityCode, checkInDate, checkOutDate, adults });

    // KROK 1: Pobiera listę hoteli w mieście
    const hotelsResponse = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: cityCode
    });

    if (!hotelsResponse.data || hotelsResponse.data.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // KROK 2: Pobiera oferty dla każdego hotelu (ograniczone do pierwszych 20 na ten moment)
    const hotels = hotelsResponse.data.slice(0, 20);
    const hotelOffers = [];

    for (const hotel of hotels) {
      try {
        // Pobierz oferty dla konkretnego hotelu
        const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
          hotelIds: hotel.hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          adults: adults
        });

        if (offersResponse.data && offersResponse.data.length > 0) {
          // Dodaj podstawowe informacje o hotelu do ofert
          const hotelWithOffers = {
            hotelId: hotel.hotelId,
            name: hotel.name,
            address: hotel.address,
            geoCode: hotel.geoCode,
            distance: hotel.distance,
            offers: offersResponse.data
          };
          hotelOffers.push(hotelWithOffers);
        }
      } catch (offerError) {
        console.warn(`Błąd pobierania ofert dla hotelu ${hotel.hotelId}:`, offerError.message);
      }
    }

    // Zwróć wyniki
    res.json({
      success: true,
      data: hotelOffers
    });

  } catch (error) {
    console.error('Błąd podczas wyszukiwania hoteli:', error);

    // Obsługa błędów Amadeusa
    if (error.response && error.response.result) {
      return res.status(error.response.statusCode).json({
        success: false,
        error: error.response.result
      });
    }

    // Ogólna obsługa błędów
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać ofert hotelowych'
    });
  }
});

// Endpoint testowy dla hoteli (z przykładowymi danymi)
app.get('/api/hotels/test', async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate, adults } = req.query;

    console.log('Test wyszukiwania hoteli z parametrami:', { cityCode, checkInDate, checkOutDate, adults });

    // Przykładowe dane testowe
    const testHotelOffers = [
      {
        hotelId: 'TEST001',
        name: 'Test Hotel Rome',
        address: {
          lines: ['Via Test 123'],
          cityName: 'Rome',
          countryCode: 'IT'
        },
        geoCode: {
          latitude: 41.9028,
          longitude: 12.4964
        },
        distance: {
          value: 2.5,
          unit: 'KM'
        },
        offers: [
          {
            hotel: {
              rating: 4,
              amenities: ['WIFI', 'RESTAURANT', 'PARKING']
            },
            offers: [
              {
                price: {
                  total: '120.00',
                  currency: 'EUR'
                },
                room: {
                  type: 'STANDARD',
                  typeEstimated: {
                    category: 'STANDARD_ROOM'
                  }
                }
              }
            ]
          }
        ]
      },
      {
        hotelId: 'TEST002',
        name: 'Test Hotel Central',
        address: {
          lines: ['Via Central 456'],
          cityName: 'Rome',
          countryCode: 'IT'
        },
        geoCode: {
          latitude: 41.9028,
          longitude: 12.4964
        },
        distance: {
          value: 1.2,
          unit: 'KM'
        },
        offers: [
          {
            hotel: {
              rating: 5,
              amenities: ['WIFI', 'RESTAURANT', 'PARKING', 'POOL', 'GYM']
            },
            offers: [
              {
                price: {
                  total: '250.00',
                  currency: 'EUR'
                },
                room: {
                  type: 'DELUXE',
                  typeEstimated: {
                    category: 'DELUXE_ROOM'
                  }
                }
              }
            ]
          }
        ]
      }
    ];

    res.json({
      success: true,
      data: testHotelOffers
    });

  } catch (error) {
    console.error('Błąd podczas testowego wyszukiwania hoteli:', error);
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać testowych danych hotelowych'
    });
  }
});

// Endpoint do wyszukiwania lotów
app.get('/api/flights/search', async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults } = req.query;

    // Walidacja parametrów wejściowych
    const validationErrors = validateFlightSearchParams(req.query);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        errors: validationErrors 
      });
    }
    const searchParams = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      adults: parseInt(adults)
    };

    // Dodaj datę powrotu, jeśli jest obecna (dla lotów w obie strony)
    if (returnDate) {
      searchParams.returnDate = returnDate;
    }

    console.log('Wyszukiwanie lotów z parametrami:', searchParams);

    // Wywołanie API Amadeus
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);

    // Zwróć surowe dane odpowiedzi
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Błąd podczas wyszukiwania lotów:', error);

    // Obsługa błędów API Amadeus
    if (error.response && error.response.result) {
      return res.status(error.response.statusCode).json({
        success: false,
        error: error.response.result
      });
    }

    // Ogólna obsługa błędów
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać ofert lotów'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Amadeus API proxy available at http://localhost:${PORT}/api/flights/search`);
});