import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TestPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TestPage funcionando</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" },
  text: { color: "#16a34a", fontSize: 28, fontWeight: "bold" },
});
