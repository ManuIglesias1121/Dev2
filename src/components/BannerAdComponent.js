import React from "react";
import { View, Text, StyleSheet } from "react-native";

// En producción (EAS Build) con USE_REAL_ADS=true, reemplazar este componente
// por el BannerAd de react-native-google-mobile-ads

export default function BannerAdComponent({ style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Publicidad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#1e1e1e",
  },
  label: {
    color: "#333",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
