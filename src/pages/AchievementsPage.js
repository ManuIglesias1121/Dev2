import React from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

export default function AchievementsPage() {
  const { user, achievements, relationshipDays, ACHIEVEMENTS } = useAuth();

  const getAchievementStatus = (achievementId) => {
    return achievements.includes(achievementId);
  };

  const groupedAchievements = {
    basic: [],
    engagement: [],
    milestone: [],
    premium: [],
  };

  Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
    groupedAchievements[achievement.category].push([id, achievement]);
  });

  const AchievementCard = ({ id, achievement, unlocked }) => (
    <View style={[styles.achievementCard, !unlocked && styles.locked]}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>

      <View style={styles.achievementContent}>
        <Text style={[styles.achievementName, !unlocked && styles.lockedText]}>
          {achievement.name}
        </Text>
        <Text style={styles.achievementDesc}>{achievement.desc}</Text>

        <View style={styles.rewardBadge}>
          <Text style={styles.rewardIcon}>💰</Text>
          <Text style={styles.rewardText}>+{achievement.reward}</Text>
        </View>
      </View>

      {unlocked && <Text style={styles.unlockedBadge}>✓</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Logros</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Desbloqueados</Text>
              <Text style={styles.statValue}>
                {achievements.length}/{Object.keys(ACHIEVEMENTS).length}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Días junto a Luna</Text>
              <Text style={styles.statValue}>{relationshipDays}</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBox}>
          <Text style={styles.progressLabel}>Progreso General</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    (achievements.length / Object.keys(ACHIEVEMENTS).length) *
                    100 +
                    "%",
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(
              (achievements.length / Object.keys(ACHIEVEMENTS).length) * 100
            )}%
          </Text>
        </View>

        {/* Basic Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Básicos</Text>
          {groupedAchievements.basic.map(([id, achievement]) => (
            <AchievementCard
              key={id}
              id={id}
              achievement={achievement}
              unlocked={getAchievementStatus(id)}
            />
          ))}
        </View>

        {/* Engagement Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Engagement</Text>
          {groupedAchievements.engagement.map(([id, achievement]) => (
            <AchievementCard
              key={id}
              id={id}
              achievement={achievement}
              unlocked={getAchievementStatus(id)}
            />
          ))}
        </View>

        {/* Milestone Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Hitos</Text>
          {groupedAchievements.milestone.map(([id, achievement]) => (
            <AchievementCard
              key={id}
              id={id}
              achievement={achievement}
              unlocked={getAchievementStatus(id)}
            />
          ))}
        </View>

        {/* Premium Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👑 Premium</Text>
          {groupedAchievements.premium.map(([id, achievement]) => (
            <AchievementCard
              key={id}
              id={id}
              achievement={achievement}
              unlocked={getAchievementStatus(id)}
            />
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Cómo Desbloquear</Text>
          <Text style={styles.infoText}>
            • Envía mensajes para desbloquear engagement{"\n"}
            • Los días se cuentan automáticamente{"\n"}
            • Usa todos los moods para desbloquear uno especial{"\n"}
            • Compra regalos y planes premium para más logros
          </Text>
        </View>

        {/* Rewards Summary */}
        <View style={styles.rewardsBox}>
          <Text style={styles.rewardsTitle}>💰 Monedas Ganadas</Text>
          {(() => {
            const totalRewards = achievements.reduce((sum, achId) => {
              const achievement = ACHIEVEMENTS[achId];
              return sum + (achievement?.reward || 0);
            }, 0);
            return (
              <Text style={styles.rewardsValue}>
                +{totalRewards} monedas
              </Text>
            );
          })()}
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
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#16a34a33",
  },
  statLabel: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: "#16a34a",
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBox: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  progressLabel: {
    color: "#3b82f6",
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  progressText: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "right",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22, 163, 74, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#16a34a33",
  },
  locked: {
    opacity: 0.5,
    backgroundColor: "rgba(99, 102, 241, 0.05)",
    borderColor: "#6366f133",
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  lockedText: {
    color: "#888",
  },
  achievementDesc: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 6,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  rewardIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  rewardText: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "bold",
  },
  unlockedBadge: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoTitle: {
    color: "#3b82f6",
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    color: "#bbb",
    fontSize: 12,
    lineHeight: 18,
  },
  rewardsBox: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#fbbf24",
    alignItems: "center",
  },
  rewardsTitle: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: 8,
  },
  rewardsValue: {
    color: "#fbbf24",
    fontSize: 24,
    fontWeight: "bold",
  },
});
