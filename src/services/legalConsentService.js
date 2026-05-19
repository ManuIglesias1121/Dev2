import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "./supabase";
import { saveData, loadData, removeData } from "./storageService";

const PENDING_LEGAL_KEY = "pending_legal_consent";

// Versiones vigentes de los documentos legales.
// Subir el número cada vez que el contenido cambia materialmente.
// Si las versiones aceptadas por el usuario no coinciden con éstas,
// se le exige re-aceptar antes de seguir usando la app.
export const LEGAL_VERSIONS = {
  terms: "2026-05-03",       // LEGAL_TERMS.md "Última actualización"
  privacy: "2026-05-03",     // LEGAL_PRIVACY.md (cuando se actualice)
  community: "2026-05-03",   // LEGAL_COMMUNITY_GUIDELINES.md
};

export const MIN_AGE = 18;

export function calculateAge(birthDateIso) {
  if (!birthDateIso) return null;
  const today = new Date();
  const b = new Date(birthDateIso);
  if (isNaN(b.getTime())) return null;
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

export function isAdult(birthDateIso) {
  const age = calculateAge(birthDateIso);
  return age !== null && age >= MIN_AGE;
}

/**
 * Guarda la verificación de edad en profiles.
 * birthDateIso: 'YYYY-MM-DD'
 * method: 'self_declared' | 'id_document' | 'face_match'
 */
export async function recordAgeVerification(userId, birthDateIso, method = "self_declared") {
  if (!userId) throw new Error("userId requerido");
  if (!isAdult(birthDateIso)) throw new Error("Usuario menor de edad");

  const { error } = await supabase
    .from("profiles")
    .update({
      birth_date: birthDateIso,
      age_verified_at: new Date().toISOString(),
      age_verification_method: method,
    })
    .eq("id", userId);

  if (error) throw error;
  return true;
}

/**
 * Registra los consentimientos del usuario en consent_log + actualiza profiles.
 * consents: { terms: bool, privacy: bool, community: bool, analytics: bool, marketing: bool }
 *
 * Los tres primeros son obligatorios; si alguno es false, lanza error.
 */
export async function recordConsents(userId, consents, context = "signup") {
  if (!userId) throw new Error("userId requerido");
  if (!consents?.terms || !consents?.privacy || !consents?.community) {
    throw new Error("Faltan consentimientos obligatorios");
  }

  const appVersion = Constants.expoConfig?.version || "unknown";

  const logRow = {
    user_id: userId,
    terms_version: LEGAL_VERSIONS.terms,
    privacy_version: LEGAL_VERSIONS.privacy,
    community_version: LEGAL_VERSIONS.community,
    analytics_consent: !!consents.analytics,
    marketing_consent: !!consents.marketing,
    app_version: appVersion,
    platform: Platform.OS,
    acceptance_context: context,
    // ip_address y user_agent: el cliente RN no los conoce de forma fiable;
    // si en el futuro hay una Edge Function, completarlos server-side.
  };

  const { error: logError } = await supabase.from("consent_log").insert(logRow);
  if (logError) throw logError;

  // Snapshot de versiones aceptadas también en profiles para queries rápidas
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      terms_version_accepted: LEGAL_VERSIONS.terms,
      privacy_version_accepted: LEGAL_VERSIONS.privacy,
      community_version_accepted: LEGAL_VERSIONS.community,
    })
    .eq("id", userId);

  if (profileError) throw profileError;
  return true;
}

/**
 * Persiste el consentimiento + fecha de nacimiento para aplicarlos al
 * primer login (útil cuando signUp requiere confirmación por email y
 * no hay sesión activa todavía, por lo que RLS bloquea los inserts).
 */
export async function savePendingLegal(birthDateIso, consents) {
  return saveData(PENDING_LEGAL_KEY, {
    birthDateIso,
    consents,
    queuedAt: new Date().toISOString(),
  });
}

/**
 * Si hay datos legales pendientes, los aplica al userId provisto.
 * No-op silencioso si no hay nada pendiente o si falla la escritura
 * (mejor login degradado que login bloqueado — el AuthContext puede
 * volver a intentar más adelante o forzar re-aceptación en la UI).
 */
export async function applyPendingLegal(userId) {
  if (!userId) return false;
  const pending = await loadData(PENDING_LEGAL_KEY);
  if (!pending) return false;
  try {
    if (pending.birthDateIso) {
      await recordAgeVerification(userId, pending.birthDateIso, "self_declared");
    }
    if (pending.consents) {
      await recordConsents(userId, pending.consents, "signup");
    }
    await removeData(PENDING_LEGAL_KEY);
    return true;
  } catch (e) {
    console.warn("applyPendingLegal falló:", e?.message || e);
    return false;
  }
}

/**
 * ¿El usuario aceptó las versiones vigentes de los 3 documentos obligatorios?
 * Útil para forzar re-aceptación tras un cambio de términos.
 */
export async function hasAcceptedCurrentLegal(userId) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("terms_version_accepted, privacy_version_accepted, community_version_accepted, age_verified_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return false;
  return (
    !!data.age_verified_at &&
    data.terms_version_accepted === LEGAL_VERSIONS.terms &&
    data.privacy_version_accepted === LEGAL_VERSIONS.privacy &&
    data.community_version_accepted === LEGAL_VERSIONS.community
  );
}
