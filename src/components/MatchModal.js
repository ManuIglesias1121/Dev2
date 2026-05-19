import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

export default function MatchModal({
  visible,
  myAvatar,
  otherAvatar,
  otherName,
  onSendMessage,
  onKeepSwiping,
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeepSwiping}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <LinearGradient
          colors={["#16a34a", "#22c55e", "#a78bfa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={{ transform: [{ scale }], alignItems: "center", padding: 24 }}>
          <Text style={styles.title}>¡Es un MATCH!</Text>
          <Text style={styles.subtitle}>
            A vos y a {otherName || "esta persona"} se gustaron mutuamente
          </Text>

          <View style={styles.avatarsRow}>
            <View style={styles.avatarWrap}>
              <Image source={resolveSource(myAvatar)} style={styles.avatar} />
            </View>
            <View style={styles.heartBubble}>
              <Ionicons name="heart" size={28} color="#ec4899" />
            </View>
            <View style={styles.avatarWrap}>
              <Image source={resolveSource(otherAvatar)} style={styles.avatar} />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={onSendMessage}>
            <Ionicons name="chatbubbles" size={20} color="white" />
            <Text style={styles.primaryBtnText}>Mandale un mensaje</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onKeepSwiping}>
            <Text style={styles.secondaryBtnText}>Seguir buscando</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 36,
    paddingHorizontal: 20,
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  avatarWrap: {
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 80,
    padding: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  heartBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: -16,
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    minWidth: 260,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
