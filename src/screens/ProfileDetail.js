import React, { useContext, useState, useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LikeButton from "../components/buttons/LikeButton";
import NopeButton from "../components/buttons/NopeButton";
import SuperMatchButton from "../components/buttons/SuperMatchButton";
import ReportBlockModal from "../components/ReportBlockModal";
import { AuthContext } from "../contexts/AuthContext";
import { sendSuperMatch } from "../services/superMatchService";
import { trackVisit } from "../services/visitorsService";

function InfoBadge({ icon, text }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#1a1a1a", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: "#2a2a2a" }}>
      <Text style={{ marginRight: 5, fontSize: 14 }}>{icon}</Text>
      <Text style={{ color: "#ccc", fontSize: 13 }}>{text}</Text>
    </View>
  );
}

export default function ProfileDetailPage({ route, navigation }) {
  const { profile } = route.params;
  const { user } = useContext(AuthContext);
  const [reportVisible, setReportVisible] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // Solo URLs string son válidas para Image source.uri.
  // Si profile.avatar es un require() (number) o un objeto raro, lo descartamos
  // para evitar crash "Value for uri cannot be cast from Double to String".
  const rawPhotos = profile.photos?.length ? profile.photos : profile.avatar ? [profile.avatar] : [];
  const photos = rawPhotos.filter((p) => typeof p === "string" && p.length > 0);

  // Registrar visita al perfil (solo entre usuarios reales)
  useEffect(() => {
    const isRealUser = profile.id && typeof profile.id === "string" && profile.id.length > 30;
    if (isRealUser && user?.supabaseId && profile.id !== user.supabaseId) {
      trackVisit({ visitorId: user.supabaseId, visitedId: profile.id }).catch(() => {});
    }
  }, [profile.id, user?.supabaseId]);

  const handleSuperMatch = async () => {
    if (!user?.isPremium) {
      navigation.navigate("PremiumPlans");
      return;
    }

    // Solo se puede super-matchear a usuarios reales (UUID)
    const isRealUser = profile.id && typeof profile.id === "string" && profile.id.length > 30;
    if (!isRealUser) {
      Alert.alert("Super Match", `Este perfil es de demostración. Probá con un usuario real.`);
      return;
    }

    try {
      const result = await sendSuperMatch({
        senderId: user.supabaseId,
        receiverId: profile.id,
      });
      if (result === null) {
        Alert.alert("Ya enviado", `Ya le habías mandado un Super Match a ${profile.display_name}.`);
      } else {
        Alert.alert("✨ Super Match enviado", `Le va a llegar a ${profile.display_name} en tiempo real.`);
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo enviar el Super Match.");
    }
  };

  const habitatEmoji = {
    "Bosque": "🌲", "Montaña": "⛰️", "Pradera": "🌿", "Desierto": "🏜️",
    "Océano": "🌊", "Tundra": "❄️", "Selva Tropical": "🌴", "Ciudad": "🌆",
    "Cueva": "🕳️", "Cielo": "☁️",
  };

  const roleEmoji = {
    "Alfa": "👑", "Beta": "🛡️", "Omega": "🌙", "Cazador": "🎯",
    "Explorador": "🧭", "Guardián": "⚔️", "Sanador": "💚", "Solitario": "🌑",
    "Sabio": "📚", "Guerrero": "⚡",
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* FOTO */}
        <View style={{ position: "relative" }}>
          {photos.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("GalleryPage", { photos, initialIndex: currentPhoto })}
            >
              <Image source={{ uri: photos[currentPhoto] }} style={styles.photo} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.photo, { backgroundColor: "#1a1a1a", justifyContent: "center", alignItems: "center" }]}>
              <Text style={{ fontSize: 64 }}>👤</Text>
            </View>
          )}

          {/* Gradiente inferior */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 150 }}
          />

          {/* Botones overlay */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setReportVisible(true)} style={styles.reportBtn}>
            <Ionicons name="ellipsis-vertical" size={22} color="white" />
          </TouchableOpacity>

          {/* Indicadores de fotos */}
          {photos.length > 1 && (
            <View style={{ position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }}>
              {photos.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setCurrentPhoto(i)}>
                  <View style={{ width: i === currentPhoto ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === currentPhoto ? "white" : "rgba(255,255,255,0.4)" }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Badge premium */}
          {profile.isPremium && (
            <View style={{ position: "absolute", top: 56, left: 16, backgroundColor: "#a78bfa22", borderWidth: 1, borderColor: "#a78bfa", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ color: "#c084fc", fontSize: 13, fontWeight: "600" }}>👑 Premium</Text>
            </View>
          )}
        </View>

        {/* INFO */}
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 4 }}>
            <Text style={styles.name}>{profile.display_name}</Text>
            {profile.age && <Text style={{ color: "#aaa", fontSize: 22, marginLeft: 10, marginBottom: 2 }}>{profile.age}</Text>}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#22c55e", fontSize: 16 }}>🌿 {profile.primary_theriotype}</Text>
            {profile.distance != null && (
              <Text style={{ color: "#666", fontSize: 14, marginLeft: 12 }}>📍 {profile.distance} km</Text>
            )}
          </View>

          {/* BIO */}
          {profile.biography ? (
            <View style={{ backgroundColor: "#111", borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1e1e1e" }}>
              <Text style={{ color: "#999", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Sobre mí</Text>
              <Text style={styles.bio}>{profile.biography}</Text>
            </View>
          ) : null}

          {/* BADGES */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
            {profile.species_family && <InfoBadge icon="🧬" text={profile.species_family} />}
            {profile.habitat && <InfoBadge icon={habitatEmoji[profile.habitat] ?? "🌍"} text={profile.habitat} />}
            {profile.pack_role && <InfoBadge icon={roleEmoji[profile.pack_role] ?? "⭐"} text={profile.pack_role} />}
            {profile.city && <InfoBadge icon="📍" text={profile.city} />}
          </View>

          {/* BOTÓN CHATEAR — solo si es un usuario real (UUID) */}
          {profile.id && typeof profile.id === "string" && profile.id.length > 30 && profile.id !== user?.supabaseId && (
            <TouchableOpacity
              style={{ backgroundColor: "#22c55e", padding: 14, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 20 }}
              onPress={() =>
                navigation.navigate("ChatRoomPage", {
                  name: profile.display_name,
                  photo: profile.avatar || profile.photos?.[0],
                  photos: profile.photos || [],
                  otherIsPremium: profile.isPremium,
                  primaryTheriotype: profile.primary_theriotype,
                  contactId: profile.id,
                  targetUserId: profile.id,
                })
              }
            >
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Chatear</Text>
            </TouchableOpacity>
          )}

          {/* GALERÍA PÚBLICA */}
          {photos.length > 1 && (
            <>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>Fotos</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {photos.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setCurrentPhoto(i);
                      navigation.navigate("GalleryPage", { photos, initialIndex: i });
                    }}
                    style={{ width: "31%", aspectRatio: 1 }}
                  >
                    <Image source={{ uri: p }} style={{ width: "100%", height: "100%", borderRadius: 10, borderWidth: currentPhoto === i ? 2 : 0, borderColor: "#22c55e" }} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

        </View>
      </ScrollView>

      {/* BOTONES FIJOS */}
      <View style={styles.actionBar}>
        <NopeButton onPress={() => navigation.goBack()} />
        <SuperMatchButton onPress={handleSuperMatch} />
        <LikeButton onPress={() => navigation.goBack()} />
      </View>

      <ReportBlockModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        profile={profile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: "100%",
    height: 420,
  },
  backBtn: {
    position: "absolute", top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center",
  },
  reportBtn: {
    position: "absolute", top: 52, right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center",
  },
  name: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  bio: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 24,
  },
  actionBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.95)",
    paddingVertical: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: "#111",
  },
});
