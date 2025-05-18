const express = require('express');
const cors = require('cors');
const Amadeus = require('@amadeus/amadeus');
const dotenv = require('dotenv');

// ładowanie zmiennych z .env   
dotenv.config();

// init expressa
const app = express();
const PORT = process.env.PORT || 3001;

//  middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
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
    const response = await amadeus.shopping.flightOffers.get(searchParams);

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