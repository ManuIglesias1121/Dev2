import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { getOfferings, purchasePackage, restorePurchases, mapEntitlementToPlan } from "../services/paymentsService";

const PLAN_DETAILS = {
  free: {
    name: "Iniciante",
    icon: "🐾",
    price: "Gratis",
    color: "#6b7280",
    frameColor: "#gray",
    benefits: [
      "5 swipes/día en descubrimiento",
      "Chat ilimitado",
      "10 mensajes/día",
      "Sin efectos especiales",
      "Sin fotos privadas",
    ],
    badge: null,
  },
  mensual: {
    name: "Cazador",
    icon: "🐺",
    price: "$4.99/mes",
    color: "#22c55e",
    frameColor: "#22c55e",
    benefits: [
      "✓ 50 swipes/día",
      "✓ Super match (llamadas)",
      "✓ 100 mensajes/día",
      "✓ Enviar fotos",
      "✓ Efectos de chat",
      "✓ Gifs animados",
    ],
    badge: "Más Popular 🔥",
  },
  trimestral: {
    name: "Depredador",
    icon: "🐯",
    price: "$11.99/trimestre",
    color: "#3b82f6",
    frameColor: "#3b82f6",
    benefits: [
      "✓ Swipes ilimitados",
      "✓ Super match premium",
      "✓ 500 mensajes/día",
      "✓ Fotos privadas",
      "✓ Mensajes de voz",
      "✓ Temas personalizados",
      "✓ Pin mensajes favoritos",
    ],
    badge: "Mejor Valor 💎",
  },
  anual: {
    name: "Alfa de la Manada",
    icon: "👑",
    price: "$39.99/año",
    color: "#a78bfa",
    frameColor: "#a78bfa",
    benefits: [
      "✓ Todo lo anterior +",
      "✓ Swipes totalmente ilimitados",
      "✓ Chat ilimitado (99999 msgs)",
      "✓ Nombre de color personalizado",
      "✓ Badge premium visible",
      "✓ Acceso a eventos exclusivos",
      "✓ Soporte prioritario",
    ],
    badge: "Máximo Lujo 👑",
  },
};

export default function PremiumPlansPage({ navigation }) {
  const { user, activatePremium } = useAuth();
  const currentPlan = user?.premiumPlan || "free";
  const [offerings, setOfferings] = useState(null);
  const [purchasing, setPurchasing] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getOfferings().then(setOfferings).catch(() => {});
  }, []);

  const handlePurchase = async (planKey, rcPackage) => {
    if (rcPackage) {
      setPurchasing(planKey);
      const result = await purchasePackage(rcPackage);
      setPurchasing(null);
      if (result.success) {
        const plan = mapEntitlementToPlan(result.customerInfo);
        activatePremium(plan);
        Alert.alert("¡Bienvenido a premium! 👑", `Plan ${plan} activado con éxito.`);
      } else if (!result.cancelled) {
        Alert.alert("Error", result.error ?? "No se pudo completar la compra.");
      }
    } else {
      activatePremium(planKey);
      Alert.alert("¡Plan activado! 🐾", `Plan ${planKey} habilitado. (Modo demo)`);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const info = await restorePurchases();
    setRestoring(false);
    if (info) {
      const plan = mapEntitlementToPlan(info);
      if (plan !== "free") {
        activatePremium(plan);
        Alert.alert("Compras restauradas ✓", `Plan ${plan} reactivado.`);
      } else {
        Alert.alert("Sin compras anteriores", "No encontramos suscripciones activas.");
      }
    } else {
      Alert.alert("Sin compras anteriores", "No encontramos suscripciones activas.");
    }
  };

  const PlanCard = ({ planKey, plan }) => {
    const isCurrentPlan = currentPlan === planKey;
    const rcPackage = offerings?.current?.availablePackages?.find((p) =>
      p.identifier.toLowerCase().includes(planKey)
    );

    return (
      <TouchableOpacity
        disabled={isCurrentPlan || purchasing !== null}
        onPress={() => !isCurrentPlan && handlePurchase(planKey, rcPackage)}
        style={[styles.planCard, isCurrentPlan && styles.currentPlan]}
      >
        <LinearGradient
          colors={[plan.color + "33", plan.color + "11"]}
          style={styles.planGradient}
        >
          {plan.badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{plan.badge}</Text>
            </View>
          )}

          <Text style={styles.planIcon}>{plan.icon}</Text>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={[styles.planPrice, { color: plan.color }]}>
            {plan.price}
          </Text>

          <View
            style={[
              styles.divider,
              { backgroundColor: plan.color + "44" },
            ]}
          />

          <View style={styles.benefitsList}>
            {plan.benefits.map((benefit, idx) => (
              <Text key={idx} style={styles.benefitItem}>
                {benefit}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            disabled={isCurrentPlan || purchasing !== null}
            onPress={() => !isCurrentPlan && handlePurchase(planKey, rcPackage)}
            style={[styles.planBtn, { backgroundColor: isCurrentPlan ? plan.color + "44" : plan.color }]}
          >
            {purchasing === planKey
              ? <ActivityIndicator color="white" />
              : <Text style={styles.planBtnText}>{isCurrentPlan ? "✓ Plan Actual" : "Actualizar"}</Text>
            }
          </TouchableOpacity>

          {/* Frame Color Preview */}
          <View style={styles.framePreview}>
            <View
              style={[
                styles.frameSample,
                { borderColor: plan.color, borderWidth: 3 },
              ]}
            >
              <Text style={styles.frameSampleText}>Tu nombre</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {navigation && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: "absolute", left: 0, top: 0, padding: 8 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>👑 Planes Premium</Text>
          <Text style={styles.subtitle}>Desbloquea features exclusivas</Text>
        </View>

        {/* Comparison Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿Por qué actualizar?</Text>
          <Text style={styles.infoText}>
            • Swipes ilimitados para descubrir{"\n"}
            • Más mensajes por día{"\n"}
            • Acceso a regalos premium{"\n"}
            • Efectos especiales en chat{"\n"}
            • Fotos privadas y más
          </Text>
        </View>

        {/* Plans */}
        {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
          <PlanCard key={key} planKey={key} plan={plan} />
        ))}

        {/* RESTAURAR COMPRAS */}
        <TouchableOpacity onPress={handleRestore} disabled={restoring} style={{ alignItems: "center", marginBottom: 16 }}>
          {restoring
            ? <ActivityIndicator color="#888" />
            : <Text style={{ color: "#888", fontSize: 14 }}>Restaurar compras anteriores</Text>
          }
        </TouchableOpacity>

        {/* FAQ */}
        <View style={styles.faqBox}>
          <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>¿Puedo cancelar en cualquier momento?</Text>
            <Text style={styles.faqA}>
              Sí, cancela tu suscripción cuando quieras.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>¿El anual es más barato?</Text>
            <Text style={styles.faqA}>
              Sí, ahorras ~40% comparado con mensual.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>¿Se renuevan automáticamente?</Text>
            <Text style={styles.faqA}>
              Sí, a menos que desactives auto-renovación.
            </Text>
          </View>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
  },
  infoBox: {
    marginHorizontal: 16,
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
    color: "#aaa",
    fontSize: 12,
    lineHeight: 18,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  currentPlan: {
    borderColor: "#22c55e",
    borderWidth: 2,
  },
  planGradient: {
    padding: 20,
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(251, 191, 36, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
  planIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 16,
  },
  benefitsList: {
    width: "100%",
    marginBottom: 16,
  },
  benefitItem: {
    color: "#ddd",
    fontSize: 13,
    marginBottom: 6,
    paddingLeft: 8,
  },
  planBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  planBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  framePreview: {
    width: "100%",
    alignItems: "center",
  },
  frameSample: {
    width: 120,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  frameSampleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  faqBox: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 12,
  },
  faqTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 12,
  },
  faqQ: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 4,
  },
  faqA: {
    color: "#aaa",
    fontSize: 12,
    lineHeight: 16,
  },
});
