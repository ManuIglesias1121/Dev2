import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { fakeSuperMatches } from "../data/fakeSuperMatches";

export default function SuperMatchInbox({ navigation }) {
  const { user } = useAuth();
  const [superMatches] = useState(fakeSuperMatches);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Inicio");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Super Matches</Text>
        <View style={styles.headerSpacer} />
      </View>

      {superMatches.length === 0 && (
        <Text style={styles.empty}>Todavía no recibiste Super Matches</Text>
      )}

      {superMatches.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate("SuperMatchDetail", {
              match: item,
            })
          }
        >
          <Image source={{ uri: item.sender.avatar }} style={styles.avatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.sender.display_name}</Text>
            <Text style={styles.type}>{item.sender.primary_theriotype}</Text>
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>

          <Text style={styles.icon}>✨</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  empty: {
    color: "#777",
    fontSize: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#22c55e33",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  name: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  type: {
    color: "#aaa",
    fontSize: 14,
  },
  time: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  icon: {
    fontSize: 26,
    marginLeft: 10,
  },
});
