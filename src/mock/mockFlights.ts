export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  departureCity: string;
  departureAirport: string;
  departureAirportCode: string;
  departureTime: string;
  departureDate: string;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalAirportCode: string;
  arrivalTime: string;
  arrivalDate: string;
  duration: string; // Format: '2h 15m'
  stops: number;
  stopLocations: string[];
  price: number;
  currency: string;
}

export const mockFlights: Flight[] = [
  {    id: 'fl-001',
    airline: 'LOT Polish Airlines',
    airlineCode: 'LO',
    airlineLogo: '/src/assets/mock/airlines/lot.png',
    departureCity: 'Warszawa',
    departureAirport: 'Lotnisko Chopina',
    departureAirportCode: 'WAW',
    departureTime: '07:15',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'El Prat',
    arrivalAirportCode: 'BCN',
    arrivalTime: '10:10',
    arrivalDate: '2025-06-10',
    duration: '2h 55m',
    stops: 0,
    stopLocations: [],
    price: 420,
    currency: 'PLN'
  },
  {
    id: 'fl-002',
    airline: 'Ryanair',
    airlineCode: 'FR',
    airlineLogo: '/src/assets/mock/airlines/ryanair.png',
    departureCity: 'Warszawa',
    departureAirport: 'Modlin',
    departureAirportCode: 'WMI',
    departureTime: '11:35',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'Girona',
    arrivalAirportCode: 'GRO',
    arrivalTime: '14:25',
    arrivalDate: '2025-06-10',
    duration: '2h 50m',
    stops: 0,
    stopLocations: [],
    price: 310,
    currency: 'PLN'
  },
  {
    id: 'fl-003',
    airline: 'Lufthansa',
    airlineCode: 'LH',
    airlineLogo: '/src/assets/mock/airlines/lufthansa.png',
    departureCity: 'Warszawa',
    departureAirport: 'Lotnisko Chopina',
    departureAirportCode: 'WAW',
    departureTime: '09:20',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'El Prat',
    arrivalAirportCode: 'BCN',
    arrivalTime: '15:35',
    arrivalDate: '2025-06-10',
    duration: '6h 15m',
    stops: 1,
    stopLocations: ['Frankfurt (FRA)'],
    price: 780,
    currency: 'PLN'
  },
  {
    id: 'fl-004',
    airline: 'Wizz Air',
    airlineCode: 'W6',
    airlineLogo: '/src/assets/mock/airlines/wizzair.png',
    departureCity: 'Warszawa',
    departureAirport: 'Lotnisko Chopina',
    departureAirportCode: 'WAW',
    departureTime: '16:45',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'El Prat',
    arrivalAirportCode: 'BCN',
    arrivalTime: '19:50',
    arrivalDate: '2025-06-10',
    duration: '3h 05m',
    stops: 0,
    stopLocations: [],
    price: 375,
    currency: 'PLN'
  },
  {
    id: 'fl-005',    airline: 'KLM',
    airlineCode: 'KL',
    airlineLogo: '/src/assets/mock/airlines/default.png',
    departureCity: 'Warszawa',
    departureAirport: 'Lotnisko Chopina',
    departureAirportCode: 'WAW',
    departureTime: '06:05',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'El Prat',
    arrivalAirportCode: 'BCN',
    arrivalTime: '13:25',
    arrivalDate: '2025-06-10',
    duration: '7h 20m',
    stops: 1,
    stopLocations: ['Amsterdam (AMS)'],
    price: 840,
    currency: 'PLN'
  },
  {
    id: 'fl-006',    airline: 'Air France',
    airlineCode: 'AF',
    airlineLogo: '/src/assets/mock/airlines/default.png',
    departureCity: 'Warszawa',
    departureAirport: 'Lotnisko Chopina',
    departureAirportCode: 'WAW',
    departureTime: '14:30',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'El Prat',
    arrivalAirportCode: 'BCN',
    arrivalTime: '22:15',
    arrivalDate: '2025-06-10',
    duration: '7h 45m',
    stops: 1,
    stopLocations: ['Paris (CDG)'],
    price: 920,
    currency: 'PLN'
  },
  {
    id: 'fl-007',    airline: 'EasyJet',
    airlineCode: 'U2',
    airlineLogo: '/src/assets/mock/airlines/default.png',
    departureCity: 'Kraków',
    departureAirport: 'Balice',
    departureAirportCode: 'KRK',
    departureTime: '13:10',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'El Prat',
    arrivalAirportCode: 'BCN',
    arrivalTime: '16:05',
    arrivalDate: '2025-06-10',
    duration: '2h 55m',
    stops: 0,
    stopLocations: [],
    price: 340,
    currency: 'PLN'
  },
  {
    id: 'fl-008',    airline: 'Swiss',
    airlineCode: 'LX',
    airlineLogo: '/src/assets/mock/airlines/default.png',
    departureCity: 'Warszawa',
    departureAirport: 'Lotnisko Chopina',
    departureAirportCode: 'WAW',
    departureTime: '07:25',
    departureDate: '2025-06-10',
    arrivalCity: 'Barcelona',
    arrivalAirport: 'El Prat',
    arrivalAirportCode: 'BCN',
    arrivalTime: '14:40',
    arrivalDate: '2025-06-10',
    duration: '7h 15m',
    stops: 1,
    stopLocations: ['Zurich (ZRH)'],
    price: 860,
    currency: 'PLN'
  }
];

export const popularDestinations = [
  { code: 'BCN', name: 'Barcelona' },
  { code: 'LHR', name: 'Londyn' },
  { code: 'CDG', name: 'Paryż' },
  { code: 'FCO', name: 'Rzym' },
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'IST', name: 'Stambuł' },
  { code: 'DXB', name: 'Dubaj' },
  { code: 'JFK', name: 'Nowy Jork' },
  { code: 'BKK', name: 'Bangkok' },
  { code: 'SIN', name: 'Singapur' },
];

export const popularOrigins = [
  { code: 'WAW', name: 'Warszawa' },
  { code: 'KRK', name: 'Kraków' },
  { code: 'GDN', name: 'Gdańsk' },
  { code: 'WRO', name: 'Wrocław' },
  { code: 'POZ', name: 'Poznań' },
  { code: 'KTW', name: 'Katowice' },
];
