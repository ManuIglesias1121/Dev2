import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";
import { playFeedback } from "../services/soundService";

/**
 * Suscribe globalmente a INSERTs en la tabla messages.
 * RLS limita los eventos a conversaciones donde el usuario participa.
 *
 * Reglas de notificación:
 *  - No suena si el mensaje es propio
 *  - No suena si el usuario YA está viendo esa conversación
 *  - Suena para mensajes recibidos en cualquier otra conversación
 */
export function useGlobalChatNotifications() {
  const { user, activeConversationId } = useAuth();
  const activeConvRef = useRef(activeConversationId);

  // Mantener un ref actualizado para no recrear la suscripción cuando cambia
  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!user?.supabaseId) return;

    const channel = supabase
      .channel(`global_messages:${user.supabaseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (!msg) return;
          if (msg.sender_id === user.supabaseId) return; // mensaje propio
          if (msg.conversation_id === activeConvRef.current) return; // ya estás en ese chat
          playFeedback("chatMessage");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.supabaseId]);
}
