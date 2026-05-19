import { supabase } from "./supabase";

// Registra un like. Si existe el like recíproco, el trigger crea el match automáticamente.
// Devuelve { liked: true, isMatch: boolean }
export async function sendLike({ likerId, likedId }) {
  if (!likerId || !likedId) throw new Error("Faltan datos");
  if (likerId === likedId) throw new Error("No podés likearte a vos");

  const { error } = await supabase
    .from("likes")
    .insert({ liker_id: likerId, liked_id: likedId });

  if (error && error.code !== "23505") throw error;

  const [ua, ub] = likerId < likedId ? [likerId, likedId] : [likedId, likerId];
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a_id", ua)
    .eq("user_b_id", ub)
    .maybeSingle();

  return { liked: true, isMatch: !!match };
}

// Lista los matches mutuos del usuario (con info del otro perfil)
export async function fetchMatches(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("matches")
    .select("id, user_a_id, user_b_id, created_at")
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const otherIds = data.map((m) => (m.user_a_id === userId ? m.user_b_id : m.user_a_id));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos, exclusive_photos, is_premium, primary_theriotype, city, age")
    .in("id", otherIds);

  return data.map((m) => {
    const otherId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
    const profile = profiles?.find((p) => p.id === otherId);
    return {
      id: m.id,
      created_at: m.created_at,
      other: {
        id: otherId,
        display_name: profile?.display_name || "Therian",
        avatar: profile?.avatar_url || profile?.photos?.[0] || null,
        photos: profile?.photos || [],
        exclusive_photos: profile?.exclusive_photos || [],
        isPremium: profile?.is_premium || false,
        primary_theriotype: profile?.primary_theriotype || "Wolf",
        city: profile?.city || null,
        age: profile?.age || null,
      },
    };
  });
}

// Eliminar match (unmatch). Borra el row de matches; los likes quedan para evitar re-match accidental
export async function deleteMatch(matchId) {
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw error;
}

// Realtime: nuevo match (cuando alguien que te dio like recibe tu like, o vice versa)
export function subscribeToMatches(userId, onNewMatch) {
  const channel = supabase
    .channel(`matches:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "matches",
        filter: `user_a_id=eq.${userId}`,
      },
      (payload) => onNewMatch(payload.new)
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "matches",
        filter: `user_b_id=eq.${userId}`,
      },
      (payload) => onNewMatch(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
