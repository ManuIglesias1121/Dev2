import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback, useEffect } from "react";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}
import {
  Alert,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { fakeMatches } from "../data/fakeMatches";
import { loadData, saveData } from "../services/storageService";
import { fetchReceivedSuperMatches, subscribeToSuperMatches } from "../services/superMatchService";
import { fetchMatches, subscribeToMatches } from "../services/matchService";

const DELETED_MATCHES_KEY = "deleted_matches";

function timeAgo(isoDate) {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function MatchesPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState(fakeMatches);
  const [deletedIds, setDeletedIds] = useState([]);
  const [unreadSuperCount, setUnreadSuperCount] = useState(0);

  const loadMatches = useCallback(async () => {
    const deleted = await loadData(DELETED_MATCHES_KEY, []);
    setDeletedIds(deleted);

    let realSupers = [];
    let realMutual = [];

    if (user?.supabaseId) {
      try {
        const supers = await fetchReceivedSuperMatches(user.supabaseId);
        setUnreadSuperCount(supers.filter((sm) => !sm.is_read).length);
        realSupers = supers.map((sm) => ({
          id: `super_${sm.id}`,
          display_name: sm.sender.display_name,
          avatar: sm.sender.avatar,
          photos: sm.sender.photos || [],
          exclusive_photos: sm.sender.exclusive_photos || [],
          primary_theriotype: sm.sender.primary_theriotype,
          age: null,
          city: null,
          biography: null,
          distance: null,
          isPremium: sm.sender.isPremium || false,
          isOnline: false,
          unreadCount: sm.is_read ? 0 : 1,
          lastMessage: "Te mandó un Super Match ✨",
          matchedAt: sm.created_at,
          targetUserId: sm.sender.id,
        }));
      } catch (e) {
        console.warn("Error cargando super matches:", e?.message);
      }

      try {
        const mutual = await fetchMatches(user.supabaseId);
        realMutual = mutual.map((m) => ({
          id: `match_${m.id}`,
          display_name: m.other.display_name,
          avatar: m.other.avatar,
          photos: m.other.photos,
          exclusive_photos: m.other.exclusive_photos || [],
          primary_theriotype: m.other.primary_theriotype,
          age: m.other.age,
          city: m.other.city,
          biography: null,
          distance: null,
          isPremium: m.other.isPremium || false,
          isOnline: false,
          unreadCount: 0,
          lastMessage: "¡Hicieron match! 💚 Mandá el primer mensaje",
          matchedAt: m.created_at,
          targetUserId: m.other.id,
        }));
      } catch (e) {
        console.warn("Error cargando matches mutuos:", e?.message);
      }
    }

    // Dedup: si una persona está en mutual y en super, priorizar mutual
    const mutualUserIds = new Set(realMutual.map((m) => m.targetUserId));
    const supersFiltered = realSupers.filter((s) => !mutualUserIds.has(s.targetUserId));

    setMatches([...realMutual, ...supersFiltered, ...fakeMatches]);
  }, [user?.supabaseId]);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  // Realtime: si llega un super match o match nuevo, actualizar
  useEffect(() => {
    if (!user?.supabaseId) return;
    const unsubSupers = subscribeToSuperMatches(user.supabaseId, () => loadMatches());
    const unsubMatches = subscribeToMatches(user.supabaseId, () => loadMatches());
    return () => {
      unsubSupers();
      unsubMatches();
    };
  }, [user?.supabaseId, loadMatches]);

  const handleDelete = (match) => {
    Alert.alert(
      "Eliminar match",
      `¿Eliminar el match con ${match.display_name}? No vas a ver más esta conversación.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const newDeleted = [...deletedIds, match.id];
            setDeletedIds(newDeleted);
            await saveData(DELETED_MATCHES_KEY, newDeleted);
          },
        },
      ]
    );
  };

  const visibleMatches = matches.filter((m) => !deletedIds.includes(m.id));
  const filtered = visibleMatches.filter((m) =>
    m.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const newMatches = filtered.filter(
    (m) => Date.now() - new Date(m.matchedAt).getTime() < 1000 * 60 * 60 * 24
  );
  const olderMatches = filtered.filter(
    (m) => Date.now() - new Date(m.matchedAt).getTime() >= 1000 * 60 * 60 * 24
  );

  const goToChat = (match) => {
    const isRealUser = match.targetUserId && typeof match.targetUserId === "string" && match.targetUserId.length > 30;
    navigation.navigate("ChatRoomPage", {
      name: match.display_name,
      photo: match.avatar,
      photos: match.photos || (match.avatar ? [match.avatar] : []),
      exclusivePhotos: match.exclusive_photos || [],
      otherIsPremium: match.isPremium,
      primaryTheriotype: match.primary_theriotype,
      contactId: isRealUser ? match.targetUserId : `match_${match.id}`,
      targetUserId: isRealUser ? match.targetUserId : null,
      isPremium: match.isPremium,
    });
  };

  const goToProfile = (match) => {
    navigation.navigate("ProfileDetail", {
      profile: {
        id: match.targetUserId,
        display_name: match.display_name,
        avatar: match.avatar,
        photos: match.photos?.length ? match.photos : (match.avatar ? [match.avatar] : []),
        exclusive_photos: match.exclusive_photos || [],
        primary_theriotype: match.primary_theriotype,
        species_family: match.species_family,
        age: match.age,
        city: match.city,
        biography: match.biography,
        distance: match.distance,
        isPremium: match.isPremium,
      },
    });
  };

  const MatchCard = ({ item }) => (
    <View style={[styles.card, item.unreadCount > 0 && styles.cardNew]}>
      {item.unreadCount > 0 && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NUEVO</Text>
        </View>
      )}
      {/* Foto: tap abre galería */}
      <TouchableOpacity
        onPress={() => {
          const photos = item.photos?.length ? item.photos : (item.avatar ? [item.avatar] : []);
          if (photos.length > 0) {
            navigation.navigate("GalleryPage", { photos, initialIndex: 0 });
          } else {
            goToProfile(item);
          }
        }}
        onLongPress={() => handleDelete(item)}
        style={{ position: "relative" }}
      >
        <Image source={resolveSource(item.avatar)} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineDot} />}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Info: tap abre el chat */}
      <TouchableOpacity
        style={styles.cardInfo}
        onPress={() => goToChat(item)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.name}>{item.display_name}</Text>
          {item.age && <Text style={{ color: "#666", fontSize: 14 }}>{item.age}</Text>}
          {item.isPremium && <Text style={{ fontSize: 13 }}>👑</Text>}
        </View>
        <Text style={styles.theriotype}>{item.primary_theriotype} • {item.city}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </TouchableOpacity>

      <View style={styles.cardRight}>
        <Text style={styles.timeAgo}>{timeAgo(item.matchedAt)}</Text>
        <TouchableOpacity onPress={() => goToProfile(item)} style={styles.profileBtn}>
          <Ionicons name="person-outline" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const NewMatchBubble = ({ item }) => (
    <View style={styles.bubble}>
      {/* Foto: tap abre galería */}
      <TouchableOpacity
        onPress={() => {
          const photos = item.photos?.length ? item.photos : (item.avatar ? [item.avatar] : []);
          if (photos.length > 0) {
            navigation.navigate("GalleryPage", { photos, initialIndex: 0 });
          } else {
            goToProfile(item);
          }
        }}
        onLongPress={() => handleDelete(item)}
        style={{ position: "relative" }}
      >
        <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.bubbleRing}>
          <Image source={resolveSource(item.avatar)} style={styles.bubbleAvatar} />
        </LinearGradient>
        {item.isOnline && <View style={[styles.onlineDot, { bottom: 2, right: 2 }]} />}
      </TouchableOpacity>
      {/* Nombre: tap abre chat */}
      <TouchableOpacity onPress={() => goToChat(item)}>
        <Text style={styles.bubbleName} numberOfLines={1}>{item.display_name}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#0f0f0f", "#0a0a0a"]} style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Matches</Text>
            <Text style={styles.headerCount}>{visibleMatches.length} conexiones · mantén apretado para borrar</Text>
          </View>
          <View style={{ position: "relative", paddingTop: 8, paddingRight: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SuperMatchInbox")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: unreadSuperCount > 0 ? "#22c55e" : "rgba(34,197,94,0.15)",
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#22c55e",
              }}
            >
              <Ionicons name="star" size={18} color={unreadSuperCount > 0 ? "white" : "#22c55e"} />
              <Text style={{ color: unreadSuperCount > 0 ? "white" : "#22c55e", fontWeight: "bold", fontSize: 13 }}>Super</Text>
            </TouchableOpacity>
            {unreadSuperCount > 0 && (
              <View style={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "#ef4444",
                borderRadius: 12,
                minWidth: 24,
                height: 24,
                paddingHorizontal: 6,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#000",
                zIndex: 10,
              }}>
                <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>{unreadSuperCount}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#555" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar match..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[]}
        ListHeaderComponent={() => (
          <>
            {/* NUEVOS MATCHES */}
            {newMatches.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>Nuevos matches ✨</Text>
                <FlatList
                  data={newMatches}
                  keyExtractor={(m) => `bubble_${m.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
                  renderItem={({ item }) => <NewMatchBubble item={item} />}
                />
              </View>
            )}

            {/* TODOS LOS MENSAJES */}
            {olderMatches.length > 0 && (
              <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>Conversaciones</Text>
            )}
          </>
        )}
        ListFooterComponent={() => (
          <>
            {olderMatches.map((m) => <MatchCard key={m.id} item={m} />)}
            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48 }}>💫</Text>
                <Text style={styles.emptyTitle}>Sin matches aún</Text>
                <Text style={styles.emptySubtitle}>
                  {search ? "No encontramos ese match" : "¡Seguí haciendo swipe para encontrar tu manada!"}
                </Text>
                {!search && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("MainTabs", { screen: "Inicio" })}
                    style={styles.discoverBtn}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>Descubrir perfiles</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
        keyExtractor={() => "header"}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: "white", fontSize: 28, fontWeight: "bold" },
  headerCount: { color: "#666", fontSize: 14, marginTop: 2 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
  searchInput: { flex: 1, color: "white", fontSize: 15, paddingVertical: 12 },
  sectionTitle: { color: "#888", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  bubble: { alignItems: "center", width: 70 },
  bubbleRing: { width: 64, height: 64, borderRadius: 32, padding: 2, justifyContent: "center", alignItems: "center" },
  bubbleAvatar: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: "#0a0a0a" },
  bubbleName: { color: "white", fontSize: 11, marginTop: 6, textAlign: "center" },
  onlineDot: {
    position: "absolute", bottom: 3, right: 3,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#22c55e", borderWidth: 2, borderColor: "#0a0a0a",
  },
  unreadBadge: {
    position: "absolute", top: -2, right: -2,
    backgroundColor: "#ef4444", borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 4, borderWidth: 2, borderColor: "#0a0a0a",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#111",
    position: "relative",
  },
  cardNew: {
    backgroundColor: "rgba(34,197,94,0.06)",
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
  },
  newBadge: {
    position: "absolute",
    top: 8,
    right: 16,
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  newBadgeText: { color: "white", fontSize: 9, fontWeight: "bold", letterSpacing: 0.5 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  cardInfo: { flex: 1 },
  name: { color: "white", fontSize: 16, fontWeight: "700" },
  theriotype: { color: "#666", fontSize: 13, marginTop: 2 },
  lastMessage: { color: "#888", fontSize: 13, marginTop: 4 },
  cardRight: { alignItems: "flex-end", gap: 8 },
  timeAgo: { color: "#555", fontSize: 12 },
  profileBtn: { padding: 6 },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginTop: 16 },
  emptySubtitle: { color: "#666", textAlign: "center", marginTop: 8, lineHeight: 20 },
  discoverBtn: { backgroundColor: "#16a34a", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 20 },
});
