import React, { useContext, useState, useEffect } from "react";
import {
  ActivityIndicator,
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
import * as ScreenCapture from "expo-screen-capture";
import LikeButton from "../components/buttons/LikeButton";
import NopeButton from "../components/buttons/NopeButton";
import SuperMatchButton from "../components/buttons/SuperMatchButton";
import ReportBlockModal from "../components/ReportBlockModal";
import { AuthContext } from "../contexts/AuthContext";
import { getExclusivePhotoUrls } from "../services/photoService";
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
  const [exclusiveUrls, setExclusiveUrls] = useState([]);
  const [loadingExclusive, setLoadingExclusive] = useState(false);

  const isPremium = user?.isPremium || user?.is_premium || false;

  // Solo URLs string son válidas para Image source.uri.
  // Si profile.avatar es un require() (number) o un objeto raro, lo descartamos
  // para evitar crash "Value for uri cannot be cast from Double to String".
  const rawPhotos = profile.photos?.length ? profile.photos : profile.avatar ? [profile.avatar] : [];
  const photos = rawPhotos.filter((p) => typeof p === "string" && p.length > 0);
  const hasExclusive = profile.exclusive_photos?.length > 0;

  useEffect(() => {
    if (!isPremium || !hasExclusive) {
      setExclusiveUrls([]);
      return;
    }
    let cancelled = false;
    setLoadingExclusive(true);
    getExclusivePhotoUrls(profile.exclusive_photos)
      .then((urls) => { if (!cancelled) setExclusiveUrls(urls); })
      .catch((e) => console.warn("Error firmando fotos exclusivas:", e?.message))
      .finally(() => { if (!cancelled) setLoadingExclusive(false); });
    return () => { cancelled = true; };
  }, [isPremium, hasExclusive, profile.exclusive_photos]);

  // Registrar visita al perfil (solo entre usuarios reales)
  useEffect(() => {
    const isRealUser = profile.id && typeof profile.id === "string" && profile.id.length > 30;
    if (isRealUser && user?.supabaseId && profile.id !== user.supabaseId) {
      trackVisit({ visitorId: user.supabaseId, visitedId: profile.id }).catch(() => {});
    }
  }, [profile.id, user?.supabaseId]);

  // Bloquear capturas de pantalla y detectar intentos (iOS)
  useEffect(() => {
    if (!hasExclusive) return;

    ScreenCapture.preventScreenCaptureAsync().catch(() => {});

    const subscription = ScreenCapture.addScreenshotListener(() => {
      // Registrar intento en Supabase
      try {
        const { supabase } = require("../services/supabase");
        supabase.from("security_violations").insert({
          user_id: user?.supabaseId,
          target_user_id: profile.id,
          type: "screenshot_exclusive_photo",
        });
      } catch {}

      Alert.alert(
        "⚠️ Captura detectada",
        "Las fotos exclusivas están protegidas por ley. Compartirlas o capturarlas viola los Términos de Servicio.\n\nSi se reitera esta acción, tu cuenta será bloqueada permanentemente.",
        [{ text: "Entendido" }]
      );
    });

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
      subscription.remove();
    };
  }, [hasExclusive]);

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
            <Image source={{ uri: photos[currentPhoto] }} style={styles.photo} />
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
                  exclusivePhotos: profile.exclusive_photos || [],
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
                  <TouchableOpacity key={i} onPress={() => setCurrentPhoto(i)} style={{ width: "31%", aspectRatio: 1 }}>
                    <Image source={{ uri: p }} style={{ width: "100%", height: "100%", borderRadius: 10, borderWidth: currentPhoto === i ? 2 : 0, borderColor: "#22c55e" }} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* FOTOS EXCLUSIVAS */}
          {hasExclusive && (
            <View style={{ marginTop: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Fotos exclusivas</Text>
                <View style={{ backgroundColor: "#a78bfa22", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#a78bfa" }}>
                  <Text style={{ color: "#c084fc", fontSize: 11, fontWeight: "bold" }}>👑 PREMIUM</Text>
                </View>
              </View>

              {isPremium ? (
                loadingExclusive ? (
                  <ActivityIndicator color="#a78bfa" style={{ marginVertical: 20 }} />
                ) : (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {exclusiveUrls.map((url, i) => (
                      <View key={i} style={{ width: "31%", aspectRatio: 1 }}>
                        <Image source={{ uri: url }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
                      </View>
                    ))}
                  </View>
                )
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate("PremiumPlans")}
                  style={{ backgroundColor: "rgba(167,139,250,0.08)", borderRadius: 14, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#a78bfa44", gap: 8 }}
                >
                  <Text style={{ fontSize: 36 }}>🔒</Text>
                  <Text style={{ color: "#c084fc", fontSize: 15, fontWeight: "bold" }}>
                    {profile.exclusive_photos.length} fotos exclusivas bloqueadas
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
                    Hazte Premium para ver las fotos exclusivas de este perfil
                  </Text>
                  <View style={{ backgroundColor: "#a78bfa", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 4 }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Ver planes Premium →</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
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
