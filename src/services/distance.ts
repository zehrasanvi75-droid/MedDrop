/**
 * Geographical distance calculations using the Haversine formula
 */

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function estimateTravelTimeMinutes(
  distanceKm: number,
  mode: 'ground_ambulance' | 'air_evac' | 'tactical_drone' | 'all_terrain' = 'ground_ambulance'
): number {
  // Speed assumptions in mountainous/operational terrain:
  // Ground ambulance: ~45 km/h avg in hill sectors + 10 min prep
  // Air Evac helicopter: ~180 km/h + 15 min flight prep/spin-up
  // Tactical Drone: ~90 km/h + 5 min launch
  // All Terrain: ~35 km/h + 10 min prep
  switch (mode) {
    case 'air_evac':
      return Math.round(15 + (distanceKm / 180) * 60);
    case 'tactical_drone':
      return Math.round(5 + (distanceKm / 90) * 60);
    case 'all_terrain':
      return Math.round(10 + (distanceKm / 35) * 60);
    case 'ground_ambulance':
    default:
      return Math.round(10 + (distanceKm / 45) * 60);
  }
}
