import React, { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

const REPORT_REASONS = [
  { id: "fake", label: "Perfil falso o spam", icon: "alert-circle-outline" },
  { id: "harassment", label: "Acoso o intimidación", icon: "warning-outline" },
  { id: "inappropriate", label: "Contenido inapropiado", icon: "eye-off-outline" },
  { id: "underage", label: "Posible menor de edad", icon: "person-remove-outline" },
  { id: "scam", label: "Intento de estafa", icon: "card-outline" },
  { id: "other", label: "Otro motivo", icon: "ellipsis-horizontal-outline" },
];

export default function ReportBlockModal({ visible, onClose, profile }) {
  const { blockUser } = useAuth();
  const [step, setStep] = useState("menu"); // menu | report | done
  const [selectedReason, setSelectedReason] = useState(null);
  const [details, setDetails] = useState("");

  const handleClose = () => {
    setStep("menu");
    setSelectedReason(null);
    setDetails("");
    onClose();
  };

  const handleBlock = () => {
    Alert.alert(
      `¿Bloquear a ${profile?.display_name}?`,
      "No podrán verte ni contactarte. Puedes desbloquearlo desde Configuración.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Bloquear",
          style: "destructive",
          onPress: () => {
            blockUser?.(profile?.id);
            Alert.alert("Usuario bloqueado", `${profile?.display_name} fue bloqueado.`);
            handleClose();
          },
        },
      ]
    );
  };

  const handleSubmitReport = () => {
    if (!selectedReason) {
      Alert.alert("Selecciona un motivo", "Por favor elige el motivo del reporte.");
      return;
    }
    setStep("done");
    setTimeout(() => handleClose(), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
        <View style={{
          backgroundColor: "#0f0f0f",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          borderTopWidth: 1,
          borderColor: "#1e1e1e",
        }}>
          {/* Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />

          {step === "done" ? (
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#14532d", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                <Ionicons name="checkmark" size={32} color="#22c55e" />
              </View>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Reporte enviado</Text>
              <Text style={{ color: "#666", marginTop: 8, textAlign: "center" }}>
                Revisaremos tu reporte. Gracias por hacer la comunidad más segura.
              </Text>
            </View>
          ) : step === "report" ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setStep("menu")} style={{ marginRight: 12 }}>
                  <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
                  Reportar a {profile?.display_name}
                </Text>
              </View>
              {REPORT_REASONS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelectedReason(r.id)}
                  style={{
                    flexDirection: "row", alignItems: "center", padding: 14,
                    marginBottom: 8, borderRadius: 12,
                    backgroundColor: selectedReason === r.id ? "#1a2e1a" : "#1a1a1a",
                    borderWidth: 1,
                    borderColor: selectedReason === r.id ? "#22c55e" : "#2a2a2a",
                  }}
                >
                  <Ionicons name={r.icon} size={20} color={selectedReason === r.id ? "#22c55e" : "#888"} style={{ marginRight: 12 }} />
                  <Text style={{ color: selectedReason === r.id ? "#22c55e" : "white", flex: 1 }}>{r.label}</Text>
                  {selectedReason === r.id && <Ionicons name="checkmark-circle" size={18} color="#22c55e" />}
                </TouchableOpacity>
              ))}
              {selectedReason === "other" && (
                <TextInput
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Describe el problema..."
                  placeholderTextColor="#555"
                  style={{
                    backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#2a2a2a",
                    borderRadius: 12, color: "white", padding: 14, marginBottom: 12,
                    height: 80, textAlignVertical: "top",
                  }}
                  multiline
                  maxLength={300}
                />
              )}
              <TouchableOpacity
                onPress={handleSubmitReport}
                style={{ backgroundColor: "#b91c1c", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 8 }}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Enviar reporte</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
                {profile?.display_name}
              </Text>
              <Text style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
                ¿Qué quieres hacer?
              </Text>

              <TouchableOpacity
                onPress={() => setStep("report")}
                style={{ flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#1a1a1a", borderRadius: 14, marginBottom: 10 }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#7f1d1d22", justifyContent: "center", alignItems: "center", marginRight: 14 }}>
                  <Ionicons name="flag-outline" size={22} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "white", fontSize: 16 }}>Reportar usuario</Text>
                  <Text style={{ color: "#666", fontSize: 13 }}>Perfil falso, acoso o contenido inapropiado</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#444" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBlock}
                style={{ flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#1a1a1a", borderRadius: 14, marginBottom: 10 }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center", marginRight: 14 }}>
                  <Ionicons name="ban-outline" size={22} color="#818cf8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "white", fontSize: 16 }}>Bloquear usuario</Text>
                  <Text style={{ color: "#666", fontSize: 13 }}>No podrá contactarte ni verte</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#444" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose} style={{ padding: 14, alignItems: "center" }}>
                <Text style={{ color: "#666" }}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
