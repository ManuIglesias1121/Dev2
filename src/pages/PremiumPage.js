import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

const plans = [
  {
    id: "mensual",
    title: "Mensual",
    price: "$4.99",
    subtitle: "30 días de premium",
    description: "Prueba la manada por un mes.",
  },
  {
    id: "trimestral",
    title: "Trimestral",
    price: "$12.99",
    subtitle: "Ahorra 10%",
    description: "Conecta más y destacate más tiempo.",
  },
  {
    id: "anual",
    title: "Anual",
    price: "$39.99",
    subtitle: "Mejor valor",
    description: "Máxima visibilidad y beneficios premium.",
  },
];

const premiumBenefits = [
  { id: "visitors", icon: "👁️", title: "Visitantes", desc: "Ve quién visitó tu perfil antes que nadie." },
  { id: "supermatch", icon: "💬", title: "Super Match", desc: "Envía mensajes directos sin esperar match." },
  { id: "boost", icon: "⚡", title: "Boost Tribal", desc: "Aparecé primero en el swipe por un tiempo." },
  { id: "privatePhotos", icon: "📸", title: "Fotos privadas", desc: "Subí fotos exclusivas solo para premium." },
  { id: "filters", icon: "🔎", title: "Filtros avanzados", desc: "Filtrá por theriotype, hábitat, rol y más." },
  { id: "invisible", icon: "🕵️", title: "Modo invisible", desc: "Navegá sin ser visto hasta que elijas salir." },
  { id: "passport", icon: "📍", title: "Passport", desc: "Cambia tu ubicación para buscar en otra manada." },
  { id: "rewind", icon: "🔄", title: "Rewind swipe", desc: "Deshaz el último swipe por error." },
  { id: "badge", icon: "👑", title: "Badge premium", desc: "Tu perfil brilla con un distintivo exclusivo." },
  { id: "events", icon: "🎟️", title: "Eventos exclusivos", desc: "Accedé a encuentros y desafíos especiales." },
];

export default function PremiumPage({ navigation }) {
  const { activatePremium } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(plans[0].id);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUpgrade = () => {
    const plan = plans.find((item) => item.id === selectedPlan);
    if (!plan) return;
    activatePremium(plan.id);
    Alert.alert(
      "¡Bienvenido a la manada premium! 👑",
      `Plan ${plan.title} activado en modo demo.`,
      [{ text: "OK" }]
    );
  };

  return (
    <LinearGradient
      colors={["#000", "#0a0a0a", "#000"]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            padding: 25,
          }}
        >
          {/* TÍTULO */}
          <Text style={styles.title}>TherianMatch Premium</Text>

          <Text style={styles.subtitle}>
            Desbloqueá tu instinto.  
            Conectá más profundo.  
            Destacate en la manada.
          </Text>

          {/* BENEFICIOS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🐺 Beneficios Premium</Text>

            {premiumBenefits.map((benefit) => (
              <View key={benefit.id} style={styles.benefit}>
                <Text style={styles.bullet}>{benefit.icon}</Text>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitText}>{benefit.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* PLANES PREMIUM */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const active = plan.id === selectedPlan;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, active && styles.planCardActive]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planTitle, active && styles.planTitleActive]}>{plan.title}</Text>
                    <Text style={[styles.planPrice, active && styles.planPriceActive]}>{plan.price}</Text>
                  </View>
                  <Text style={[styles.planSubtitle, active && styles.planSubtitleActive]}>{plan.subtitle}</Text>
                  <Text style={[styles.planDesc, active && styles.planDescActive]}>{plan.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* BOTÓN PREMIUM */}
          <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
            <Text style={styles.buttonText}>Pagar {plans.find((item) => item.id === selectedPlan)?.price}</Text>
          </TouchableOpacity>

          {/* CERRAR */}
          {navigation?.canGoBack?.() && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.close}>Volver</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22c55e33",
    marginBottom: 30,
  },
  cardTitle: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bullet: {
    fontSize: 20,
    marginRight: 10,
  },
  benefitText: {
    color: "white",
    fontSize: 16,
    flexShrink: 1,
  },
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  planCardActive: {
    borderColor: "#16a34a",
    backgroundColor: "#122a1a",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planTitle: {
    color: "#ccc",
    fontSize: 18,
    fontWeight: "700",
  },
  planTitleActive: {
    color: "#22c55e",
  },
  planPrice: {
    color: "#ccc",
    fontSize: 18,
    fontWeight: "700",
  },
  planPriceActive: {
    color: "#22c55e",
  },
  planSubtitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 8,
  },
  planSubtitleActive: {
    color: "#a7f3d0",
  },
  planDesc: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
  },
  planDescActive: {
    color: "#d1fae5",
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  benefitText: {
    color: "#aaa",
    fontSize: 14,
    flexShrink: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  close: {
    color: "#888",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
});
