import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { fetchUpcomingEvents, fetchEventsImAttending, deleteEvent } from "../services/eventsService";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

export default function EventsListPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tab, setTab] = useState("upcoming"); // "upcoming" | "mine" | "attending"
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPremium = user?.isPremium || user?.is_premium || false;

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "upcoming") {
        const data = await fetchUpcomingEvents({ city: user?.city });
        setEvents(data);
      } else if (tab === "attending") {
        const data = await fetchEventsImAttending(user?.supabaseId);
        setEvents(data);
      }
    } catch (e) {
      console.warn("Error cargando eventos:", e?.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [tab, user?.supabaseId, user?.city]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const goToCreate = () => {
    if (!isPremium) {
      navigation.navigate("PremiumPlans");
      return;
    }
    navigation.navigate("EventCreate");
  };

  const handleLongPress = (item) => {
    const isHost = item.host?.id && user?.supabaseId && item.host.id === user.supabaseId;
    if (!isHost) {
      Alert.alert("Sólo el organizador", "Sólo quien creó el encuentro puede eliminarlo.");
      return;
    }
    Alert.alert(
      "Eliminar encuentro",
      `¿Eliminar "${item.title}"? Esta acción borra el evento, los asistentes y los mensajes asociados.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEvent(item.id);
              setEvents((prev) => prev.filter((e) => e.id !== item.id));
            } catch (e) {
              Alert.alert("Error", e?.message || "No se pudo eliminar el encuentro");
            }
          },
        },
      ]
    );
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={400}
    >
      {item.cover_url ? (
        <Image source={{ uri: item.cover_url }} style={styles.cover} />
      ) : (
        <LinearGradient colors={["#16a34a", "#0a0a0a"]} style={styles.cover}>
          <Text style={{ fontSize: 36 }}>{item.type === "online" ? "💻" : "📍"}</Text>
        </LinearGradient>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          {item.type === "online" && (
            <View style={styles.badgeOnline}>
              <Text style={styles.badgeText}>ONLINE</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
          <Ionicons name="calendar-outline" size={14} color="#22c55e" />
          <Text style={styles.date}>{formatDate(item.starts_at)}</Text>
        </View>
        {item.location_text && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Ionicons name="location-outline" size={14} color="#aaa" />
            <Text style={styles.location} numberOfLines={1}>{item.location_text}</Text>
          </View>
        )}
        <View style={styles.cardFooter}>
          {item.host && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Image source={resolveSource(item.host.avatar)} style={styles.hostAvatar} />
              <Text style={styles.hostName}>{item.host.display_name}</Text>
            </View>
          )}
          {item.goingCount != null && (
            <Text style={styles.attendeesCount}>👥 {item.goingCount}{item.max_attendees ? `/${item.max_attendees}` : ""}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0a1f0a", "#000"]} style={StyleSheet.absoluteFill} />

      <LinearGradient colors={["#15803d", "#0a1f0a"]} style={styles.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.headerTitle}>🐺 Encuentros</Text>
          <TouchableOpacity onPress={goToCreate} style={styles.createBtn}>
            <Ionicons name="add" size={22} color="white" />
            <Text style={styles.createBtnText}>Crear</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          {isPremium ? "Crea encuentros y conocé therians cerca tuyo" : "Únete a encuentros de la manada"}
        </Text>
        <Text style={[styles.headerSub, { fontSize: 11, opacity: 0.7, marginTop: 2 }]}>
          Mantené apretado un encuentro tuyo para eliminarlo
        </Text>
      </LinearGradient>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "upcoming" && styles.tabActive]}
          onPress={() => setTab("upcoming")}
        >
          <Text style={[styles.tabText, tab === "upcoming" && styles.tabTextActive]}>Próximos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "attending" && styles.tabActive]}
          onPress={() => setTab("attending")}
        >
          <Text style={[styles.tabText, tab === "attending" && styles.tabTextActive]}>Voy</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#22c55e" style={{ marginTop: 40 }} />
      ) : events.length === 0 ? (
        <ScrollView contentContainerStyle={styles.empty}>
          <Text style={{ fontSize: 48 }}>📅</Text>
          <Text style={styles.emptyTitle}>
            {tab === "upcoming" ? "No hay encuentros próximos" : "No estás asistiendo a ninguno"}
          </Text>
          <Text style={styles.emptySub}>
            {isPremium && tab === "upcoming"
              ? "Sé el primero en crear uno"
              : "Explorá los encuentros próximos para unirte"}
          </Text>
          {isPremium && tab === "upcoming" && (
            <TouchableOpacity onPress={goToCreate} style={styles.emptyCta}>
              <Text style={{ color: "white", fontWeight: "bold" }}>+ Crear encuentro</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "#bbf7d0", fontSize: 13, marginTop: 4 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { color: "white", fontWeight: "bold", fontSize: 13 },
  tabs: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#222",
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#22c55e" },
  tabText: { color: "#888", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "white", fontWeight: "bold" },
  card: {
    backgroundColor: "#111",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
  cover: {
    width: "100%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { padding: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { color: "white", fontSize: 17, fontWeight: "bold", flex: 1 },
  badgeOnline: {
    backgroundColor: "rgba(34,197,94,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  badgeText: { color: "#22c55e", fontSize: 10, fontWeight: "bold" },
  date: { color: "#22c55e", fontSize: 13, fontWeight: "600" },
  location: { color: "#aaa", fontSize: 12, flex: 1 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e1e1e",
  },
  hostAvatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "#22c55e" },
  hostName: { color: "#bbb", fontSize: 12 },
  attendeesCount: { color: "#888", fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40, gap: 8 },
  emptyTitle: { color: "white", fontSize: 18, fontWeight: "bold", marginTop: 12 },
  emptySub: { color: "#888", textAlign: "center", fontSize: 13 },
  emptyCta: { marginTop: 20, backgroundColor: "#16a34a", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
});
