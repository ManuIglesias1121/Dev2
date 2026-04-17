import React, { useRef } from "react";
import { Animated, Image, StyleSheet, TouchableOpacity, View } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
import ProfileCard from "./ProfileCard"; // ← IMPORTANTE

export default function SwipeCard({
  profile,
  onNope,
  onLike,
  onSuper,
  onOpenGallery,
  onOpenProfile,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const animateAndAction = (direction, action) => {
    let toX = 0;
    let toY = 0;
    let toRotate = 0;

    if (direction === 'left') {
      toX = -150; // menos distancia, más sutil
      toRotate = -10; // rotación ligera
    } else if (direction === 'right') {
      toX = 150;
      toRotate = 10;
    } else if (direction === 'up') {
      toY = -150;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: toX,
        duration: 400,
        useNativeDriver: false,  // Cambiado a false para compatibilidad con rotate
      }),
      Animated.timing(translateY, {
        toValue: toY,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, {
        toValue: toRotate,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Reset animación
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);
      // Ejecutar acción (cambiar perfil)
      action();
    });
  };

  if (!profile) return null;

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <View style={styles.container}>
      {/* Contenedor para centrar la polaroid */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={{
            transform: [
              { translateX },
              { translateY },
              { rotate: rotateInterpolate },
            ],
          }}
        >
          <TouchableOpacity onPress={() => onOpenGallery && onOpenGallery(profile)}>
            <ProfileCard profile={profile} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Botones abajo */}
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={() => animateAndAction('left', onNope)}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Image
              source={require("../assets/botoncruz.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => animateAndAction('up', onSuper)}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Image
              source={require("../assets/botonestrella.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => animateAndAction('right', onLike)}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Image
              source={require("../assets/botoncorazon.png")}
              style={styles.icon}
            />
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
    width: 90,
    height: 90,
  },
  icon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
