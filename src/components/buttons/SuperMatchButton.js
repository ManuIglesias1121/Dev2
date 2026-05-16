import React, { useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SuperMatchButton({ onPress, isPremium }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.15,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
    if (!isPremium) {
      onPress && onPress("upgrade");
      return;
    }
    onPress && onPress("supermatch");
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.button}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="star" size={36} color="#16a34a" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(22,163,74,0.35)",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  star: {
    fontSize: 32,
    color: "#16a34a",
    textShadowColor: "rgba(22,163,74,0.5)",
    textShadowRadius: 8,
  },
});
