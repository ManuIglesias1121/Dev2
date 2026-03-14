import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function MatchesPage() {
  const { selectedProfile: profile } = useContext(AuthContext);
  const navigation = useNavigation();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);

  const getOrCreateChat = async (otherUserId) => {
    if (!profile) return null;

    const myId = profile.user_id;

    const { data: existing } = await supabase
      .from("chats")
      .select("*")
      .or(
        `and(user1_id.eq.${myId},user2_id.eq.${otherUserId}),
         and(user1_id.eq.${otherUserId},user2_id.eq.${myId})`
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    const { data: created, error } = await supabase
      .from("chats")
      .insert({
        user1_id: myId,
        user2_id: otherUserId,
      })
      .select()
      .single();

    if (error) {
      console.log("Error creando chat:", error);
      return null;
    }

    return created.id;
  };

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("therian_profiles")
      .select("*")
      .limit(200);

    if (!data) return;

    const sorted = data.sort((a, b) => {
      if (a.is_premium && !b.is_premium) return -1;
      if (!a.is_premium && b.is_premium) return 1;
      return 0;
    });

    setProfiles(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const registerVisit = async (visitedId) => {
    if (!profile) return;

    await supabase.from("profile_visits").insert({
      visited_id: visitedId,
      visitor_id: profile.user_id,
    });
  };

  const handleView = (visitedId) => {
    registerVisit(visitedId);

    if (profile?.is_premium) return;

    const newCount = viewCount + 1;
    setViewCount(newCount);

    if (newCount >= 4) {
      triggerAd();
    }
  };

  const triggerAd = () => {
    setShowAd(true);
    setAdTimer(15);

    const interval = setInterval(() => {
      setAdTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowAd(false);
          setViewCount(0);
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (showAd && !profile?.is_premium) {
    return (
      <View style={styles.adContainer}>
        <Text style={styles.adText}>Publicidad…</Text>
        <Text style={styles.adTimer}>Volviendo en {adTimer} segundos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profiles.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.card}
          onPress={async () => {
            handleView(p.user_id);

            const chatId = await getOrCreateChat(p.user_id);
            if (!chatId) return;

            navigation.navigate("ChatRoom", {
              chatId,
              name: p.display_name,
              photo: p.avatar_url,
            });
          }}
        >
          {p.avatar_url && (
            <Image source={{ uri: p.avatar_url }} style={styles.avatar} />
          )}

          <View style={styles.row}>
            <Text style={styles.name}>{p.display_name}</Text>
            {p.is_premium && <Text style={styles.premiumBadge}>🐺✨</Text>}
          </View>

          <Text style={styles.info}>{p.primary_theriotype}</Text>
          <Text style={styles.info}>{p.species_family}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 16 },
  center: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22c55e33",
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  name: { color: "white", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  premiumBadge: { fontSize: 20, marginLeft: 6 },
  info: { color: "#aaa", fontSize: 14 },
  adContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  adText: { color: "white", fontSize: 28, fontWeight: "700", marginBottom: 12 },
  adTimer: { color: "#22c55e", fontSize: 20 },
});
