let LocationModule = null;

async function getLocationModule() {
  if (LocationModule) return LocationModule;
  try {
    LocationModule = await import("expo-location");
    return LocationModule;
  } catch {
    return null;
  }
}

export async function requestLocationPermission() {
  const Location = await getLocationModule();
  if (!Location) return false;
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentLocation() {
  const Location = await getLocationModule();
  if (!Location) return null;

  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== "granted") {
    const granted = await requestLocationPermission();
    if (!granted) return null;
  }

  try {
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch {
    return null;
  }
}

export async function reverseGeocode(latitude, longitude) {
  const Location = await getLocationModule();
  if (!Location) return null;
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results?.[0]) {
      const { city, region, country } = results[0];
      return { city: city ?? region ?? "Desconocida", country: country ?? "" };
    }
    return null;
  } catch {
    return null;
  }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
