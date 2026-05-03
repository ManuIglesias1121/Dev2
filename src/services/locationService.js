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
  // Intentar primero con Nominatim (OpenStreetMap) — más preciso para ciudades
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "es", "User-Agent": "TherianMatch/1.0" } }
    );
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      // Prioridad: city > town > village > municipality > county > state
      const city =
        a.city || a.town || a.village || a.municipality ||
        a.city_district || a.suburb || a.county || a.state;
      return { city: city || "Desconocida", country: a.country || "" };
    }
  } catch {}

  // Fallback con expo-location
  const Location = await getLocationModule();
  if (!Location) return null;
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results?.[0]) {
      const { city, district, subregion, region, country } = results[0];
      return {
        city: city || district || subregion || region || "Desconocida",
        country: country || "",
      };
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
