import React, { useCallback, useEffect, useState } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { AVATARS } from "../data/avatarAssets";
import { loadData, saveData, STORAGE_KEYS } from "../services/storageService";
import { fetchConversations, subscribeToConversations, deleteConversation } from "../services/chatService";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

const DEFAULT_CONTACT = {
  contactId: "default",
  name: "Luna Wolf",
  photo: AVATARS["loba-1"],
};

export default function ChatListPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [chatContacts, setChatContacts] = useState([DEFAULT_CONTACT]);
  const [realConversations, setRealConversations] = useState([]);

  const loadAll = useCallback(async () => {
    // Conversaciones reales de Supabase
    if (user?.supabaseId) {
      try {
        const convs = await fetchConversations(user.supabaseId);
        setRealConversations(convs);
      } catch (e) {
        console.warn("Error cargando conversaciones:", e?.message);
      }
    }

    // Contactos locales (fakes / por defecto)
    const saved = await loadData(STORAGE_KEYS.CHAT_CONTACTS, []);
    const deleted = await loadData(STORAGE_KEYS.DELETED_CONTACTS, []);
    if (saved.length > 0) {
      setChatContacts(saved.filter((c) => !deleted.includes(c.contactId)));
    } else if (!deleted.includes("default")) {
      setChatContacts([DEFAULT_CONTACT]);
    } else {
      setChatContacts([]);
    }
  }, [user?.supabaseId]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  // Suscripción Realtime para actualizar la lista cuando llegan mensajes
  useEffect(() => {
    if (!user?.supabaseId) return;
    const unsubscribe = subscribeToConversations(user.supabaseId, () => loadAll());
    return unsubscribe;
  }, [user?.supabaseId, loadAll]);

  const deleteChat = (contactId) => {
    Alert.alert("Eliminar chat", "¿Quieres eliminar esta conversación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          const updated = chatContacts.filter((c) => c.contactId !== contactId);
          setChatContacts(updated);
          await saveData(STORAGE_KEYS.CHAT_CONTACTS, updated);
          await saveData(`${STORAGE_KEYS.CHATS}_${contactId}`, []);
          const deleted = await loadData(STORAGE_KEYS.DELETED_CONTACTS, []);
          if (!deleted.includes(contactId)) {
            await saveData(STORAGE_KEYS.DELETED_CONTACTS, [...deleted, contactId]);
          }
        },
      },
    ]);
  };

  const deleteRealConversation = (convId) => {
    Alert.alert("Eliminar chat", "¿Eliminar esta conversación? Se borrarán todos los mensajes.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await deleteConversation(convId);
            setRealConversations((prev) => prev.filter((c) => c.id !== convId));
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar: " + (e?.message || "intentá de nuevo"));
          }
        },
      },
    ]);
  };

  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "ahora";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a1a2e", "#0f172a"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.top}>
          <Text style={styles.title}>Chats</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("GiftShopPage")}
            style={styles.coinsButton}
          >
            <Text style={styles.coinsIcon}>💰</Text>
            <Text style={styles.coinsText}>{user?.coins || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Conversaciones reales (Supabase) */}
        {realConversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={styles.chatCard}
            onPress={() =>
              navigation.navigate("ChatRoomPage", {
                name: conv.otherDisplayName,
                photo: conv.otherAvatar,
                photos: conv.otherPhotos?.length
                  ? conv.otherPhotos
                  : (conv.otherAvatar ? [conv.otherAvatar] : []),
                exclusivePhotos: conv.otherExclusivePhotos || [],
                otherIsPremium: conv.otherIsPremium,
                primaryTheriotype: conv.otherTheriotype,
                contactId: conv.id,
                targetUserId: conv.otherUserId,
              })
            }
            onLongPress={() => deleteRealConversation(conv.id)}
          >
            <Image source={resolveSource(conv.otherAvatar)} style={styles.avatar} />
            <View style={styles.info}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.name}>{conv.otherDisplayName}</Text>
                <Text style={{ color: "#666", fontSize: 11 }}>{timeAgo(conv.lastMessageAt)}</Text>
              </View>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {conv.lastMessage?.content
                  ? (conv.lastMessage.sender_id === user?.supabaseId ? "Tú: " : "") + conv.lastMessage.content
                  : "Tocá para chatear"}
              </Text>
            </View>
            {conv.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>{conv.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Lista de chats locales (fakes) */}
        {chatContacts.length === 0 && realConversations.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: 30 }}>
            <Text style={{ fontSize: 48 }}>💬</Text>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginTop: 12 }}>Sin conversaciones</Text>
            <Text style={{ color: "#666", textAlign: "center", marginTop: 8, fontSize: 13 }}>
              Cuando hagas match con alguien y le envíes un mensaje, va a aparecer acá.
            </Text>
          </View>
        )}
        {chatContacts.map((contact) => (
          <TouchableOpacity
            key={contact.contactId}
            style={styles.chatCard}
            onPress={() =>
              navigation.navigate("ChatRoomPage", {
                name: contact.name,
                photo: contact.photo,
                contactId: contact.contactId,
              })
            }
            onLongPress={() => deleteChat(contact.contactId)}
          >
            <Image source={resolveSource(contact.photo)} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{contact.name}</Text>
              <Text style={styles.lastMsg}>Toca para continuar · Mantén para eliminar</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Link a logros */}
        <TouchableOpacity
          style={styles.achievementsLink}
          onPress={() => navigation.navigate("AchievementsPage")}
        >
          <Text style={styles.achievementsIcon}>🏆</Text>
          <View style={styles.achievementsText}>
            <Text style={styles.achievementsTitle}>Ver tus Logros</Text>
            <Text style={styles.achievementsDesc}>Desbloquea logros y gana monedas</Text>
          </View>
          <Text style={styles.achievementsArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", paddingTop: 40 },
  content: { paddingBottom: 32 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: { color: "#16a34a", fontSize: 32, fontWeight: "bold" },
  coinsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  coinsIcon: { fontSize: 18, marginRight: 6 },
  coinsText: { color: "#22c55e", fontWeight: "bold" },
  chatCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(22, 163, 74, 0.08)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: "#16a34a33",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#16a34a",
    marginRight: 14,
  },
  info: { flex: 1 },
  name: { color: "white", fontSize: 17, fontWeight: "bold", marginBottom: 4 },
  lastMsg: { color: "#888", fontSize: 13 },
  arrow: { color: "#16a34a", fontSize: 22 },
  unreadBadge: {
    backgroundColor: "#ef4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementsLink: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#fbbf24",
    marginBottom: 24,
  },
  achievementsIcon: { fontSize: 28, marginRight: 12 },
  achievementsText: { flex: 1 },
  achievementsTitle: { color: "#fbbf24", fontWeight: "bold", fontSize: 14, marginBottom: 2 },
  achievementsDesc: { color: "#aaa", fontSize: 12 },
  achievementsArrow: { color: "#fbbf24", fontSize: 16 },
});
