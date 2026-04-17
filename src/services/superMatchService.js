import { fakeSuperMatches } from "../data/fakeSuperMatches";

/**
 * Servicio escalable para enviar Super Matches.
 * Hoy funciona localmente.
 * Mañana puede conectarse a Supabase o tu backend real.
 */
export async function sendSuperMatch(sender, receiver, message = "Hola, me encantaría conectar contigo 🌟") {
  // Simulamos una llamada de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newMatch = {
    id: Date.now(),
    sender: {
      display_name: sender.display_name,
      avatar: sender.avatar,
      primary_theriotype: sender.primary_theriotype,
    },
    receiverId: receiver.id,
    message,
    created_at: new Date().toISOString(),
  };

  // Agregamos el SuperMatch localmente
  fakeSuperMatches.unshift(newMatch);

  return newMatch;
}
