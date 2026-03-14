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

export default function VisitorsPage() {
  const { selectedProfile: profile } = useContext(AuthContext);
  const navigation = useNavigation();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadVisitors = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    if (!profile.is_premium) {
      setLoading(false);
      return;
    }

    const { data: visits } = await supabase
      .from("profile_visits")
      .select("visitor_id, created_at")
      .eq("visited_id", profile.user_id)
      .order("created_at", { ascending: false });

    if (!visits) {
      setLoading(false);
      return;
    }

    const visitorIds = visits.map((v) => v.visitor_id);

    const { data: profilesData } = await supabase
      .from("therian_profiles")
      .select("*")
      .in("user_id", visitorIds);

    setVisitors(profilesData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!profile?.is_premium) {
    return (
      <View style={styles.center}>
        <Text style={styles.locked}>🔒 Solo para usuarios Premium</Text>
        <Text style={styles.lockedSub}>
          Hacete Premium para ver quién visitó tu perfil
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quién visitó tu perfil</Text>

      {visitors.map((v) => (
        <TouchableOpacity
          key={v.id}
          style={styles.card}
          onPress={async () => {
            const chatId = await getOrCreateChat(v.user_id);
            if (!chatId) return;

            // ⚠️ ChatRoom debe existir en tu navegación
            navigation.navigate("ChatRoom", {
              chatId,
              name: v.display_name,
              photo: v.avatar_url,
            });
          }}
        >
          {v.avatar_url && (
            <Image source={{ uri: v.avatar_url }} style={styles.avatar} />
          )}
          <Text style={styles.name}>{v.display_name}</Text>
          <Text style={styles.info}>{v.primary_theriotype}</Text>
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
  locked: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  lockedSub: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  name: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  info: {
    color: "#aaa",
    fontSize: 14,
  },
});
