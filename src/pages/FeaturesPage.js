import React from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth, useFeatures } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

export default function FeaturesPage() {
  const { user, PLAN_FEATURES, GIFT_FEATURES } = useAuth();
  const { hasFeature } = useFeatures();

  const currentPlan = user?.premiumPlan || "free";
  const planFeatures = PLAN_FEATURES[currentPlan] || PLAN_FEATURES.free;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>✨ Features Desbloqueados</Text>
          <Text style={styles.subtitle}>Plan: {currentPlan.toUpperCase()}</Text>
        </View>

        {/* Plan Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Funciones de Plan</Text>

          <View style={styles.featuresGrid}>
            {Object.entries(planFeatures).map(([key, enabled]) => (
              <View
                key={key}
                style={[
                  styles.featureItem,
                  enabled ? styles.featureEnabled : styles.featureDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.featureName,
                    enabled ? styles.textEnabled : styles.textDisabled,
                  ]}
                >
                  {enabled ? "✓" : "✗"} {key}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Regalos Comprados */}
        {user?.gifts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 Regalos Comprados</Text>

            {user.gifts.map((giftId) => {
              const gift = GIFT_FEATURES[giftId];
              return (
                <View key={giftId} style={styles.giftBox}>
                  <View style={styles.giftHeader}>
                    <Text style={styles.giftIcon}>{gift.icon}</Text>
                    <View style={styles.giftInfo}>
                      <Text style={styles.giftName}>{gift.name}</Text>
                      <Text style={styles.giftDesc}>{gift.description}</Text>
                    </View>
                  </View>

                  <View style={styles.giftFeatures}>
                    {gift.features.map((feature) => (
                      <Text key={feature} style={styles.giftFeature}>
                        ✨ {feature}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Sin regalos */}
        {user?.gifts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyText}>
              No tienes regalos aún. ¡Compra uno en la tienda!
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Tu Perfil</Text>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Monedas:</Text>
            <Text style={styles.statValue}>💰 {user?.coins || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tu Mood:</Text>
            <Text style={styles.statValue}>
              {user?.mood === "romantic"
                ? "😍 Romántico"
                : user?.mood === "playful"
                ? "😄 Juguetón"
                : user?.mood === "mysterious"
                ? "😎 Misterioso"
                : user?.mood === "passionate"
                ? "🔥 Apasionado"
                : "😐 Neutral"}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mensajes hoy:</Text>
            <Text style={styles.statValue}>
              {user?.messagesSentToday || 0}/
              {currentPlan === "free" ? "10" : "∞"}
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Próximas Novedades</Text>
          <Text style={styles.infoText}>
            • Más regalos especiales próximamente{"\n"}
            • Sistema de achievement{"\n"}
            • Efectos de realidad aumentada{"\n"}
            • Videollamadas para premium
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  content: {
    paddingTop: 40,
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    color: "#16a34a",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureItem: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  featureEnabled: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "#22c55e",
  },
  featureDisabled: {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    borderColor: "#6b7280",
  },
  featureName: {
    fontSize: 12,
    fontWeight: "600",
  },
  textEnabled: {
    color: "#22c55e",
  },
  textDisabled: {
    color: "#9ca3af",
  },
  giftBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#a78bfa",
  },
  giftHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  giftIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  giftInfo: {
    flex: 1,
  },
  giftName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  giftDesc: {
    color: "#aaa",
    fontSize: 12,
  },
  giftFeatures: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(167, 139, 250, 0.3)",
  },
  giftFeature: {
    color: "#a78bfa",
    fontSize: 12,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    marginBottom: 8,
  },
  statLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  statValue: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    marginHorizontal: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoTitle: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    color: "#bbb",
    fontSize: 12,
    lineHeight: 18,
  },
});
