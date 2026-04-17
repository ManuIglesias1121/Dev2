import { fakeProfiles } from "../data/fakeProfiles";

/**
 * Servicio escalable para obtener perfiles.
 * Hoy devuelve datos locales.
 * Mañana puede conectarse a Supabase, Firebase o tu backend propio.
 */
export async function getTherianProfiles() {
  // Simulamos una llamada de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  return fakeProfiles;
}
