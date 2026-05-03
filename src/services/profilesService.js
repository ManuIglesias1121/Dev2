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

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return fakeProfiles;
    }

    // Mapear campos de Supabase al formato que usa la app
    const real = data.map((p) => ({
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
