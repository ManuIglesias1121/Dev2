import { supabase } from "./supabase";

// Enviar un super match (lo doy yo a alguien)
// Si ya existe uno para esta persona, actualiza el timestamp en vez de duplicar
export async function sendSuperMatch({ senderId, receiverId, message }) {
  if (!senderId || !receiverId) throw new Error("Faltan datos");
  if (senderId === receiverId) throw new Error("No podés super-matchearte a vos");

  const { data, error } = await supabase
    .from("super_matches")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message: message || null,
    })
    .select()
    .single();

  // Si ya existe (UNIQUE constraint violation), intentar refrescar timestamp
  // (puede fallar si la RLS no permite update al sender, no es crítico)
  if (error?.code === "23505") {
    try {
      const { data: updated, error: updateError } = await supabase
        .from("super_matches")
        .update({ created_at: new Date().toISOString(), is_read: false, message: message || null })
        .eq("sender_id", senderId)
        .eq("receiver_id", receiverId)
        .select()
        .single();
      if (updateError) {
        console.warn("No se pudo refrescar timestamp:", updateError.message);
        return null; // tratamos como "ya existía", el caller muestra "Ya enviado"
      }
      return updated;
    } catch (e) {
      console.warn("Error en update silencioso:", e?.message);
      return null;
    }
  }

  if (error) throw error;
  return data;
}

// Listar super matches recibidos (con info del sender)
export async function fetchReceivedSuperMatches(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("super_matches")
    .select("id, sender_id, message, is_read, created_at")
    .eq("receiver_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const senderIds = data.map((sm) => sm.sender_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos, primary_theriotype")
    .in("id", senderIds);

  return data.map((sm) => {
    const profile = profiles?.find((p) => p.id === sm.sender_id);
    return {
      id: sm.id,
      sender: {
        id: sm.sender_id,
        display_name: profile?.display_name || "Therian",
        avatar: profile?.avatar_url || profile?.photos?.[0] || null,
        photos: profile?.photos || [],
        primary_theriotype: profile?.primary_theriotype || "Wolf",
      },
      message: sm.message,
      is_read: sm.is_read,
      created_at: sm.created_at,
    };
  });
}

// Listar super matches enviados (los que yo di)
export async function fetchSentSuperMatches(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("super_matches")
    .select("id, receiver_id, message, created_at")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const receiverIds = data.map((sm) => sm.receiver_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos, primary_theriotype")
    .in("id", receiverIds);

  return data.map((sm) => {
    const profile = profiles?.find((p) => p.id === sm.receiver_id);
    return {
      id: sm.id,
      sender: {
        id: sm.receiver_id,
        display_name: profile?.display_name || "Therian",
        avatar: profile?.avatar_url || profile?.photos?.[0] || null,
        photos: profile?.photos || [],
        primary_theriotype: profile?.primary_theriotype || "Wolf",
      },
      message: sm.message,
      created_at: sm.created_at,
    };
  });
}

// Marcar como leído
export async function markSuperMatchAsRead(id) {
  await supabase
    .from("super_matches")
    .update({ is_read: true })
    .eq("id", id);
}

// Eliminar super match
export async function deleteSuperMatchById(id) {
  const { error } = await supabase.from("super_matches").delete().eq("id", id);
  if (error) throw error;
}

// Suscripción Realtime: cuando alguien me manda un super match
export function subscribeToSuperMatches(userId, onNewSuperMatch) {
  const channel = supabase
    .channel(`super_matches:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "super_matches",
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => onNewSuperMatch(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
