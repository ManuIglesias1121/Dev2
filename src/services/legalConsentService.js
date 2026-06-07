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

// Helpers de cálculo de edad — se conservan por si la verificación reforzada
// vuelve a habilitarse (DNI / face match) en el futuro.
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
 * Registra que el usuario confirmó por checkbox que es mayor de edad.
 * No pide fecha de nacimiento — vale como autodeclaración con timestamp.
 */
export async function recordAgeConfirmation(userId) {
  if (!userId) throw new Error("userId requerido");

  const { error } = await supabase
    .from("profiles")
    .update({
      age_verified_at: new Date().toISOString(),
      age_verification_method: "self_declared_checkbox",
    })
    .eq("id", userId);

  if (error) throw error;
  return true;
}

/**
 * Registra los consentimientos del usuario en consent_log + actualiza profiles.
 * consents: { terms, privacy, community, analytics?, marketing? }
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
  };

  const { error: logError } = await supabase.from("consent_log").insert(logRow);
  if (logError) throw logError;

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
 * Persiste el consentimiento para aplicarlo al primer login
 * (útil cuando signUp requiere confirmación por email y todavía no hay
 * sesión activa: RLS bloquearía los inserts).
 *
 * Acepta { consents } u (legacy) { birthDateIso, consents }.
 */
export async function savePendingLegal(payload) {
  // Compat con la firma vieja: savePendingLegal(birthDateIso, consents)
  if (typeof payload === "string" || payload == null) {
    const birthDateIso = payload;
    const consents = arguments[1] || null;
    return saveData(PENDING_LEGAL_KEY, {
      birthDateIso,
      consents,
      queuedAt: new Date().toISOString(),
    });
  }
  return saveData(PENDING_LEGAL_KEY, {
    ...payload,
    queuedAt: new Date().toISOString(),
  });
}

/**
 * Si hay datos legales pendientes, los aplica al userId provisto.
 * No-op silencioso si no hay nada pendiente o si falla la escritura.
 */
export async function applyPendingLegal(userId) {
  if (!userId) return false;
  const pending = await loadData(PENDING_LEGAL_KEY);
  if (!pending) return false;
  try {
    // Si vino con birthDateIso del flujo viejo, lo usamos. Si no, registramos
    // la confirmación por checkbox.
    if (pending.birthDateIso) {
      await supabase
        .from("profiles")
        .update({
          birth_date: pending.birthDateIso,
          age_verified_at: new Date().toISOString(),
          age_verification_method: "self_declared",
        })
        .eq("id", userId);
    } else {
      await recordAgeConfirmation(userId);
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
