import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useContext } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import { saveData, STORAGE_KEYS } from "../services/storageService";

function Section({ title, children }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: "#666", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingHorizontal: 20 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: "#111", borderRadius: 14, marginHorizontal: 16, overflow: "hidden", borderWidth: 1, borderColor: "#1e1e1e" }}>
        {children}
      </View>
    </View>
  );
}

function Row({ icon, iconColor = "#22c55e", label, sublabel, onPress, rightElement, last = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: "row", alignItems: "center", padding: 16,
        borderBottomWidth: last ? 0 : 1, borderColor: "#1e1e1e",
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${iconColor}22`, justifyContent: "center", alignItems: "center", marginRight: 14 }}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "white", fontSize: 16 }}>{label}</Text>
        {sublabel && <Text style={{ color: "#666", fontSize: 13, marginTop: 2 }}>{sublabel}</Text>}
      </View>
      {rightElement ?? (onPress && <Ionicons name="chevron-forward" size={18} color="#444" />)}
    </TouchableOpacity>
  );
}

export default function SettingsPage({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);

  const [notifMatches, setNotifMatches] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifVisitors, setNotifVisitors] = useState(true);
  const [notifSuperMatch, setNotifSuperMatch] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [darkMode] = useState(true);
  const [discoveryVisible, setDiscoveryVisible] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      "¿Eliminar cuenta?",
      "Esta acción es permanente. Perderás todos tus matches, mensajes y monedas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            Alert.alert("Cuenta eliminada", "Tu cuenta ha sido eliminada.");
            logout();
          },
        },
      ]
    );
  };

  const handleClearBotData = () => {
    Alert.alert(
      "Limpiar datos de prueba",
      "Se eliminarán todos los chats y matches de bots. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            await saveData(STORAGE_KEYS.CHAT_CONTACTS, []);
            await saveData(STORAGE_KEYS.CHATS, []);
            await saveData(STORAGE_KEYS.MATCHES, []);
            await saveData(STORAGE_KEYS.CHAT_CONTACTS + "_supermatches", []);
            Alert.alert("¡Listo!", "Chats y matches de bots eliminados.");
          },
        },
      ]
    );
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Pausar cuenta",
      "Tu perfil no será visible para otros usuarios mientras esté pausado.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Pausar",
          onPress: () => {
            setDiscoveryVisible(false);
            Alert.alert("Cuenta pausada", "Tu perfil está oculto temporalmente.");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a" }} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* HEADER */}
      <LinearGradient colors={["#111", "#0a0a0a"]} style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>Configuración</Text>
        </View>
      </LinearGradient>

      {/* CUENTA */}
      <Section title="Cuenta">
        <Row icon="person-outline" label="Editar perfil" onPress={() => navigation.navigate("ProfileEdit")} />
        <Row icon="shield-checkmark-outline" label="Verificación de cuenta" sublabel="Sin verificar" onPress={() => Alert.alert("Próximamente", "La verificación de cuenta estará disponible pronto.")} />
        <Row icon="key-outline" label="Cambiar contraseña" onPress={() => Alert.alert("Próximamente", "Por ahora no hay contraseña configurada.")} last />
      </Section>

      {/* NOTIFICACIONES */}
      <Section title="Notificaciones">
        <Row icon="heart-outline" iconColor="#e11d48" label="Nuevos matches" rightElement={<Switch value={notifMatches} onValueChange={setNotifMatches} trackColor={{ true: "#16a34a" }} thumbColor={notifMatches ? "#22c55e" : "#555"} />} />
        <Row icon="chatbubble-outline" iconColor="#3b82f6" label="Mensajes" rightElement={<Switch value={notifMessages} onValueChange={setNotifMessages} trackColor={{ true: "#16a34a" }} thumbColor={notifMessages ? "#22c55e" : "#555"} />} />
        <Row icon="eye-outline" iconColor="#a78bfa" label="Visitantes de perfil" rightElement={<Switch value={notifVisitors} onValueChange={setNotifVisitors} trackColor={{ true: "#16a34a" }} thumbColor={notifVisitors ? "#22c55e" : "#555"} />} />
        <Row icon="star-outline" iconColor="#f59e0b" label="Super Matches" rightElement={<Switch value={notifSuperMatch} onValueChange={setNotifSuperMatch} trackColor={{ true: "#16a34a" }} thumbColor={notifSuperMatch ? "#22c55e" : "#555"} />} last />
      </Section>

      {/* PRIVACIDAD */}
      <Section title="Privacidad">
        <Row icon="calendar-outline" label="Mostrar edad" rightElement={<Switch value={showAge} onValueChange={setShowAge} trackColor={{ true: "#16a34a" }} thumbColor={showAge ? "#22c55e" : "#555"} />} />
        <Row icon="location-outline" label="Mostrar ciudad" rightElement={<Switch value={showCity} onValueChange={setShowCity} trackColor={{ true: "#16a34a" }} thumbColor={showCity ? "#22c55e" : "#555"} />} />
        <Row icon="radio-button-on-outline" iconColor="#22c55e" label="Mostrar estado en línea" rightElement={<Switch value={showOnline} onValueChange={setShowOnline} trackColor={{ true: "#16a34a" }} thumbColor={showOnline ? "#22c55e" : "#555"} />} />
        <Row icon="search-outline" label="Aparecer en descubrimiento" rightElement={<Switch value={discoveryVisible} onValueChange={setDiscoveryVisible} trackColor={{ true: "#16a34a" }} thumbColor={discoveryVisible ? "#22c55e" : "#555"} />} last />
      </Section>

      {/* SEGURIDAD */}
      <Section title="Seguridad">
        <Row
          icon="shield-checkmark-outline"
          iconColor="#ef4444"
          label="Centro de Seguridad"
          sublabel="Recursos de crisis, tips de cita segura y más"
          onPress={() => navigation.navigate("SafetyCenter")}
        />
        <Row
          icon="location-outline"
          iconColor="#16a34a"
          label="Modo Cita Segura"
          sublabel="Compartir ubicación con un contacto de confianza"
          onPress={() => navigation.navigate("SafeDateMode")}
          last
        />
      </Section>

      {/* PLAN */}
      <Section title="Suscripción">
        <Row
          icon="diamond-outline"
          iconColor="#a78bfa"
          label={user?.isPremium ? `Plan ${user.premiumPlan}` : "Plan gratuito"}
          sublabel={user?.isPremium ? "Gestionar suscripción" : "Mejorar a premium"}
          onPress={() => navigation.navigate("PremiumPlans")}
        />
        <Row icon="gift-outline" iconColor="#f59e0b" label="Tienda de regalos" onPress={() => navigation.navigate("GiftShop")} last />
      </Section>

      {/* LEGAL */}
      <Section title="Legal">
        <Row icon="document-text-outline" iconColor="#888" label="Términos de servicio" onPress={() => Alert.alert("Términos", "Consulta los términos en la app.")} />
        <Row icon="lock-closed-outline" iconColor="#888" label="Política de privacidad" onPress={() => Alert.alert("Privacidad", "Consulta la política de privacidad en la app.")} />
        <Row icon="people-outline" iconColor="#888" label="Guía de la comunidad" onPress={() => Alert.alert("Comunidad", "Consulta las guías de comunidad.")} last />
      </Section>

      {/* SOPORTE */}
      <Section title="Soporte">
        <Row icon="help-circle-outline" iconColor="#3b82f6" label="Centro de ayuda" onPress={() => Alert.alert("Ayuda", "Centro de ayuda próximamente.")} />
        <Row icon="bug-outline" iconColor="#f59e0b" label="Reportar un problema" onPress={() => Alert.alert("Reporte", "Gracias. Revisaremos tu reporte.")} last />
      </Section>

      {/* DATOS */}
      <Section title="Datos">
        <Row
          icon="trash-outline"
          iconColor="#f59e0b"
          label="Limpiar chats y matches de bots"
          sublabel="Elimina todos los datos de prueba"
          onPress={handleClearBotData}
          last
        />
      </Section>

      {/* ACCIONES DE CUENTA */}
      <View style={{ paddingHorizontal: 16, gap: 10, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={handleDeactivate}
          style={{ backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "#3b3b6e", padding: 14, borderRadius: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#818cf8", fontSize: 16, fontWeight: "600" }}>Pausar mi cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={logout}
          style={{ backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#333", padding: 14, borderRadius: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#aaa", fontSize: 16 }}>Cerrar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{ padding: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#ef4444", fontSize: 14 }}>Eliminar cuenta permanentemente</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: "#333", textAlign: "center", fontSize: 12, marginBottom: 20 }}>
        TherianMatch v1.0.0 • Hecho con ❤️
      </Text>
    </ScrollView>
  );
}
