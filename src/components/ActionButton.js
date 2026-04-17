import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function ActionButton({ icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={require("../../assets/icons/claw.png")}
        style={styles.claw}
      />

      <View style={styles.iconWrapper}>
        <Image source={icon} style={styles.icon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  claw: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    position: "absolute",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 38,
    height: 38,
    tintColor: "white",
  },
});
