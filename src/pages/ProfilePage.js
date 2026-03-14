import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfilePage() {
  const { selectedProfile: profile, setScreen } = useContext(AuthContext);

  // Animación suave de entrada (CORREGIDA)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "black" }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#0f0f0f", "#1a1a1a", "#000"]}
          style={{
            paddingTop: 60,
            paddingBottom: 40,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderColor: "#222",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Mi Perfil
          </Text>
        </LinearGradient>

        {/* AVATAR */}
        <View
          style={{
            marginTop: -50,
            alignSelf: "center",
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#222",
            borderWidth: 3,
            borderColor: "#444",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#666", fontSize: 50 }}>🐾</Text>
        </View>

        {/* BOTÓN EDITAR */}
        <TouchableOpacity
          style={{
            alignSelf: "center",
            marginTop: 15,
            backgroundColor: "#333",
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Editar perfil</Text>
        </TouchableOpacity>

        {/* CARD PRINCIPAL */}
        <View
          style={{
            backgroundColor: "#111",
            marginTop: 25,
            marginHorizontal: 20,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#222",
          }}
        >
          {/* Nombre */}
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 5,
            }}
          >
            {profile?.display_name ?? "Sin nombre"}
          </Text>

          {/* Email — NO EXISTE user, así que lo saco */}
          <Text
            style={{
              color: "#888",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            —
          </Text>

          {/* Campos */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Theriotype</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {profile?.primary_theriotype ?? "—"}
            </Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Familia</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {profile?.species_family ?? "—"}
            </Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Biografía</Text>
            <Text style={{ color: "white", fontSize: 16 }}>
              {profile?.biography ?? "—"}
            </Text>
          </View>

          {/* Estado Premium */}
          <View
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 8,
              backgroundColor: profile?.is_premium ? "#14532d" : "#3f3f46",
            }}
          >
            <Text
              style={{
                color: profile?.is_premium ? "#22c55e" : "#aaa",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {profile?.is_premium ? "Cuenta Premium" : "Cuenta Gratuita"}
            </Text>
          </View>
        </View>

        {/* GALERÍA */}
        <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Fotos privadas
          </Text>

          <View
            style={{
              backgroundColor: "#111",
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#222",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#666", fontSize: 16 }}>
              (Aquí irán tus fotos privadas)
            </Text>
          </View>
        </View>

        {/* BOTÓN CERRAR SESIÓN — NO EXISTE signOut, así que lo saco */}
        <TouchableOpacity
          style={{
            backgroundColor: "#b91c1c",
            padding: 14,
            borderRadius: 10,
            marginTop: 30,
            marginHorizontal: 20,
          }}
          onPress={() => setScreen("login")}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}
