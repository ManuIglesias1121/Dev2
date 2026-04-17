import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function DiscoveryPage() {
  const navigation = useNavigation();
  const { user, discoveryProfiles, discoveryIndex, matchProfile, nextProfile } =
    useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const panX = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: Animated.event([null, { dx: panX.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          // Swipe right = like
          handleLike();
        } else if (gestureState.dx < -50) {
          // Swipe left = pass
          handlePass();
        } else {
          Animated.spring(panX, { toValue: { x: 0, y: 0 } , useNativeDriver: false}).start();
        }
      },
    })
  ).current;

  const currentProfile = discoveryProfiles[currentIndex];

  const handleLike = () => {
    panX.x.setValue(500);
    setTimeout(() => {
      if (currentIndex === 0) {
        matchProfile(currentProfile.id);
        Alert.alert(
          "¡Match!",
          `¡Tienes un match con ${currentProfile.name}!`,
          [{ text: "Ver Chat", onPress: () => navigation.navigate("ChatListPage") }]
        );
      } else {
        next();
      }
    }, 200);
  };

  const handlePass = () => {
    panX.x.setValue(-500);
    setTimeout(() => next(), 200);
  };

  const next = () => {
    setCurrentIndex(currentIndex + 1);
    panX.x.setValue(0);
    nextProfile();
  };

  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#1a1a2e", "#0f172a"]} style={StyleSheet.absoluteFill} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐺</Text>
          <Text style={styles.emptyText}>No hay más perfiles hoy</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => setCurrentIndex(0)}
          >
            <Text style={styles.btnText}>Volver a empezar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const swipesLeft = user?.swipesLeft ?? 5;
  const canSwipe = swipesLeft > 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a1a2e", "#0f172a"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Descubrimiento</Text>
        <View style={styles.swipesContainer}>
          <Text style={styles.swipesIcon}>🔥</Text>
          <Text style={styles.swipesCount}>{swipesLeft}</Text>
        </View>
      </View>

      {/* Card Stack */}
      {canSwipe ? (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX: panX.x },
                {
                  rotate: panX.x.interpolate({
                    inputRange: [-200, 0, 200],
                    outputRange: ["15deg", "0deg", "-15deg"],
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri: currentProfile.photo }}
            style={styles.cardImage}
          />

          {/* Overlay Info */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.cardOverlay}
          >
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>{currentProfile.name}</Text>
                <Text style={styles.cardAge}>{currentProfile.age}</Text>
              </View>

              <Text style={styles.cardTheriotype}>
                {currentProfile.theriotype}
              </Text>

              <Text style={styles.cardBio}>{currentProfile.bio}</Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={styles.statText}>{currentProfile.rating}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>🔗</Text>
                  <Text style={styles.statText}>{currentProfile.compatibility}%</Text>
                </View>
                {currentProfile.isPremium && (
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>👑</Text>
                    <Text style={styles.statText}>Premium</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Like Indicator */}
          <Animated.Text
            style={[
              styles.indicator,
              {
                opacity: panX.x.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            ❤️ LIKE
          </Animated.Text>

          {/* Pass Indicator */}
          <Animated.Text
            style={[
              styles.indicatorPass,
              {
                opacity: panX.x.interpolate({
                  inputRange: [-150, 0],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            ✕ PASS
          </Animated.Text>
        </Animated.View>
      ) : (
        <View style={[styles.cardContainer, styles.emptyCard]}>
          <Text style={styles.emptyText}>No te quedan swipes 😿</Text>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Compra plan premium</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn]}
          onPress={handlePass}
          disabled={!canSwipe}
        >
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.infoBtn]}
          onPress={() => {
            Alert.alert(
              "Compatibilidad",
              `${currentProfile.compatibility}% compatible. ${currentProfile.bio}`
            );
          }}
        >
          <Text style={styles.actionIcon}>ℹ️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={handleLike}
          disabled={!canSwipe}
        >
          <Text style={styles.actionIcon}>❤️</Text>
        </TouchableOpacity>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          👉 Los planes premium tienen swipes ilimitados
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 24,
    color: "#16a34a",
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  swipesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  swipesIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  swipesCount: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  emptyCard: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: 16,
  },
  cardInfo: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  cardName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginRight: 8,
  },
  cardAge: {
    color: "#aaa",
    fontSize: 18,
  },
  cardTheriotype: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardBio: {
    color: "#ddd",
    fontSize: 14,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  indicator: {
    position: "absolute",
    top: 40,
    right: 20,
    fontSize: 36,
    fontWeight: "bold",
    color: "#22c55e",
    transform: [{ rotate: "-20deg" }],
  },
  indicatorPass: {
    position: "absolute",
    top: 40,
    left: 20,
    fontSize: 36,
    fontWeight: "bold",
    color: "#ef4444",
    transform: [{ rotate: "20deg" }],
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  passBtn: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  infoBtn: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  likeBtn: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  actionIcon: {
    fontSize: 24,
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoText: {
    color: "#3b82f6",
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
