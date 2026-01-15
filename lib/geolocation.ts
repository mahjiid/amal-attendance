export const AMAL_HQ_COORDS = {
  latitude: 9.0335,
  longitude: 7.3844,
};

export const MAX_DISTANCE_METERS = 1000; // 1000m radius

// Haversine formula to calculate distance
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function isWithinGeofence(lat: number, lon: number): boolean {
  const distance = calculateDistance(lat, lon, AMAL_HQ_COORDS.latitude, AMAL_HQ_COORDS.longitude);
  console.log(`User distance from HQ: ${distance.toFixed(2)}m`);
  return distance <= MAX_DISTANCE_METERS;
}
