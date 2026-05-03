import React, { useRef, useEffect } from "react";
import { Image, StyleSheet, View, Animated, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function PolaroidFrame({ source, name, isPremium, bio }) {
  // Animación de glow para premium
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPremium) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isPremium]);

  const animatedStyle = isPremium
    ? {
        shadowColor: "#22c55e",
        shadowOpacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
        shadowRadius: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 32],
        }),
        borderColor: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["#22c55e", "#bbf7d0"]
        }),
        borderWidth: 2,
      }
    : {};

  return (
    <Animated.View style={[styles.frame, animatedStyle]}>
      <View style={styles.innerFrame}>
        <Image source={source} style={styles.photo} />
        {bio ? (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.bioOverlay}
          >
            <Text style={styles.bioText} numberOfLines={2}>{bio}</Text>
          </LinearGradient>
        ) : null}
      </View>
      <View style={styles.nameContainer} pointerEvents="none">
        <Animated.Text style={styles.nameText}>{name}</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 380,
    height: 440,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    overflow: 'visible',
    alignSelf: 'center',
  },
  innerFrame: {
    width: 340,
    height: 340,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginTop: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#f5f5f5',
    alignSelf: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  bioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  bioText: {
    fontFamily: 'Satisfy_400Regular',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  nameContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 12,
  },
  nameText: {
    fontFamily: 'Satisfy_400Regular',
    fontSize: 36,
    color: '#222',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
