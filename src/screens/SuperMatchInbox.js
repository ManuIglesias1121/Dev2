import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { loadData, saveData, STORAGE_KEYS } from "../services/storageService";
import { fakeSuperMatches } from "../data/fakeSuperMatches";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

const DELETED_SUPER_MATCHES_KEY = "deleted_super_matches";
const SENT_SUPER_MATCHES_KEY = "sent_super_matches";

export default function SuperMatchInbox({ navigation }) {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState("received"); // "received" | "sent"

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const savedReceived = await loadData(STORAGE_KEYS.CHAT_CONTACTS + "_supermatches", []);
        const savedSent = await loadData(SENT_SUPER_MATCHES_KEY, []);
        const deleted = await loadData(DELETED_SUPER_MATCHES_KEY, []);

        const recv = [...savedReceived, ...fakeSuperMatches].filter((m) => !deleted.includes(m.id));
        const out = savedSent.filter((m) => !deleted.includes(m.id));

        setReceived(recv);
        setSent(out);
      }
      load();
    }, [])
  );

  const deleteSuperMatch = (id) => {
    Alert.alert("Eliminar Super Match", "¿Quieres eliminar este Super Match?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          if (tab === "received") {
            setReceived((r) => r.filter((m) => m.id !== id));
            const saved = await loadData(STORAGE_KEYS.CHAT_CONTACTS + "_supermatches", []);
            await saveData(STORAGE_KEYS.CHAT_CONTACTS + "_supermatches", saved.filter((m) => m.id !== id));
          } else {
            setSent((s) => s.filter((m) => m.id !== id));
            const saved = await loadData(SENT_SUPER_MATCHES_KEY, []);
            await saveData(SENT_SUPER_MATCHES_KEY, saved.filter((m) => m.id !== id));
          }

          const deleted = await loadData(DELETED_SUPER_MATCHES_KEY, []);
          if (!deleted.includes(id)) {
            await saveData(DELETED_SUPER_MATCHES_KEY, [...deleted, id]);
          }
        },
      },
    ]);
  };

  const list = tab === "received" ? received : sent;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Inicio");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Super Matches</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "received" && styles.tabActive]}
          onPress={() => setTab("received")}
        >
          <Text style={[styles.tabText, tab === "received" && styles.tabTextActive]}>
            ⬇️ Recibidos {received.length > 0 && `(${received.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "sent" && styles.tabActive]}
          onPress={() => setTab("sent")}
        >
          <Text style={[styles.tabText, tab === "sent" && styles.tabTextActive]}>
            ⬆️ Enviados {sent.length > 0 && `(${sent.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {list.length === 0 && (
        <Text style={styles.empty}>
          {tab === "received"
            ? "Todavía no recibiste Super Matches"
            : "Todavía no enviaste Super Matches"}
        </Text>
      )}

      {list.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => navigation.navigate("SuperMatchDetail", { match: item })}
          onLongPress={() => deleteSuperMatch(item.id)}
        >
          <Image source={resolveSource(item.sender.avatar)} style={styles.avatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.sender.display_name}</Text>
            <Text style={styles.type}>{item.sender.primary_theriotype}</Text>
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>

          <Text style={styles.icon}>✨</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#22c55e",
  },
  tabText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  empty: {
    color: "#777",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#22c55e33",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  name: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  type: {
    color: "#aaa",
    fontSize: 14,
  },
  time: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  icon: {
    fontSize: 26,
    marginLeft: 10,
  },
});
