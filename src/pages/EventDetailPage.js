import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchEventDetail,
  rsvpEvent,
  cancelEvent,
  subscribeToEvent,
} from "../services/eventsService";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetailPage() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const eventId = params?.eventId;

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const data = await fetchEventDetail(eventId);
      setEvent(data);
    } catch (e) {
      Alert.alert("Error", "No se pudo cargar el encuentro.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (!eventId) return;
    const unsub = subscribeToEvent(eventId, () => load());
    return unsub;
  }, [eventId, load]);

  if (loading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#22c55e" />
      </View>
    );
  }

  const isHost = event.host?.id === user?.supabaseId;
  const myAttendance = event.attendees?.find((a) => a.user_id === user?.supabaseId);
  const myStatus = myAttendance?.status;
  const goingAttendees = event.attendees?.filter((a) => a.status === "going") || [];

  const handleRSVP = async (status) => {
    setSubmitting(true);
    try {
      await rsvpEvent({ eventId, userId: user.supabaseId, status });
      await load();
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo actualizar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancelar encuentro",
      "¿Cancelar este encuentro? Los asistentes serán notificados.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar evento",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelEvent(eventId);
              Alert.alert("Cancelado", "El encuentro fue cancelado.");
              navigation.goBack();
            } catch (e) {
              Alert.alert("Error", e?.message);
            }
          },
        },
      ]
    );
  };

  const openMeetingUrl = () => {
    if (event.meeting_url) Linking.openURL(event.meeting_url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {/* COVER + back */}
        <View style={{ position: "relative" }}>
          {event.cover_url ? (
            <Image source={{ uri: event.cover_url }} style={styles.cover} />
          ) : (
            <LinearGradient colors={["#16a34a", "#0a0a0a"]} style={styles.cover}>
              <Text style={{ fontSize: 56 }}>{event.type === "online" ? "💻" : "📍"}</Text>
            </LinearGradient>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 }}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          {event.status === "cancelled" && (
            <View style={styles.cancelledBadge}>
              <Text style={{ color: "white", fontWeight: "bold" }}>CANCELADO</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 20 }}>
          <Text style={styles.title}>{event.title}</Text>

          {/* HOST */}
          <View style={styles.hostRow}>
            <Image source={resolveSource(event.host?.avatar)} style={styles.hostAvatar} />
            <View>
              <Text style={styles.hostName}>{event.host?.display_name}</Text>
              <Text style={styles.hostLabel}>Organizador</Text>
            </View>
          </View>

          {/* INFO BLOCKS */}
          <View style={styles.infoBlock}>
            <Ionicons name="calendar" size={20} color="#22c55e" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Fecha y hora</Text>
              <Text style={styles.infoValue}>{formatDate(event.starts_at)}</Text>
            </View>
          </View>

          {event.type === "in_person" ? (
            <View style={styles.infoBlock}>
              <Ionicons name="location" size={20} color="#22c55e" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Lugar</Text>
                <Text style={styles.infoValue}>{event.location_text}</Text>
                {event.city && <Text style={styles.infoSub}>{event.city}</Text>}
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.infoBlock} onPress={openMeetingUrl}>
              <Ionicons name="videocam" size={20} color="#22c55e" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Encuentro online</Text>
                <Text style={[styles.infoValue, { color: "#3b82f6" }]} numberOfLines={1}>
                  {event.meeting_url}
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#3b82f6" />
            </TouchableOpacity>
          )}

          {event.max_attendees && (
            <View style={styles.infoBlock}>
              <Ionicons name="people" size={20} color="#22c55e" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Cupo</Text>
                <Text style={styles.infoValue}>{goingAttendees.length} / {event.max_attendees}</Text>
              </View>
            </View>
          )}

          {/* DESCRIPCIÓN */}
          {event.description && (
            <View style={styles.descBlock}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descText}>{event.description}</Text>
            </View>
          )}

          {/* ASISTENTES */}
          <Text style={styles.sectionTitle}>Asistentes ({goingAttendees.length})</Text>
          {goingAttendees.length === 0 ? (
            <Text style={styles.empty}>Nadie confirmó todavía. Sé el primero.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
              {goingAttendees.map((a) => {
                const photos = a.photos?.length ? a.photos : (a.avatar ? [a.avatar] : []);
                const profilePayload = {
                  id: a.user_id,
                  display_name: a.display_name,
                  avatar: a.avatar,
                  photos,
                  primary_theriotype: a.primary_theriotype,
                };
                return (
                  <View key={a.user_id} style={styles.attendeeBubble}>
                    <TouchableOpacity
                      onPress={() => {
                        if (photos.length > 0) {
                          navigation.navigate("GalleryPage", { photos, initialIndex: 0 });
                        } else {
                          navigation.navigate("ProfileDetail", { profile: profilePayload });
                        }
                      }}
                    >
                      <Image source={resolveSource(a.avatar)} style={styles.attendeeAvatar} />
                    </TouchableOpacity>
                    <Text style={styles.attendeeName} numberOfLines={1}>{a.display_name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* HOST ACTIONS */}
          {isHost && event.status === "active" && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Cancelar encuentro</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* RSVP BAR (sticky abajo) */}
      {event.status === "active" && !isHost && (
        <View style={[styles.rsvpBar, { paddingBottom: 16 + insets.bottom }]}>
          <TouchableOpacity
            disabled={submitting}
            style={[styles.rsvpBtn, myStatus === "going" && styles.rsvpBtnActive]}
            onPress={() => handleRSVP(myStatus === "going" ? "declined" : "going")}
          >
            <Ionicons name="checkmark-circle" size={20} color={myStatus === "going" ? "white" : "#22c55e"} />
            <Text style={[styles.rsvpText, myStatus === "going" && { color: "white" }]}>
              {myStatus === "going" ? "Voy ✓" : "Voy"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={submitting}
            style={[styles.rsvpBtn, myStatus === "interested" && styles.rsvpBtnInterested]}
            onPress={() => handleRSVP(myStatus === "interested" ? "declined" : "interested")}
          >
            <Ionicons name="star" size={20} color={myStatus === "interested" ? "white" : "#f59e0b"} />
            <Text style={[styles.rsvpText, myStatus === "interested" && { color: "white" }]}>
              {myStatus === "interested" ? "Me interesa ✓" : "Me interesa"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" },
  cover: { width: "100%", height: 220, justifyContent: "center", alignItems: "center" },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelledBadge: {
    position: "absolute",
    top: 52,
    right: 16,
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 14 },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  hostAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#22c55e" },
  hostName: { color: "white", fontSize: 15, fontWeight: "bold" },
  hostLabel: { color: "#888", fontSize: 11 },
  infoBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
  infoLabel: { color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { color: "white", fontSize: 14, marginTop: 2 },
  infoSub: { color: "#aaa", fontSize: 12, marginTop: 2 },
  descBlock: { marginTop: 16 },
  sectionTitle: { color: "white", fontSize: 16, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  descText: { color: "#bbb", lineHeight: 22 },
  empty: { color: "#666", fontStyle: "italic", marginTop: 4 },
  attendeeBubble: { alignItems: "center", width: 70, marginRight: 10 },
  attendeeAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#22c55e" },
  attendeeName: { color: "white", fontSize: 11, marginTop: 6, textAlign: "center" },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  rsvpBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingTop: 14,
    backgroundColor: "rgba(0,0,0,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#1e1e1e",
  },
  rsvpBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
  },
  rsvpBtnActive: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  rsvpBtnInterested: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  rsvpText: { color: "white", fontWeight: "bold", fontSize: 14 },
});
