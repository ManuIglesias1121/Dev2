import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useContext } from "react";
import { getCurrentLocation, reverseGeocode } from "../services/locationService";
import { uploadAvatar } from "../services/photoService";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";

const THERIOTYPES = [
  "Wolf", "Fox", "Raven", "Crow", "Tiger", "Lynx", "Deer", "Bear",
  "Dragon", "Horse", "Cat", "Dog", "Rabbit", "Hawk", "Owl", "Snake",
  "Lion", "Panther", "Elephant", "Dolphin", "Whale", "Eagle",
];

const SPECIES_FAMILIES = [
  "Canidae", "Felidae", "Corvidae", "Accipitridae", "Ursidae",
  "Cervidae", "Equidae", "Leporidae", "Delphinidae", "Draconidae",
];

const HABITATS = [
  "Bosque", "Montaña", "Pradera", "Desierto", "Océano",
  "Tundra", "Selva Tropical", "Cueva", "Ciudad", "Cielo",
];

const PACK_ROLES = [
  "Alfa", "Beta", "Omega", "Cazador", "Explorador",
  "Guardián", "Sanador", "Solitario", "Sabio", "Guerrero",
];

function SelectorModal({ visible, onClose, title, options, selected, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#111", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "70%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#222" }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#aaa" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { onSelect(item); onClose(); }}
                style={{
                  flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                  padding: 16, borderBottomWidth: 1, borderColor: "#1a1a1a",
                  backgroundColor: selected === item ? "#1a2e1a" : "transparent",
                }}
              >
                <Text style={{ color: selected === item ? "#22c55e" : "white", fontSize: 16 }}>{item}</Text>
                {selected === item && <Ionicons name="checkmark" size={20} color="#22c55e" />}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileEditPage({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);

  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [biography, setBiography] = useState(user?.biography ?? user?.bio ?? "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [city, setCity] = useState(user?.city ?? "");
  const [detectingCity, setDetectingCity] = useState(false);

  const detectCity = async () => {
    setDetectingCity(true);
    try {
      const loc = await getCurrentLocation();
      if (!loc) { Alert.alert("Sin permiso", "Activa la ubicación en ajustes."); return; }
      const geo = await reverseGeocode(loc.latitude, loc.longitude);
      if (geo?.city) setCity(geo.city);
      else Alert.alert("Error", "No pudimos detectar la ciudad.");
    } catch {
      Alert.alert("Error", "No pudimos obtener la ubicación.");
    } finally {
      setDetectingCity(false);
    }
  };
  const [theriotype, setTheriotype] = useState(user?.primary_theriotype ?? "");
  const [speciesFamily, setSpeciesFamily] = useState(user?.species_family ?? "");
  const [habitat, setHabitat] = useState(user?.habitat ?? "");
  const [packRole, setPackRole] = useState(user?.pack_role ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? null);
  const [saving, setSaving] = useState(false);

  const [therioModal, setTherioModal] = useState(false);
  const [familyModal, setFamilyModal] = useState(false);
  const [habitatModal, setHabitatModal] = useState(false);
  const [roleModal, setRoleModal] = useState(false);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }
    const ageNum = parseInt(age);
    if (age && (isNaN(ageNum) || ageNum < 18 || ageNum > 99)) {
      Alert.alert("Error", "La edad debe estar entre 18 y 99 años.");
      return;
    }

    setSaving(true);

    // Subir avatar si es un archivo local nuevo
    let avatarUrl = avatar;
    if (typeof avatar === "string" && avatar.startsWith("file://")) {
      try {
        avatarUrl = await uploadAvatar(user.supabaseId, avatar);
      } catch (e) {
        console.warn("Error subiendo avatar:", e.message);
        avatarUrl = user?.avatar || null; // mantener el anterior si falla
      }
    }

    const updatedData = {
      display_name: displayName.trim(),
      biography: biography.trim(),
      bio: biography.trim(),
      age: ageNum || user?.age,
      city: city.trim(),
      primary_theriotype: theriotype,
      species_family: speciesFamily,
      habitat,
      pack_role: packRole,
      avatar: avatarUrl,
      avatar_url: avatarUrl,
    };

    try {
      const { supabase } = require("../services/supabase");
      await supabase
        .from("profiles")
        .update({
          display_name: updatedData.display_name,
          biography: updatedData.biography,
          age: updatedData.age,
          city: updatedData.city,
          primary_theriotype: updatedData.primary_theriotype,
          species_family: updatedData.species_family,
          habitat: updatedData.habitat,
          pack_role: updatedData.pack_role,
          avatar_url: avatarUrl,
        })
        .eq("id", user?.supabaseId);
    } catch (e) {
      console.warn("Error guardando en Supabase:", e.message);
    }

    updateUser(updatedData);

    setSaving(false);
    Alert.alert("¡Guardado!", "Tu perfil fue actualizado.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a" }} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* HEADER */}
        <LinearGradient colors={["#111", "#0a0a0a"]} style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>Editar Perfil</Text>
          </View>
        </LinearGradient>

        {/* AVATAR */}
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 30 }}>
          <TouchableOpacity onPress={pickAvatar} style={{ position: "relative" }}>
            <View style={{
              width: 110, height: 110, borderRadius: 55,
              borderWidth: 3, borderColor: "#22c55e",
              overflow: "hidden", backgroundColor: "#1a1a1a",
              justifyContent: "center", alignItems: "center",
            }}>
              {avatar
                ? <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} />
                : <Text style={{ fontSize: 48 }}>📷</Text>
              }
            </View>
            <View style={{
              position: "absolute", bottom: 0, right: 0,
              backgroundColor: "#22c55e", borderRadius: 16,
              width: 32, height: 32, justifyContent: "center", alignItems: "center",
              borderWidth: 2, borderColor: "#0a0a0a",
            }}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: "#666", marginTop: 8, fontSize: 13 }}>Toca para cambiar foto</Text>
        </View>

        {/* CAMPOS */}
        <View style={{ paddingHorizontal: 20, gap: 16 }}>

          <Field label="Nombre visible">
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              style={inputStyle}
              placeholderTextColor="#555"
              placeholder="Tu nombre en la manada"
              maxLength={30}
            />
          </Field>

          <Field label="Biografía">
            <TextInput
              value={biography}
              onChangeText={setBiography}
              style={[inputStyle, { height: 90, textAlignVertical: "top", paddingTop: 12 }]}
              placeholderTextColor="#555"
              placeholder="Cuéntale a la manada quién eres..."
              multiline
              maxLength={200}
            />
            <Text style={{ color: "#444", fontSize: 12, textAlign: "right", marginTop: 4 }}>
              {biography.length}/200
            </Text>
          </Field>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Edad">
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  style={inputStyle}
                  placeholderTextColor="#555"
                  placeholder="18"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </Field>
            </View>
            <View style={{ flex: 2 }}>
              <Field label="Ciudad">
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    style={[inputStyle, { flex: 1 }]}
                    placeholderTextColor="#555"
                    placeholder="Tu ciudad"
                    maxLength={50}
                  />
                  <TouchableOpacity
                    onPress={detectCity}
                    disabled={detectingCity}
                    style={{ backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 10 }}
                  >
                    <Ionicons name={detectingCity ? "sync" : "location-outline"} size={20} color="#22c55e" />
                  </TouchableOpacity>
                </View>
              </Field>
            </View>
          </View>

          <Field label="Theriotype principal">
            <TouchableOpacity style={selectorStyle} onPress={() => setTherioModal(true)}>
              <Text style={{ color: theriotype ? "white" : "#555", fontSize: 16 }}>{theriotype || "Seleccionar..."}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          </Field>

          <Field label="Familia de especie">
            <TouchableOpacity style={selectorStyle} onPress={() => setFamilyModal(true)}>
              <Text style={{ color: speciesFamily ? "white" : "#555", fontSize: 16 }}>{speciesFamily || "Seleccionar..."}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          </Field>

          <Field label="Hábitat">
            <TouchableOpacity style={selectorStyle} onPress={() => setHabitatModal(true)}>
              <Text style={{ color: habitat ? "white" : "#555", fontSize: 16 }}>{habitat || "Seleccionar..."}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          </Field>

          <Field label="Rol en la manada">
            <TouchableOpacity style={selectorStyle} onPress={() => setRoleModal(true)}>
              <Text style={{ color: packRole ? "white" : "#555", fontSize: 16 }}>{packRole || "Seleccionar..."}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          </Field>

          {/* GUARDAR */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? "#1a3a1a" : "#16a34a",
              padding: 16, borderRadius: 14, marginTop: 10,
              flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10,
            }}
          >
            {saving
              ? <Text style={{ color: "#22c55e", fontSize: 18 }}>Guardando...</Text>
              : <>
                  <Ionicons name="checkmark-circle" size={22} color="white" />
                  <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Guardar cambios</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SelectorModal visible={therioModal} onClose={() => setTherioModal(false)} title="Theriotype" options={THERIOTYPES} selected={theriotype} onSelect={setTheriotype} />
      <SelectorModal visible={familyModal} onClose={() => setFamilyModal(false)} title="Familia de especie" options={SPECIES_FAMILIES} selected={speciesFamily} onSelect={setSpeciesFamily} />
      <SelectorModal visible={habitatModal} onClose={() => setHabitatModal(false)} title="Hábitat" options={HABITATS} selected={habitat} onSelect={setHabitat} />
      <SelectorModal visible={roleModal} onClose={() => setRoleModal(false)} title="Rol en la manada" options={PACK_ROLES} selected={packRole} onSelect={setPackRole} />
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }) {
  return (
    <View>
      <Text style={{ color: "#888", fontSize: 13, marginBottom: 6, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#111",
  borderWidth: 1,
  borderColor: "#2a2a2a",
  borderRadius: 12,
  color: "white",
  fontSize: 16,
  paddingHorizontal: 16,
  paddingVertical: 12,
};

const selectorStyle = {
  backgroundColor: "#111",
  borderWidth: 1,
  borderColor: "#2a2a2a",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 13,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};
