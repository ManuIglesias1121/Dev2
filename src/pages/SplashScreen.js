import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Text } from "react-native";

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
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <Image
          source={require("../../assets/logo1.png")}
          style={{
            width: 180,
            height: 180,
            resizeMode: "contain",
          }}
        />

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
