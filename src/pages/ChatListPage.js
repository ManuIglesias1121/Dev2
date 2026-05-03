import React, { useCallback, useState } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { AVATARS } from "../data/avatarAssets";
import { loadData, saveData, STORAGE_KEYS } from "../services/storageService";

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

  // Recarga cada vez que la pestaña toma foco
  useFocusEffect(
    useCallback(() => {
      async function loadContacts() {
        const saved = await loadData(STORAGE_KEYS.CHAT_CONTACTS, []);
        if (saved.length > 0) {
          setChatContacts(saved);
        } else {
          setChatContacts([DEFAULT_CONTACT]);
        }
      }
      loadContacts();
    }, [])
  );

  const deleteChat = (contactId) => {
    Alert.alert("Eliminar chat", "¿Quieres eliminar esta conversación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          const updated = chatContacts.filter((c) => c.contactId !== contactId);
          setChatContacts(updated.length > 0 ? updated : [DEFAULT_CONTACT]);
          await saveData(STORAGE_KEYS.CHAT_CONTACTS, updated);
        },
      },
    ]);
  };

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

        {/* Lista de chats */}
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
