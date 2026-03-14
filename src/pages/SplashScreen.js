import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(onFinish, 800);
    });
  }, []);

  return (
    <LinearGradient
      colors={["#000", "#0a0a0a", "#000"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={{ fontSize: 80, color: "#22c55e", textAlign: "center" }}>
          🐾
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          TherianMatch
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}
