import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { fakeVisitors } from "../data/fakeVisitors";

export default function VisitorsPage() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [visitors] = useState(fakeVisitors);

  if (!user?.isPremium) {
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
          onPress={() =>
            navigation.navigate("ChatRoomPage", {
              chatId: v.id,
              name: v.display_name,
              photo: v.avatar,
            })
          }
        >
          <Image source={resolveSource(v.avatar)} style={styles.avatar} />

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
