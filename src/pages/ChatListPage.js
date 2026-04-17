import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const MOOD_ICONS = {
  romantic: "😍",
  playful: "😄",
  mysterious: "😎",
  passionate: "🔥",
  neutral: "😐",
};

const STATUS_COLORS = {
  active: "#22c55e",
  away: "#fbbf24",
  offline: "#6b7280",
};

export default function ChatListPage() {
  const navigation = useNavigation();
  const { user, relationshipDays } = useAuth();

  const contact = user?.chatContact || {
    id: 1,
    name: "Luna Wolf",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    isPremium: true,
    mood: "romantic",
    onlineStatus: "active",
    relationshipDays: relationshipDays,
  };

  // Milestones
  const getMilestoneMessage = () => {
    if (relationshipDays === 0) return "¡Recién conocidos! 🌙";
    if (relationshipDays < 7) return `${relationshipDays} días en la manada`;
    if (relationshipDays < 30) return `${Math.floor(relationshipDays / 7)} semanas juntos`;
    if (relationshipDays < 365) return `${Math.floor(relationshipDays / 30)} meses juntos`;
    return `${Math.floor(relationshipDays / 365)} años juntos`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header con monedas */}
        <View style={styles.top}>
          <Text style={styles.title}>Chats</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("GiftShopPage")}
            style={styles.coinsButton}
          >
            <Text style={styles.coinsIcon}>💰</Text>
            <Text style={styles.coinsText}>{user?.coins || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Card */}
        <View style={styles.chatCard}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChatRoomPage", {
                name: contact.name,
                photo: contact.photo,
                isPremium: contact.isPremium,
              })
            }
            style={styles.chatBody}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: contact.photo }}
                style={styles.avatar}
              />
              {/* Status online */}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: STATUS_COLORS[contact.onlineStatus] },
                ]}
              />
            </View>

            <View style={styles.info}>
              <View style={styles.header}>
                <Text style={styles.name}>{contact.name}</Text>
                {contact.isPremium && <Text style={styles.badge}>👑</Text>}
              </View>

              {/* Mood */}
              <View style={styles.moodContainer}>
                <Text style={styles.moodIcon}>
                  {MOOD_ICONS[contact.mood] || "😐"}
                </Text>
                <Text style={styles.moodText}>
                  {contact.mood === "romantic"
                    ? "Romantique mood 💕"
                    : contact.mood === "playful"
                    ? "En modo diversión 🎉"
                    : contact.mood === "mysterious"
                    ? "Energía misteriosa 🌙"
                    : contact.mood === "passionate"
                    ? "Dale fuego 🔥"
                    : "Modo neutral"}
                </Text>
              </View>

              {/* Relationship Days */}
              <Text style={styles.relationship}>
                📅 {getMilestoneMessage()}
              </Text>

              {/* Status */}
              <Text style={styles.status}>
                🟢 {contact.onlineStatus === "active" ? "En línea ahora" : "Hace poco"}
              </Text>
            </View>

            {/* Flecha */}
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Plan</Text>
            <Text style={styles.statValue}>
              {user?.isPremium ? user.premiumPlan : "Free"}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Regalos</Text>
            <Text style={styles.statValue}>{user?.gifts.length || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Días</Text>
            <Text style={styles.statValue}>{relationshipDays}</Text>
          </View>
        </View>

        {/* Relationship Progress */}
        {relationshipDays > 0 && (
          <View style={styles.progressBox}>
            <Text style={styles.progressTitle}>🌙 Progreso de la Relación</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: Math.min((relationshipDays / 30) * 100, 100) + "%",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {relationshipDays >= 30
                ? "¡Primer mes completado! 🎉"
                : `${30 - relationshipDays} días para el primer mes`}
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Pro tip</Text>
          <Text style={styles.infoText}>
            Compra regalos especiales en la tienda para desbloquear más funciones. ¡Cada día cuenta!
          </Text>
        </View>

        {/* Achievements Link */}
        <TouchableOpacity
          style={styles.achievementsLink}
          onPress={() => navigation.navigate("AchievementsPage")}
        >
          <Text style={styles.achievementsIcon}>🏆</Text>
          <View style={styles.achievementsText}>
            <Text style={styles.achievementsTitle}>Ver tus Logros</Text>
            <Text style={styles.achievementsDesc}>
              Desbloquea logros y gana monedas
            </Text>
          </View>
          <Text style={styles.achievementsArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 40,
  },
  content: {
    paddingBottom: 32,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    color: "#16a34a",
    fontSize: 32,
    fontWeight: "bold",
  },
  coinsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  coinsIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  coinsText: {
    color: "#22c55e",
    fontWeight: "bold",
  },
  chatCard: {
    marginHorizontal: 16,
    backgroundColor: "rgba(22, 163, 74, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#16a34a33",
    overflow: "hidden",
  },
  chatBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#16a34a",
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  badge: {
    fontSize: 16,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  moodIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  moodText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "500",
  },
  relationship: {
    color: "#f472b6",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  status: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "500",
  },
  arrow: {
    color: "#16a34a",
    fontSize: 24,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(22, 163, 74, 0.3)",
  },
  statLabel: {
    color: "#888",
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: "#16a34a",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoBox: {
    marginHorizontal: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
    marginBottom: 16,
  },
  infoTitle: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    color: "#bbb",
    fontSize: 13,
    lineHeight: 18,
  },
  progressBox: {
    marginHorizontal: 16,
    backgroundColor: "rgba(244, 114, 182, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f472b6",
  },
  progressTitle: {
    color: "#f472b6",
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f472b6",
  },
  progressText: {
    color: "#aaa",
    fontSize: 12,
  },
  achievementsLink: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#fbbf24",
    marginBottom: 24,
  },
  achievementsIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  achievementsText: {
    flex: 1,
  },
  achievementsTitle: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  achievementsDesc: {
    color: "#aaa",
    fontSize: 12,
  },
  achievementsArrow: {
    color: "#fbbf24",
    fontSize: 16,
  },
});
