import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import { fakeVisitors } from "../data/fakeVisitors";
import { fetchVisitors, deleteVisit } from "../services/visitorsService";
import { saveData, loadData } from "../services/storageService";

const HIDDEN_FAKE_VISITORS_KEY = "hidden_fake_visitors";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

export default function VisitorsPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPremium = user?.isPremium || user?.is_premium || false;

  const loadVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const real = user?.supabaseId ? await fetchVisitors(user.supabaseId) : [];
      const hiddenFakes = await loadData(HIDDEN_FAKE_VISITORS_KEY, []);
      const visibleFakes = fakeVisitors.filter((v) => !hiddenFakes.includes(v.id));
      setVisitors([...real, ...visibleFakes]);
    } catch (e) {
      console.warn("Error cargando visitantes:", e?.message);
      setVisitors(fakeVisitors);
    } finally {
      setLoading(false);
    }
  }, [user?.supabaseId]);

  const handleDeleteVisitor = (v) => {
    Alert.alert(
      "Quitar visitante",
      `¿Querés que ${v.display_name} no aparezca más en tu lista de visitantes?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: async () => {
            // Si es real (tiene visitor_id de Supabase), borrar de DB
            if (v.visitor_id && v.id && typeof v.id === "string" && v.id.length > 30) {
              try {
                await deleteVisit(v.id);
              } catch (e) {
                console.warn("Error borrando visita:", e?.message);
              }
            } else {
              // Es fake, ocultarlo localmente
              const hidden = await loadData(HIDDEN_FAKE_VISITORS_KEY, []);
              if (!hidden.includes(v.id)) {
                await saveData(HIDDEN_FAKE_VISITORS_KEY, [...hidden, v.id]);
              }
            }
            setVisitors((prev) => prev.filter((x) => x.id !== v.id));
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (isPremium) loadVisitors();
    }, [isPremium, loadVisitors])
  );

  if (!isPremium) {
    return (
      <View style={styles.center}>
        <Text style={styles.locked}>🔒 Solo para usuarios Premium</Text>
        <Text style={styles.lockedSub}>
          Hacete Premium para ver quién visitó tu perfil
        </Text>
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => navigation.navigate("PremiumPlans")}
        >
          <Text style={styles.upgradeText}>Ver planes Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Quién visitó tu perfil</Text>
      <Text style={styles.hint}>Mantén apretado para ocultar un visitante</Text>

      {loading && <ActivityIndicator color="#22c55e" style={{ marginTop: 30 }} />}

      {!loading && visitors.length === 0 && (
        <Text style={styles.empty}>Todavía nadie visitó tu perfil</Text>
      )}

      {visitors.map((v) => {
        const isRealVisitor = v.visitor_id;
        const photos = v.photos?.length ? v.photos : (v.avatar ? [v.avatar] : []);
        const profilePayload = {
          id: isRealVisitor ? v.visitor_id : v.id,
          display_name: v.display_name,
          avatar: v.avatar,
          photos,
          primary_theriotype: v.primary_theriotype,
          age: v.age,
          city: v.city,
          isPremium: v.isPremium,
        };

        return (
          <View key={v.id} style={styles.card}>
            {/* Foto: tap abre galería */}
            <TouchableOpacity
              onPress={() => {
                if (photos.length > 0) {
                  navigation.navigate("GalleryPage", { photos, initialIndex: 0 });
                } else {
                  navigation.navigate("ProfileDetail", { profile: profilePayload });
                }
              }}
              onLongPress={() => handleDeleteVisitor(v)}
            >
              <Image source={resolveSource(v.avatar)} style={styles.avatar} />
            </TouchableOpacity>

            {/* Info: tap abre el perfil completo */}
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 12 }}
              onPress={() => navigation.navigate("ProfileDetail", { profile: profilePayload })}
              onLongPress={() => handleDeleteVisitor(v)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.name}>{v.display_name}</Text>
                {v.age && <Text style={{ color: "#888", fontSize: 14 }}>{v.age}</Text>}
                {v.isPremium && <Text style={{ fontSize: 14 }}>👑</Text>}
              </View>
              <Text style={styles.info}>
                {v.primary_theriotype}{v.city ? ` · ${v.city}` : ""}
              </Text>
              {v.last_visit_at && (
                <Text style={styles.time}>
                  {timeAgo(v.last_visit_at)}
                  {v.visit_count > 1 && ` · ${v.visit_count} visitas`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 16 },
  center: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  locked: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 10 },
  lockedSub: { color: "#aaa", fontSize: 16, textAlign: "center", marginBottom: 24 },
  upgradeBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  upgradeText: { color: "white", fontWeight: "bold", fontSize: 16 },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 4,
    textAlign: "center",
  },
  hint: {
    color: "#555",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  empty: { color: "#777", fontSize: 16, textAlign: "center", marginTop: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#22c55e33",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  name: { color: "white", fontSize: 17, fontWeight: "700" },
  info: { color: "#aaa", fontSize: 13, marginTop: 2 },
  time: { color: "#666", fontSize: 11, marginTop: 4 },
});
