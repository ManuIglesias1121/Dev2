import { supabase } from "./supabase";
import { fakeProfiles } from "../data/fakeProfiles";

export async function getTherianProfiles(currentUserId) {
  try {
    let query = supabase
      .from("profiles")
      .select("id, display_name, biography, age, city, primary_theriotype, species_family, habitat, pack_role, avatar_url, is_premium, photos, exclusive_photos")
      .limit(50);

    if (currentUserId) {
      query = query.neq("id", currentUserId);
    }

    const excludedIds = currentUserId ? await getExcludedProfileIds(currentUserId) : new Set();

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return fakeProfiles;
    }

    const visible = excludedIds.size ? data.filter((p) => !excludedIds.has(p.id)) : data;

    // Mapear campos de Supabase al formato que usa la app
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
      exclusive_photos: p.exclusive_photos || [],
      isPremium: p.is_premium || false,
      distance: Math.floor(Math.random() * 50) + 1,
      compatibility: Math.floor(Math.random() * 30) + 70,
    }));

    // Mezclar perfiles reales con algunos falsos para que no quede vacío
    return [...real, ...fakeProfiles.slice(0, 3)];
  } catch {
    return fakeProfiles;
  }
}

// IDs de perfiles que NO deben aparecer en el feed de swipe:
// - ya les di like (likes.liker_id = me)
// - ya les mandé super match (super_matches.sender_id = me)
// - los bloqueé yo o ellos a mí (user_blocks en cualquier dirección)
// Los matches ya están cubiertos por likes (siempre existe el like previo).
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
