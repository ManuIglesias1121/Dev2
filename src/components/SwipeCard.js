import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileCard from "./ProfileCard";

const SWIPE_THRESHOLD_X = 100;
const SWIPE_THRESHOLD_Y = -80;

export default function SwipeCard({
  profile,
  onNope,
  onLike,
  onSuper,
  onOpenGallery,
}) {
  const pan = useRef(new Animated.ValueXY()).current;

  const flyOut = (toX, toY, action) => {
    Animated.timing(pan, {
      toValue: { x: toX, y: toY },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      action?.();
    });
  };

  const snapBack = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();

        if (g.dy < SWIPE_THRESHOLD_Y && Math.abs(g.dx) < 80) {
          flyOut(g.dx * 2, -600, onSuper);
        } else if (g.dx > SWIPE_THRESHOLD_X) {
          flyOut(500, g.dy, onLike);
        } else if (g.dx < -SWIPE_THRESHOLD_X) {
          flyOut(-500, g.dy, onNope);
        } else {
          snapBack();
        }
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        snapBack();
      },
    })
  ).current;

  if (!profile) return null;

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [20, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = pan.x.interpolate({
    inputRange: [-100, -20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const superOpacity = pan.y.interpolate({
    inputRange: [-100, -30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Animated.View
          style={{
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
          }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity onPress={() => onOpenGallery?.()} activeOpacity={0.95}>
            <ProfileCard profile={profile} />

            <Animated.View style={[styles.overlay, styles.overlayLike, { opacity: likeOpacity }]}>
              <Ionicons name="heart" size={60} color="#22c55e" />
            </Animated.View>

            <Animated.View style={[styles.overlay, styles.overlayNope, { opacity: nopeOpacity }]}>
              <Ionicons name="close" size={60} color="#ef4444" />
            </Animated.View>

            <Animated.View style={[styles.overlay, styles.overlaySuper, { opacity: superOpacity }]}>
              <Ionicons name="star" size={60} color="#f59e0b" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Botones */}
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={() => flyOut(-500, 0, onNope)}
            style={[styles.button, styles.buttonNope]}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={36} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => flyOut(0, -600, onSuper)}
            style={[styles.button, styles.buttonSuper]}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={30} color="#f59e0b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => flyOut(500, 0, onLike)}
            style={[styles.button, styles.buttonLike]}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={32} color="#22c55e" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  overlayLike:  { backgroundColor: "rgba(34,197,94,0.25)" },
  overlayNope:  { backgroundColor: "rgba(239,68,68,0.25)" },
  overlaySuper: { backgroundColor: "rgba(245,158,11,0.25)" },
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
  button: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  buttonNope:  { backgroundColor: "rgba(239,68,68,0.1)",  borderColor: "#ef4444" },
  buttonSuper: { backgroundColor: "rgba(245,158,11,0.1)", borderColor: "#f59e0b", width: 56, height: 56, borderRadius: 28 },
  buttonLike:  { backgroundColor: "rgba(34,197,94,0.1)",  borderColor: "#22c55e" },
});
