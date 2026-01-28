export interface CityCoordinate {
  lat: number;
  lng: number;
}

export const CITY_COORDINATES: Record<string, CityCoordinate> = {
  'Tokyo-Japan': { lat: 35.6762, lng: 139.6503 },
  'Kyoto-Japan': { lat: 35.0116, lng: 135.7681 },
  'Seoul-South Korea': { lat: 37.5665, lng: 126.9780 },
  'Bangkok-Thailand': { lat: 13.7563, lng: 100.5018 },
  'Singapore-Singapore': { lat: 1.3521, lng: 103.8198 },
  'Hong Kong-China': { lat: 22.3193, lng: 114.1694 },
  'Shanghai-China': { lat: 31.2304, lng: 121.4737 },
  'Beijing-China': { lat: 39.9042, lng: 116.4074 },
  'Bali-Indonesia': { lat: -8.3405, lng: 115.0920 },
  'Mumbai-India': { lat: 19.0760, lng: 72.8777 },
  'Paris-France': { lat: 48.8566, lng: 2.3522 },
  'London-United Kingdom': { lat: 51.5074, lng: -0.1278 },
  'Rome-Italy': { lat: 41.9028, lng: 12.4964 },
  'Barcelona-Spain': { lat: 41.3851, lng: 2.1734 },
  'Amsterdam-Netherlands': { lat: 52.3676, lng: 4.9041 },
  'Berlin-Germany': { lat: 52.5200, lng: 13.4050 },
  'Prague-Czech Republic': { lat: 50.0755, lng: 14.4378 },
  'Vienna-Austria': { lat: 48.2082, lng: 16.3738 },
  'Lisbon-Portugal': { lat: 38.7223, lng: -9.1393 },
  'Athens-Greece': { lat: 37.9838, lng: 23.7275 },
  'Reykjavik-Iceland': { lat: 64.1466, lng: -21.9426 },
  'Copenhagen-Denmark': { lat: 55.6761, lng: 12.5683 },
  'Stockholm-Sweden': { lat: 59.3293, lng: 18.0686 },
  'New York-United States': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles-United States': { lat: 34.0522, lng: -118.2437 },
  'San Francisco-United States': { lat: 37.7749, lng: -122.4194 },
  'Miami-United States': { lat: 25.7617, lng: -80.1918 },
  'New Orleans-United States': { lat: 29.9511, lng: -90.0715 },
  'Chicago-United States': { lat: 41.8781, lng: -87.6298 },
  'Toronto-Canada': { lat: 43.6532, lng: -79.3832 },
  'Vancouver-Canada': { lat: 49.2827, lng: -123.1207 },
  'Mexico City-Mexico': { lat: 19.4326, lng: -99.1332 },
  'Cancun-Mexico': { lat: 21.1619, lng: -86.8515 },
  'Havana-Cuba': { lat: 23.1136, lng: -82.3666 },
  'Buenos Aires-Argentina': { lat: -34.6037, lng: -58.3816 },
  'Rio de Janeiro-Brazil': { lat: -22.9068, lng: -43.1729 },
  'São Paulo-Brazil': { lat: -23.5505, lng: -46.6333 },
  'Lima-Peru': { lat: -12.0464, lng: -77.0428 },
  'Cusco-Peru': { lat: -13.5319, lng: -71.9675 },
  'Cartagena-Colombia': { lat: 10.3910, lng: -75.4794 },
  'Medellín-Colombia': { lat: 6.2476, lng: -75.5658 },
  'Santiago-Chile': { lat: -33.4489, lng: -70.6693 },
  'Cape Town-South Africa': { lat: -33.9249, lng: 18.4241 },
  'Marrakech-Morocco': { lat: 31.6295, lng: -7.9811 },
  'Cairo-Egypt': { lat: 30.0444, lng: 31.2357 },
  'Nairobi-Kenya': { lat: -1.2921, lng: 36.8219 },
  'Zanzibar-Tanzania': { lat: -6.1659, lng: 39.2026 },
  'Accra-Ghana': { lat: 5.6037, lng: -0.1870 },
  'Sydney-Australia': { lat: -33.8688, lng: 151.2093 },
  'Melbourne-Australia': { lat: -37.8136, lng: 144.9631 },
  'Auckland-New Zealand': { lat: -36.8485, lng: 174.7633 },
  'Queenstown-New Zealand': { lat: -45.0312, lng: 168.6626 },
  'Fiji-Fiji': { lat: -17.7134, lng: 178.0650 },
  'Dubai-United Arab Emirates': { lat: 25.2048, lng: 55.2708 },
  'Istanbul-Turkey': { lat: 41.0082, lng: 28.9784 },
  'Budapest-Hungary': { lat: 47.4979, lng: 19.0402 },
  'Dubrovnik-Croatia': { lat: 42.6507, lng: 18.0944 },
  'Santorini-Greece': { lat: 36.3932, lng: 25.4615 },
  'Amalfi-Italy': { lat: 40.6340, lng: 14.6027 },
  'Edinburgh-United Kingdom': { lat: 55.9533, lng: -3.1883 },
};

export function getCityCoordinates(city: string, country: string): CityCoordinate | undefined {
  const key = `${city}-${country}`;
  return CITY_COORDINATES[key];
}

export function getAllCityCoordinates(): Array<{ city: string; country: string; coordinates: CityCoordinate }> {
  return Object.entries(CITY_COORDINATES).map(([key, coordinates]) => {
    const [city, country] = key.split('-');
    return { city, country, coordinates };
  });
}
