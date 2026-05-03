import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { fakeProfiles } from '../data/fakeProfiles';

function resolveSource(img) {
  if (!img) return require('../../assets/logo1.png');
  return typeof img === 'string' ? { uri: img } : img;
}

export default function LocalizationPage() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isTraveling, setIsTraveling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, age, city, primary_theriotype, avatar_url, is_premium')
        .not('city', 'is', null)
        .neq('id', user?.supabaseId || '')
        .limit(100);

      if (!error && data && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.display_name || 'Therian',
          age: p.age || 25,
          city: p.city,
          theriotype: p.primary_theriotype || 'Wolf',
          photo: p.avatar_url || null,
          isPremium: p.is_premium || false,
          online: Math.random() > 0.5,
        }));
        setUsers(mapped);
      } else {
        // Fallback con perfiles falsos que tienen ciudad
        const fake = fakeProfiles.filter((p) => p.city).map((p) => ({
          id: p.id,
          name: p.display_name,
          age: p.age,
          city: p.city,
          theriotype: p.primary_theriotype,
          photo: p.avatar,
          isPremium: false,
          online: Math.random() > 0.5,
        }));
        setUsers(fake);
      }
    } catch {
      const fake = fakeProfiles.filter((p) => p.city).map((p) => ({
        id: p.id,
        name: p.display_name,
        age: p.age,
        city: p.city,
        theriotype: p.primary_theriotype,
        photo: p.avatar,
        isPremium: false,
        online: false,
      }));
      setUsers(fake);
    }
    setLoading(false);
  }

  // Agrupar ciudades únicas con conteo
  const cities = Object.values(
    users.reduce((acc, u) => {
      if (!u.city) return acc;
      if (!acc[u.city]) acc[u.city] = { name: u.city, count: 0 };
      acc[u.city].count++;
      return acc;
    }, {})
  );

  const filteredUsers = isTraveling
    ? users.filter((u) => u.city !== (user?.city || ''))
    : selectedCity
    ? users.filter((u) => u.city === selectedCity)
    : users;

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() =>
        navigation.navigate('ProfileDetail', {
          profile: {
            id: item.id,
            display_name: item.name,
            name: item.name,
            age: item.age,
            city: item.city,
            avatar: item.photo,
            photos: item.photo ? [item.photo] : [],
            primary_theriotype: item.theriotype,
            isPremium: item.isPremium,
          },
        })
      }
    >
      <Image source={resolveSource(item.photo)} style={styles.userPhoto} resizeMode="cover" />
      {item.online && <View style={styles.onlineBadge} />}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.userInfo}
      >
        <Text style={styles.userName}>{item.name}, {item.age}</Text>
        <Text style={styles.userCity}>📍 {item.city}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>🗺️ Localización</Text>
          <Text style={styles.subtitle}>Usuarios cercanos a tu ciudad</Text>
        </View>

        {/* TU UBICACIÓN */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={22} color="#ff6b9d" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.locationCity}>{user?.city || 'Sin ciudad configurada'}</Text>
            <Text style={styles.locationSub}>
              {user?.city ? 'Tu ubicación actual' : 'Configúrala en tu perfil'}
            </Text>
          </View>
          {!user?.city && (
            <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
              <Text style={{ color: '#ff6b9d', fontSize: 13 }}>Configurar →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MODO VIAJERO */}
        <TouchableOpacity
          style={[styles.travelBtn, isTraveling && styles.travelBtnActive]}
          onPress={() => { setIsTraveling(!isTraveling); setSelectedCity(null); }}
        >
          <Text style={{ fontSize: 22 }}>{isTraveling ? '✈️' : '🏠'}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.travelLabel}>
              {isTraveling ? 'Modo Viajero activo' : 'Estoy viajando'}
            </Text>
            <Text style={styles.travelSub}>
              {isTraveling ? 'Viendo usuarios de otras ciudades' : 'Ver usuarios en otras ciudades'}
            </Text>
          </View>
          <Ionicons name={isTraveling ? 'checkmark-circle' : 'chevron-forward'} size={20} color="#ff6b9d" />
        </TouchableOpacity>

        {/* CIUDADES */}
        {!isTraveling && cities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ciudades</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              <TouchableOpacity
                onPress={() => setSelectedCity(null)}
                style={[styles.cityChip, !selectedCity && styles.cityChipActive]}
              >
                <Text style={[styles.cityChipText, !selectedCity && styles.cityChipTextActive]}>
                  Todas ({users.length})
                </Text>
              </TouchableOpacity>
              {cities.map((c) => (
                <TouchableOpacity
                  key={c.name}
                  onPress={() => setSelectedCity(selectedCity === c.name ? null : c.name)}
                  style={[styles.cityChip, selectedCity === c.name && styles.cityChipActive]}
                >
                  <Text style={[styles.cityChipText, selectedCity === c.name && styles.cityChipTextActive]}>
                    {c.name} ({c.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* USUARIOS */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>
              {isTraveling ? '✈️ Otras ciudades' : selectedCity ? `👥 ${selectedCity}` : '👥 Todos'}
            </Text>
            <Text style={styles.countBadge}>{filteredUsers.length}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#ff6b9d" style={{ marginTop: 40 }} />
          ) : filteredUsers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={styles.emptyText}>Sin usuarios en esta área</Text>
              <Text style={styles.emptySub}>Prueba sin filtros o en otra ciudad</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 20, paddingTop: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ff6b9d', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#999' },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,157,0.12)',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b9d',
    marginBottom: 14,
  },
  locationCity: { color: 'white', fontSize: 16, fontWeight: '600' },
  locationSub: { color: '#999', fontSize: 12, marginTop: 2 },
  travelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,157,0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.25)',
    marginBottom: 24,
  },
  travelBtnActive: {
    backgroundColor: 'rgba(255,107,157,0.2)',
    borderColor: '#ff6b9d',
  },
  travelLabel: { color: 'white', fontSize: 14, fontWeight: '600' },
  travelSub: { color: '#999', fontSize: 12, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { color: 'white', fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  cityChipActive: { backgroundColor: '#ff6b9d', borderColor: '#ff6b9d' },
  cityChipText: { color: '#aaa', fontSize: 13 },
  cityChipTextActive: { color: 'white', fontWeight: 'bold' },
  countBadge: {
    backgroundColor: '#ff6b9d',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  userCard: {
    flex: 1,
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  userPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  onlineBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#1a1a2e',
    zIndex: 10,
  },
  userInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  userName: { color: 'white', fontSize: 14, fontWeight: '700' },
  userCity: { color: '#ddd', fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyText: { color: 'white', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#999', fontSize: 13 },
});
