import { supabase } from "./supabase";
import { fakeProfiles } from "../data/fakeProfiles";

/**
 * Trae el feed de swipe.
 *
 * Reglas de geografía (estilo Pasaporte de Tinder):
 *  - Free: solo perfiles de SU MISMA ciudad (userCity). Si no tiene ciudad
 *    asignada, devolvemos sin filtro (degradado para no dejar el feed vacío).
 *  - Premium: por defecto también su ciudad, pero puede pasar `targetCity`
 *    para "viajar" y ver perfiles de otra zona.
 *
 * Compatibilidad con llamadores viejos: si se pasa un string, lo tratamos como
 * `currentUserId` y sin filtro de ciudad (modo legacy, sin pasaporte).
 */
export async function getTherianProfiles(opts) {
  const params = typeof opts === "string" || opts == null
    ? { currentUserId: opts, userCity: null, isPremium: false, targetCity: null }
    : opts;

  const { currentUserId, userCity, isPremium, targetCity } = params;

  // Ciudad efectiva por la que filtrar el feed
  const cityFilter = isPremium && targetCity
    ? targetCity
    : (!isPremium ? (userCity || null) : null);

  try {
    let query = supabase
      .from("profiles")
      .select("id, display_name, biography, age, city, primary_theriotype, species_family, habitat, pack_role, avatar_url, is_premium, photos")
      .limit(50);

    if (currentUserId) {
      query = query.neq("id", currentUserId);
    }

    // Filtro por ciudad (case-insensitive, sin distinción de tildes triviales).
    // Supabase no normaliza acentos en `ilike`, pero al menos cubre mayúsculas.
    if (cityFilter) {
      query = query.ilike("city", cityFilter);
    }

    const excludedIds = currentUserId ? await getExcludedProfileIds(currentUserId) : new Set();

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Si filtramos por ciudad y no hay resultados, devolvemos vacío con
      // bandera para que la UI pueda mostrar "no hay nadie cerca todavía".
      // Si NO filtramos (free sin ciudad), caemos a fakeProfiles para no dejar el feed muerto.
      if (cityFilter) return [];
      return fakeProfiles;
    }

    const visible = excludedIds.size ? data.filter((p) => !excludedIds.has(p.id)) : data;

    const real = visible.map((p) => ({
      id: p.id,
      display_name: p.display_name || "Therian",
      name: p.display_name || "Therian",
      biography: p.biography || "",
      bio: p.biography || "",
      age: p.age || 25,
      city: p.city || "",
      primary_theriotype: p.primary_theriotype || "Wolf",
      species_family: p.species_family || "",
      habitat: p.habitat || "",
      pack_role: p.pack_role || "",
      avatar: p.avatar_url || (p.photos?.[0]) || null,
      photos: p.photos?.length ? p.photos : p.avatar_url ? [p.avatar_url] : [],
      isPremium: p.is_premium || false,
      distance: Math.floor(Math.random() * 50) + 1,
      compatibility: Math.floor(Math.random() * 30) + 70,
    }));

    // Si filtramos por ciudad, NO mezclamos fakeProfiles (rompería el filtro).
    if (cityFilter) return real;

    return [...real, ...fakeProfiles.slice(0, 3)];
  } catch {
    return cityFilter ? [] : fakeProfiles;
  }
}

async function getExcludedProfileIds(currentUserId) {
  const excluded = new Set();
  try {
    const [likes, superMatches, blocksOut, blocksIn] = await Promise.all([
      supabase.from("likes").select("liked_id").eq("liker_id", currentUserId),
      supabase.from("super_matches").select("receiver_id").eq("sender_id", currentUserId),
      supabase.from("user_blocks").select("blocked_id").eq("blocker_id", currentUserId),
      supabase.from("user_blocks").select("blocker_id").eq("blocked_id", currentUserId),
    ]);
    (likes.data || []).forEach((r) => r.liked_id && excluded.add(r.liked_id));
    (superMatches.data || []).forEach((r) => r.receiver_id && excluded.add(r.receiver_id));
    (blocksOut.data || []).forEach((r) => r.blocked_id && excluded.add(r.blocked_id));
    (blocksIn.data || []).forEach((r) => r.blocker_id && excluded.add(r.blocker_id));
  } catch (e) {
    console.warn("No se pudieron cargar exclusiones del feed:", e?.message);
  }
  return excluded;
}
