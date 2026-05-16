import { supabase } from "./supabase";

// Registra una visita: si ya existe, incrementa el contador y actualiza last_visit_at
export async function trackVisit({ visitorId, visitedId }) {
  if (!visitorId || !visitedId) return;
  if (visitorId === visitedId) return; // No registrar visitas propias

  // Intentar actualizar primero
  const { data: existing } = await supabase
    .from("profile_visits")
    .select("id, visit_count")
    .eq("visitor_id", visitorId)
    .eq("visited_id", visitedId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("profile_visits")
      .update({
        visit_count: (existing.visit_count || 1) + 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("profile_visits")
      .insert({ visitor_id: visitorId, visited_id: visitedId });
  }
}

// Borra una entrada de visita (el usuario visitado oculta a un visitante)
export async function deleteVisit(visitId) {
  const { error } = await supabase
    .from("profile_visits")
    .delete()
    .eq("id", visitId);
  if (error) throw error;
}

// Trae los visitantes con info del perfil
export async function fetchVisitors(userId) {
  if (!userId) return [];

  const { data: visits, error } = await supabase
    .from("profile_visits")
    .select("id, visitor_id, visit_count, first_visit_at, last_visit_at")
    .eq("visited_id", userId)
    .order("last_visit_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  if (!visits || visits.length === 0) return [];

  const visitorIds = visits.map((v) => v.visitor_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos, primary_theriotype, age, city, is_premium")
    .in("id", visitorIds);

  return visits.map((v) => {
    const p = profiles?.find((pr) => pr.id === v.visitor_id);
    return {
      id: v.id,
      visitor_id: v.visitor_id,
      visit_count: v.visit_count,
      last_visit_at: v.last_visit_at,
      first_visit_at: v.first_visit_at,
      display_name: p?.display_name || "Therian",
      avatar: p?.avatar_url || p?.photos?.[0] || null,
      photos: p?.photos || [],
      primary_theriotype: p?.primary_theriotype || "Wolf",
      age: p?.age || null,
      city: p?.city || null,
      isPremium: p?.is_premium || false,
    };
  });
}
