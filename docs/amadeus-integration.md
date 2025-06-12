# Amadeus API Integration

This document explains how to set up and use the Amadeus API proxy server for TravelMate.

## Prerequisites

1. Node.js (v14 or higher)
2. npm (v7 or higher)
3. Amadeus API credentials
   - Create an account at [Amadeus for Developers](https://developers.amadeus.com/)
   - Register an application to get your API key and secret

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory with the following content:

```
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here
PORT=3001
```

Replace `your_amadeus_api_key_here` and `your_amadeus_api_secret_here` with your actual Amadeus API credentials.

### 3. Start the Server

For development with auto-reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

### Flight Search

**Endpoint:** `GET /api/flights/search`

**Parameters:**
- `origin`: Origin city IATA code (e.g., "WAW")
- `destination`: Destination city IATA code (e.g., "BCN")
- `departureDate`: Departure date in YYYY-MM-DD format
- `returnDate`: Return date in YYYY-MM-DD format (optional, for round-trips)
- `adults`: Number of adult passengers

**Example Request:**
```
GET /api/flights/search?origin=WAW&destination=BCN&departureDate=2025-06-10&returnDate=2025-06-17&adults=2
```

**Response:**
The endpoint returns the raw response from the Amadeus API's `flightOffers` endpoint.

### Health Check

**Endpoint:** `GET /api/health`

Returns the current server status and timestamp.

## Integration with Frontend

To use this proxy in the frontend application, make API calls to the local server:

```javascript
// Example using fetch
const response = await fetch('http://localhost:3001/api/flights/search?origin=WAW&destination=BCN&departureDate=2025-06-10&adults=2');
const data = await response.json();
```

## Troubleshooting

- **CORS Issues**: By default, the server accepts requests from `http://localhost:3000`. If your frontend runs on a different port, update the CORS configuration in `proxy.js`.
- **API Rate Limits**: Be mindful of Amadeus API rate limits, especially if using a test key.
- **Invalid Parameters**: Check the validation errors returned by the API if your requests are being rejected.