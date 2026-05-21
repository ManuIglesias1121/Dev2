import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SwipeCard from "../components/SwipeCard";
import BannerAdComponent from "../components/BannerAdComponent";
import MatchModal from "../components/MatchModal";
import { getTherianProfiles } from "../services/profilesService";
import { showInterstitialAd } from "../services/adService";
import { sendSuperMatch } from "../services/superMatchService";
import { sendLike } from "../services/matchService";
import { useAuth } from "../contexts/AuthContext";
import { saveData, loadData, STORAGE_KEYS } from "../services/storageService";

const THERIOTYPES_OPTIONS = [
  "Wolf", "Fox", "Crow", "Serpent", "Panther", "Tiger",
  "Owl", "Coyote", "Lynx", "Dragon", "Deer", "Bear",
];

const DEFAULT_FILTERS = {
  ageMin: 18,
  ageMax: 99,
  maxDistance: 500,
  theriotypes: [],
  onlyPremium: false,
  gender: "all",
};

export default function SwipePage() {
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);
  const [noMoreVisible, setNoMoreVisible] = useState(false);
  const [matchModal, setMatchModal] = useState(null);
  const navigation = useNavigation();
  const { user, swipeProfile } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swipeCount = useRef(0);
  const isPremium = user?.plan && user.plan !== "free";

  const loadProfiles = useCallback(async () => {
    const data = await getTherianProfiles(user?.supabaseId || user?.id);
    setProfiles(data);
    setIndex(0);
    setNoMoreVisible(false);
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [user?.supabaseId, user?.id]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Recargar perfiles cuando la pantalla vuelve a tener foco (nuevos registros)
  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, [loadProfiles])
  );

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      // Solo aplicar filtros de edad/distancia si el perfil tiene esos datos
      if (p.age != null && (p.age < filters.ageMin || p.age > filters.ageMax)) return false;
      if (p.distance != null && p.distance > filters.maxDistance) return false;
      if (filters.onlyPremium && !p.isPremium) return false;
      if (filters.gender !== "all" && p.gender && p.gender !== filters.gender) return false;
      if (filters.theriotypes.length > 0 && p.primary_theriotype && !filters.theriotypes.includes(p.primary_theriotype)) return false;
      return true;
    });
  }, [profiles, filters]);

  const current = filtered[index];
  const filtersActive =
    filters.ageMin !== DEFAULT_FILTERS.ageMin ||
    filters.ageMax !== DEFAULT_FILTERS.ageMax ||
    filters.maxDistance !== DEFAULT_FILTERS.maxDistance ||
    filters.theriotypes.length > 0 ||
    filters.onlyPremium ||
    filters.gender !== "all";

  const handleSwipe = () => {
    swipeProfile?.();
    if (index >= filtered.length - 1) {
      setNoMoreVisible(true);
    } else {
      setIndex((i) => i + 1);
      setNoMoreVisible(false);
    }

    if (!isPremium) {
      swipeCount.current += 1;
      if (swipeCount.current % 10 === 0) {
        showInterstitialAd();
      }
    }
  };

  const handleLike = async () => {
    const target = current;
    if (!target) return handleSwipe();

    const isRealUser = target.id && typeof target.id === "string" && target.id.length > 30;

    if (isRealUser && user?.supabaseId) {
      try {
        const result = await sendLike({ likerId: user.supabaseId, likedId: target.id });
        if (result?.isMatch) {
          setMatchModal({
            other: target,
            myAvatar: user.avatar || user.avatar_url,
          });
          return; // No avanzar el swipe hasta que el usuario cierre el modal
        }
      } catch (e) {
        console.warn("Error enviando like:", e?.message);
      }
    }

    handleSwipe();
  };

  const closeMatchModal = () => {
    setMatchModal(null);
    handleSwipe();
  };

  const openMatchChat = () => {
    const other = matchModal?.other;
    setMatchModal(null);
    if (!other) {
      handleSwipe();
      return;
    }
    navigation.navigate("ChatRoomPage", {
      name: other.display_name || other.name,
      photo: other.avatar || other.photos?.[0],
      photos: other.photos || (other.avatar ? [other.avatar] : []),
      exclusivePhotos: other.exclusive_photos || [],
      otherIsPremium: other.isPremium,
      primaryTheriotype: other.primary_theriotype,
      contactId: other.id,
      targetUserId: other.id,
    });
    // Avanzar el swipe en segundo plano para que al volver no veas el mismo perfil
    handleSwipe();
  };

  const handleSuperLike = async () => {
    if (!current) return;

    const isRealUser = current.id && typeof current.id === "string" && current.id.length > 30;
    let sentToSupabase = false;

    if (isRealUser && user?.supabaseId) {
      try {
        const result = await sendSuperMatch({ senderId: user.supabaseId, receiverId: current.id });
        sentToSupabase = true;
        if (result) {
          alert(`✨ Super Match enviado a ${current.display_name || current.name}`);
        }
      } catch (e) {
        console.error("Error enviando super match:", e);
        alert(`Error enviando Super Match: ${e?.message || "error desconocido"}`);
      }
    } else if (isRealUser && !user?.supabaseId) {
      alert("Error: tu sesión no tiene supabaseId. Cerrá sesión y volvé a entrar.");
    }

    // Solo guardar local si NO se envió a Supabase (fallback offline)
    // O si es un perfil fake (no UUID). Esto evita duplicados.
    if (!sentToSupabase) {
      const existing = await loadData("sent_super_matches", []);
      const alreadyExists = existing.find((m) => m.id === current.id);
      if (!alreadyExists) {
        const newMatch = {
          id: current.id || Date.now(),
          sender: {
            id: current.id,
            display_name: current.display_name || current.name,
            avatar: current.avatar,
            photos: current.photos || (current.avatar ? [current.avatar] : []),
            primary_theriotype: current.primary_theriotype,
          },
          created_at: new Date().toISOString(),
        };
        await saveData("sent_super_matches", [newMatch, ...existing]);
      }
    }
    handleSwipe();
  };

  const applyFilters = () => {
    setFilters({ ...pendingFilters });
    setIndex(0);
    setNoMoreVisible(false);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
  };

  const toggleTheriotype = (t) => {
    setPendingFilters((prev) => ({
      ...prev,
      theriotypes: prev.theriotypes.includes(t)
        ? prev.theriotypes.filter((x) => x !== t)
        : [...prev.theriotypes, t],
    }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>TherianMatchConnect</Text>
        <TouchableOpacity onPress={() => { setPendingFilters(filters); setShowFilters(true); }} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={filtersActive ? "#22c55e" : "white"} />
          {filtersActive && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* SWIPE AREA */}
      {!noMoreVisible && current ? (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <SwipeCard
            key={current.id ?? index}
            profile={current}
            onNope={handleSwipe}
            onLike={handleLike}
            onSuper={handleSuperLike}
            onOpenGallery={() => navigation.navigate("GalleryPage", { photos: current.photos })}
            onOpenProfile={() => navigation.navigate("ProfileDetail", { profile: current })}
          />
        </Animated.View>
      ) : (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>✨</Text>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginTop: 16 }}>
            {noMoreVisible ? "¡Ya viste todos!" : "Sin resultados"}
          </Text>
          <Text style={{ color: "#666", marginTop: 8, textAlign: "center", paddingHorizontal: 40 }}>
            {noMoreVisible
              ? "Volvé más tarde o ampliá los filtros"
              : "Ningún perfil coincide con tus filtros"}
          </Text>
          {filtersActive && (
            <TouchableOpacity
              onPress={() => { setFilters(DEFAULT_FILTERS); setIndex(0); setNoMoreVisible(false); }}
              style={{ marginTop: 20, backgroundColor: "#16a34a", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Quitar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* SWIPES COUNTER */}
      {user && (
        <View style={styles.swipesBar}>
          <Text style={{ color: "#666", fontSize: 13 }}>
            {filtered.length - index > 0 ? `${filtered.length - index} perfiles` : "Sin más perfiles"} •{" "}
            <Text style={{ color: user.swipesLeft > 0 ? "#22c55e" : "#ef4444" }}>
              {user.swipesLeft ?? 0} swipes restantes hoy
            </Text>
          </Text>
        </View>
      )}

      {/* BANNER PUBLICITARIO — solo usuarios free */}
      {!isPremium && <BannerAdComponent style={styles.banner} />}

      {/* MODAL DE MATCH */}
      <MatchModal
        visible={!!matchModal}
        myAvatar={matchModal?.myAvatar}
        otherAvatar={matchModal?.other?.avatar || matchModal?.other?.photos?.[0]}
        otherName={matchModal?.other?.display_name || matchModal?.other?.name}
        onSendMessage={openMatchChat}
        onKeepSwiping={closeMatchModal}
      />

      {/* MODAL FILTROS */}
      <Modal visible={showFilters} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
          <View style={styles.filterSheet}>
            {/* Handle */}
            <View style={{ width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginBottom: 16 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Filtros</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={{ color: "#22c55e", fontSize: 15 }}>Resetear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* EDAD */}
              <FilterSection title="Rango de edad">
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.filterLabel}>Mínima: {pendingFilters.ageMin}</Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      {[18, 20, 22, 25, 28, 30].map((v) => (
                        <TouchableOpacity key={v} onPress={() => setPendingFilters((p) => ({ ...p, ageMin: v }))} style={[styles.chip, pendingFilters.ageMin === v && styles.chipActive]}>
                          <Text style={{ color: pendingFilters.ageMin === v ? "#22c55e" : "#aaa", fontSize: 13 }}>{v}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.filterLabel}>Máxima: {pendingFilters.ageMax}</Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      {[25, 30, 35, 40, 50, 99].map((v) => (
                        <TouchableOpacity key={v} onPress={() => setPendingFilters((p) => ({ ...p, ageMax: v }))} style={[styles.chip, pendingFilters.ageMax === v && styles.chipActive]}>
                          <Text style={{ color: pendingFilters.ageMax === v ? "#22c55e" : "#aaa", fontSize: 13 }}>{v === 99 ? "Sin límite" : v}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </FilterSection>

              {/* DISTANCIA */}
              <FilterSection title={`Distancia máxima: ${pendingFilters.maxDistance === 500 ? "Sin límite" : pendingFilters.maxDistance + " km"}`}>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {[5, 10, 25, 50, 100, 500].map((v) => (
                    <TouchableOpacity key={v} onPress={() => setPendingFilters((p) => ({ ...p, maxDistance: v }))} style={[styles.chip, pendingFilters.maxDistance === v && styles.chipActive]}>
                      <Text style={{ color: pendingFilters.maxDistance === v ? "#22c55e" : "#aaa", fontSize: 13 }}>{v === 500 ? "Sin límite" : v + " km"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FilterSection>

              {/* GÉNERO */}
              <FilterSection title="Mostrar">
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[["all", "Todos"], ["F", "Femenino"], ["M", "Masculino"]].map(([val, label]) => (
                    <TouchableOpacity key={val} onPress={() => setPendingFilters((p) => ({ ...p, gender: val }))} style={[styles.chip, pendingFilters.gender === val && styles.chipActive, { flex: 1, justifyContent: "center" }]}>
                      <Text style={{ color: pendingFilters.gender === val ? "#22c55e" : "#aaa", textAlign: "center", fontSize: 14 }}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FilterSection>

              {/* THERIOTYPE */}
              <FilterSection title="Theriotype">
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {THERIOTYPES_OPTIONS.map((t) => {
                    const active = pendingFilters.theriotypes.includes(t);
                    return (
                      <TouchableOpacity key={t} onPress={() => toggleTheriotype(t)} style={[styles.chip, active && styles.chipActive]}>
                        <Text style={{ color: active ? "#22c55e" : "#aaa", fontSize: 13 }}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </FilterSection>

              {/* PREMIUM */}
              <FilterSection title="Otros">
                <TouchableOpacity
                  onPress={() => setPendingFilters((p) => ({ ...p, onlyPremium: !p.onlyPremium }))}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                >
                  <View style={[styles.checkbox, pendingFilters.onlyPremium && styles.checkboxActive]}>
                    {pendingFilters.onlyPremium && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text style={{ color: "white", fontSize: 15 }}>Solo perfiles premium 👑</Text>
                </TouchableOpacity>
              </FilterSection>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity onPress={() => setShowFilters(false)} style={[styles.filterAction, { flex: 1, backgroundColor: "#1a1a1a" }]}>
                <Text style={{ color: "#aaa", fontSize: 16, textAlign: "center" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} style={[styles.filterAction, { flex: 2, backgroundColor: "#16a34a" }]}>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" }}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterSection({ title, children }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#000",
  },
  logo: { color: "white", fontSize: 20, fontWeight: "bold" },
  filterBtn: { padding: 8, position: "relative" },
  filterDot: {
    position: "absolute", top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e",
  },
  swipesBar: {
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#111",
  },
  banner: {
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderColor: "#111",
  },
  filterSheet: {
    backgroundColor: "#0f0f0f",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
    borderTopWidth: 1,
    borderColor: "#1e1e1e",
  },
  filterSectionTitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  filterLabel: { color: "#aaa", fontSize: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1a1a1a",
  },
  chipActive: {
    borderColor: "#22c55e",
    backgroundColor: "#0f2d0f",
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: "#444",
    justifyContent: "center", alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#16a34a",
    borderColor: "#22c55e",
  },
  filterAction: {
    padding: 14,
    borderRadius: 14,
  },
});
