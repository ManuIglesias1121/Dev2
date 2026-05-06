import { Linking, Platform } from "react-native";
import { supabase } from "./supabase";

// Recursos de crisis (Argentina)
export const CRISIS_RESOURCES = [
  {
    id: "144",
    name: "Línea 144",
    description: "Violencia de género — 24/7 gratuita y confidencial",
    phone: "144",
    icon: "🚨",
    priority: 1,
  },
  {
    id: "137",
    name: "Línea 137",
    description: "Víctimas de violencia familiar y sexual — 24/7",
    phone: "137",
    icon: "🆘",
    priority: 1,
  },
  {
    id: "102",
    name: "Línea 102",
    description: "Niñez y adolescencia — 24/7",
    phone: "102",
    icon: "👶",
    priority: 2,
  },
  {
    id: "145",
    name: "Línea 145",
    description: "Trata de personas",
    phone: "145",
    icon: "⛓️",
    priority: 2,
  },
  {
    id: "cas",
    name: "Centro de Asistencia al Suicida",
    description: "Crisis emocional — 24/7",
    phone: "135",
    icon: "💚",
    priority: 1,
  },
  {
    id: "salud-mental",
    name: "Salud Mental Responde",
    description: "Apoyo en salud mental",
    phone: "08002221717",
    icon: "🧠",
    priority: 2,
  },
  {
    id: "stopncii",
    name: "StopNCII.org",
    description: "Bloqueo de imágenes íntimas no consentidas",
    url: "https://stopncii.org",
    icon: "🛡️",
    priority: 1,
  },
  {
    id: "100diversidad",
    name: "100% Diversidad y Derechos",
    description: "Asesoría LGBTQI+ Argentina",
    url: "https://100porciento.wordpress.com",
    icon: "🏳️‍🌈",
    priority: 2,
  },
];

// Tips de cita segura
export const SAFE_DATE_TIPS = [
  {
    icon: "📍",
    title: "Lugar público",
    description: "La primera cita siempre en lugar público, a la luz del día.",
  },
  {
    icon: "🚗",
    title: "Tu propio transporte",
    description: "Llegá y volvé por tus medios. No aceptes que te pasen a buscar.",
  },
  {
    icon: "👥",
    title: "Avisá a alguien",
    description: "Compartí ubicación y datos del encuentro con un contacto de confianza.",
  },
  {
    icon: "🍷",
    title: "Cuidá tu bebida",
    description: "Nunca dejes tu bebida sin supervisar.",
  },
  {
    icon: "💸",
    title: "Sin dinero",
    description: "Nunca envíes dinero. Es señal segura de estafa.",
  },
  {
    icon: "🚪",
    title: "Salida disponible",
    description: "Tenés derecho a irte en cualquier momento. Confiá en tu instinto.",
  },
];

// Iniciar llamada al número de emergencia
export async function callEmergency(phone) {
  const url = Platform.OS === "ios" ? `telprompt:${phone}` : `tel:${phone}`;
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.warn("No se pudo iniciar la llamada:", e);
  }
}

export async function openUrl(url) {
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.warn("No se pudo abrir el link:", e);
  }
}

// Bloquear a un usuario (bidireccional)
export async function blockUser(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return;
  const { error } = await supabase.from("user_blocks").insert({
    blocker_id: currentUserId,
    blocked_id: targetUserId,
  });
  if (error && error.code !== "23505") throw error; // 23505 = ya existe
}

// Desbloquear
export async function unblockUser(currentUserId, targetUserId) {
  await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", currentUserId)
    .eq("blocked_id", targetUserId);
}

// Reportar a un usuario
export async function reportUser({ reporterId, targetUserId, reason, details, evidenceUrls }) {
  if (!reporterId || !targetUserId || !reason) {
    throw new Error("Faltan datos para el reporte");
  }
  const { error } = await supabase.from("user_reports").insert({
    reporter_id: reporterId,
    target_user_id: targetUserId,
    reason,
    details: details || null,
    evidence_urls: evidenceUrls || null,
  });
  if (error) throw error;
}

// Categorías de reporte
export const REPORT_REASONS = [
  { id: "harassment", label: "Acoso o amenazas", severity: "high" },
  { id: "ncii", label: "Compartió fotos íntimas sin consentimiento", severity: "critical" },
  { id: "doxxing", label: "Doxxing / outing (reveló mi identidad)", severity: "critical" },
  { id: "fake_profile", label: "Perfil falso o suplantación", severity: "high" },
  { id: "scam", label: "Pidió dinero o intentó estafar", severity: "high" },
  { id: "minor", label: "Sospecho que es menor de edad", severity: "critical" },
  { id: "hate_speech", label: "Discriminación o discurso de odio", severity: "high" },
  { id: "spam", label: "Spam o mensajes masivos", severity: "low" },
  { id: "inappropriate_content", label: "Contenido inapropiado", severity: "medium" },
  { id: "other", label: "Otro motivo", severity: "medium" },
];

// Contar reportes recientes contra un usuario (para auto-suspensión)
export async function countRecentReportsAgainst(userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("user_reports")
    .select("id", { count: "exact", head: true })
    .eq("target_user_id", userId)
    .gte("created_at", sevenDaysAgo);
  if (error) return 0;
  return count || 0;
}
