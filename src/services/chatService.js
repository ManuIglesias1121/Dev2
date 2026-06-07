import { supabase } from "./supabase";

// Helper: ordenar UUIDs para que la conversación sea siempre la misma
function orderUsers(a, b) {
  return a < b ? [a, b] : [b, a];
}

// Obtiene la conversación entre dos usuarios o la crea si no existe
export async function getOrCreateConversation(userA, userB) {
  if (!userA || !userB) throw new Error("Falta userA o userB");
  const [u1, u2] = orderUsers(userA, userB);

  // Buscar existente
  const { data: existing, error: findError } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_a", u1)
    .eq("user_b", u2)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  // Crear nueva
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_a: u1, user_b: u2 })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Lista todas las conversaciones del usuario actual con datos del otro participante
export async function fetchConversations(userId) {
  if (!userId) return [];

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, user_a, user_b, last_message_at, created_at")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  if (!conversations || conversations.length === 0) return [];

  // Para cada conversación, traer el perfil del OTRO usuario
  const otherIds = conversations.map((c) => (c.user_a === userId ? c.user_b : c.user_a));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos, is_premium, primary_theriotype")
    .in("id", otherIds);

  // Último mensaje de cada conversación (para preview)
  const conversationIds = conversations.map((c) => c.id);
  const { data: messages } = await supabase
    .from("messages")
    .select("conversation_id, content, image_url, sender_id, created_at, read_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  const lastMessageByConv = {};
  const unreadByConv = {};
  for (const m of messages || []) {
    if (!lastMessageByConv[m.conversation_id]) {
      lastMessageByConv[m.conversation_id] = m;
    }
    if (m.sender_id !== userId && !m.read_at) {
      unreadByConv[m.conversation_id] = (unreadByConv[m.conversation_id] || 0) + 1;
    }
  }

  return conversations.map((c) => {
    const otherId = c.user_a === userId ? c.user_b : c.user_a;
    const otherProfile = profiles?.find((p) => p.id === otherId);
    return {
      id: c.id,
      otherUserId: otherId,
      otherDisplayName: otherProfile?.display_name || "Therian",
      otherAvatar: otherProfile?.avatar_url || otherProfile?.photos?.[0] || null,
      otherPhotos: otherProfile?.photos || [],
      otherIsPremium: otherProfile?.is_premium || false,
      otherTheriotype: otherProfile?.primary_theriotype || null,
      lastMessage: lastMessageByConv[c.id] || null,
      unreadCount: unreadByConv[c.id] || 0,
      lastMessageAt: c.last_message_at,
    };
  });
}

// Trae todos los mensajes de una conversación
export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

// Envía un mensaje
export async function sendMessage({ conversationId, senderId, content, imageUrl }) {
  if (!conversationId || !senderId) throw new Error("Faltan datos");
  if (!content && !imageUrl) throw new Error("Mensaje vacío");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content || null,
      image_url: imageUrl || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Actualizar last_message_at de la conversación
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

// Genera un sufijo único para evitar el error
// "cannot add postgres_changes callbacks after subscribe()" que ocurre cuando
// se intenta reutilizar el mismo topic de canal entre renders.
function uniqueSuffix() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Suscripción a nuevos mensajes de una conversación (Realtime)
export function subscribeToMessages(conversationId, onNewMessage) {
  const channel = supabase
    .channel(`messages:${conversationId}:${uniqueSuffix()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Suscripción a cambios en TODAS las conversaciones del usuario (para la lista)
export function subscribeToConversations(userId, onChange) {
  const channel = supabase
    .channel(`conversations:${userId}:${uniqueSuffix()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "conversations" },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Marca mensajes recibidos como leídos
export async function markAsRead(conversationId, currentUserId) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId)
    .is("read_at", null);
}

// Eliminar conversación (cascade borra mensajes)
export async function deleteConversation(conversationId) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);
  if (error) throw error;
}
