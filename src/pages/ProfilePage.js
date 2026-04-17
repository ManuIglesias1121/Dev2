import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfilePage({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 🟩 PROTECCIÓN: evita crash si user es null
  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>
          Inicia sesión para ver tu perfil
        </Text>
      </View>
    );
  }

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
            overflow: "hidden",
          }}
        >
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Text style={{ color: "#666", fontSize: 50 }}>🐾</Text>
          )}
        </View>

        {/* BOTONES EDITAR / CONFIGURACIÓN */}
        <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 15, gap: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#16a34a",
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
            onPress={() => navigation.navigate("ProfileEdit")}
          >
            <Text style={{ color: "white", fontSize: 16 }}>✏️ Editar perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#333",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
            }}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={{ color: "white", fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

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
            {user.display_name ?? user.name ?? "Sin nombre"}
          </Text>

          {/* BIO */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Biografía</Text>
            <Text style={{ color: "white", fontSize: 16 }}>
              {user.biography ?? "—"}
            </Text>
          </View>

          {/* Theriotype */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Theriotype</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.primary_theriotype ?? "—"}
            </Text>
          </View>

          {/* Familia */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Familia</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.species_family ?? "—"}
            </Text>
          </View>

          {/* Habitat */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Hábitat</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.habitat ?? "—"}
            </Text>
          </View>

          {/* Rol */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Rol en la manada</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.pack_role ?? "—"}
            </Text>
          </View>

          {/* Estado Premium */}
          <View
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 8,
              backgroundColor: user.isPremium ? "#14532d" : "#3f3f46",
            }}
          >
            <Text
              style={{
                color: user.isPremium ? "#22c55e" : "#aaa",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {user.isPremium ? "Cuenta Premium" : "Cuenta Gratuita"}
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

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity
          style={{
            backgroundColor: "#b91c1c",
            padding: 14,
            borderRadius: 10,
            marginTop: 30,
            marginHorizontal: 20,
          }}
          onPress={logout}
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
