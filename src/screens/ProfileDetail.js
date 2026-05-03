import React, { useContext, useState, useEffect } from "react";
import {
  ActivityIndicator,
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
import { getExclusivePhotoUrls } from "../services/photoService";

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
  const photos = profile.photos?.length ? profile.photos : profile.avatar ? [profile.avatar] : [];
  const hasExclusive = profile.exclusive_photos?.length > 0;

  useEffect(() => {
    if (isPremium && hasExclusive) {
      setLoadingExclusive(true);
      getExclusivePhotoUrls(profile.exclusive_photos)
        .then(setExclusiveUrls)
        .finally(() => setLoadingExclusive(false));
    }
  }, []);

  const handleSuperMatch = () => {
    if (!user?.isPremium) {
      navigation.navigate("PremiumPlans");
      return;
    }
    alert(`Super Match enviado a ${profile.display_name} 🐺✨`);
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
