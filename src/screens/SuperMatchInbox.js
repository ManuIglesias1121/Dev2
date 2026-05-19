import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { loadData, saveData, STORAGE_KEYS } from "../services/storageService";
import { fakeSuperMatches } from "../data/fakeSuperMatches";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchReceivedSuperMatches,
  fetchSentSuperMatches,
  subscribeToSuperMatches,
  deleteSuperMatchById,
  markSuperMatchAsRead,
} from "../services/superMatchService";
import { playFeedback } from "../services/soundService";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

const DELETED_SUPER_MATCHES_KEY = "deleted_super_matches";
const SENT_SUPER_MATCHES_KEY = "sent_super_matches";

export default function SuperMatchInbox({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState("received");

  const loadAll = useCallback(async () => {
    const deleted = await loadData(DELETED_SUPER_MATCHES_KEY, []);

    // Recibidos: Supabase + locales (legacy) + fakes
    let realReceived = [];
    let realSent = [];
    if (user?.supabaseId) {
      try {
        realReceived = await fetchReceivedSuperMatches(user.supabaseId);
        realSent = await fetchSentSuperMatches(user.supabaseId);
      } catch (e) {
        console.warn("Error cargando super matches:", e?.message);
      }
    }

    const savedReceivedLocal = await loadData(STORAGE_KEYS.CHAT_CONTACTS + "_supermatches", []);
    const savedSentLocal = await loadData(SENT_SUPER_MATCHES_KEY, []);

    const recv = [...realReceived, ...savedReceivedLocal, ...fakeSuperMatches].filter(
      (m) => !deleted.includes(m.id)
    );
    const out = [...realSent, ...savedSentLocal].filter((m) => !deleted.includes(m.id));

    // Dedupe por PERSONA (sender.id) y no por row id — para no mostrar
    // el mismo super match dos veces (local + real, o duplicados)
    // El primero en la lista gana (los reales de Supabase vienen primero)
    const dedupeByPerson = (list) => {
      const seen = new Set();
      const result = [];
      for (const m of list) {
        const personKey = m.sender?.id || m.id; // fallback al row id si no hay sender.id
        if (!seen.has(personKey)) {
          seen.add(personKey);
          result.push(m);
        }
      }
      return result;
    };

    setReceived(dedupeByPerson(recv));
    setSent(dedupeByPerson(out));

    // Marcar como leídos los recibidos al entrar a la pantalla
    realReceived.forEach((sm) => {
      if (!sm.is_read) markSuperMatchAsRead(sm.id);
    });
  }, [user?.supabaseId]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  // Realtime: cuando alguien nos manda un super match, recargar.
  // OJO: NO incluir loadAll en deps — si loadAll cambia se re-suscribe
  // y supabase tira "cannot add postgres_changes callbacks after subscribe()".
  // Usamos un ref para llamar siempre a la versión actualizada de loadAll.
  const loadAllRef = React.useRef(loadAll);
  loadAllRef.current = loadAll;
  useEffect(() => {
    if (!user?.supabaseId) return;
    const unsubscribe = subscribeToSuperMatches(user.supabaseId, () => {
      playFeedback("superMatch");
      loadAllRef.current?.();
    });
    return unsubscribe;
  }, [user?.supabaseId]);

  const deleteSuperMatch = (id) => {
    Alert.alert("Eliminar Super Match", "¿Quieres eliminar este Super Match?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          // Si es UUID (real de Supabase), borrar de DB
          const isRealId = typeof id === "string" && id.length > 30;
          if (isRealId) {
            try {
              await deleteSuperMatchById(id);
            } catch (e) {
              console.warn("No se pudo borrar en DB:", e?.message);
            }
          }

          if (tab === "received") {
            setReceived((r) => r.filter((m) => m.id !== id));
            const saved = await loadData(STORAGE_KEYS.CHAT_CONTACTS + "_supermatches", []);
            await saveData(STORAGE_KEYS.CHAT_CONTACTS + "_supermatches", saved.filter((m) => m.id !== id));
          } else {
            setSent((s) => s.filter((m) => m.id !== id));
            const saved = await loadData(SENT_SUPER_MATCHES_KEY, []);
            await saveData(SENT_SUPER_MATCHES_KEY, saved.filter((m) => m.id !== id));
          }

          // Marcar localmente como eliminado para fakes (que no se pueden borrar de DB)
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }}>
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

      {list.map((item) => {
        // Defensive: si el item no tiene sender, lo saltamos
        if (!item || !item.sender) return null;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate("SuperMatchDetail", { match: item })}
            onLongPress={() => deleteSuperMatch(item.id)}
          >
            <Image source={resolveSource(item.sender.avatar)} style={styles.avatar} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.sender.display_name || "Therian"}</Text>
              <Text style={styles.type}>{item.sender.primary_theriotype || ""}</Text>
              <Text style={styles.time}>
                {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
              </Text>
            </View>

            <Text style={styles.icon}>✨</Text>
          </TouchableOpacity>
        );
      })}
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
