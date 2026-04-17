import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
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
  const [matches] = useState(fakeMatches);

  const filtered = matches.filter((m) =>
    m.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const newMatches = filtered.filter(
    (m) => Date.now() - new Date(m.matchedAt).getTime() < 1000 * 60 * 60 * 24
  );
  const olderMatches = filtered.filter(
    (m) => Date.now() - new Date(m.matchedAt).getTime() >= 1000 * 60 * 60 * 24
  );

  const goToChat = (match) => {
    navigation.navigate("ChatRoomPage", {
      name: match.display_name,
      photo: match.avatar,
      contactId: `match_${match.id}`,
      isPremium: match.isPremium,
    });
  };

  const goToProfile = (match) => {
    navigation.navigate("ProfileDetail", {
      profile: {
        display_name: match.display_name,
        avatar: match.avatar,
        photos: [match.avatar],
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
    <TouchableOpacity onPress={() => goToChat(item)} style={styles.card}>
      <View style={{ position: "relative" }}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineDot} />}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>{item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.name}>{item.display_name}</Text>
          {item.age && <Text style={{ color: "#666", fontSize: 14 }}>{item.age}</Text>}
          {item.isPremium && <Text style={{ fontSize: 13 }}>👑</Text>}
        </View>
        <Text style={styles.theriotype}>🐾 {item.primary_theriotype} • {item.city}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>

      <View style={styles.cardRight}>
        <Text style={styles.timeAgo}>{timeAgo(item.matchedAt)}</Text>
        <TouchableOpacity onPress={() => goToProfile(item)} style={styles.profileBtn}>
          <Ionicons name="person-outline" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const NewMatchBubble = ({ item }) => (
    <TouchableOpacity onPress={() => goToChat(item)} style={styles.bubble}>
      <View style={{ position: "relative" }}>
        <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.bubbleRing}>
          <Image source={{ uri: item.avatar }} style={styles.bubbleAvatar} />
        </LinearGradient>
        {item.isOnline && <View style={[styles.onlineDot, { bottom: 2, right: 2 }]} />}
      </View>
      <Text style={styles.bubbleName} numberOfLines={1}>{item.display_name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#0f0f0f", "#0a0a0a"]} style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <Text style={styles.headerCount}>{matches.length} conexiones</Text>
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
                <Text style={{ fontSize: 48 }}>🐾</Text>
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
  },
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
