import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

/**
 * LocalizationPage
 * Mapa de usuarios cercanos sectorizado por ciudades
 * Permite filtrar y descubrir usuarios por ubicación
 */

const CITIES = [
  { id: 1, name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, users: 156, color: '#ff6b9d' },
  { id: 2, name: 'CABA Centro', lat: -34.6009, lng: -58.3734, users: 89, color: '#a78bfa' },
  { id: 3, name: 'La Plata', lat: -34.9205, lng: -57.9545, users: 34, color: '#60a5fa' },
  { id: 4, name: 'Morón', lat: -34.6491, lng: -58.6267, users: 52, color: '#4ade80' },
  { id: 5, name: 'San Isidro', lat: -34.4771, lng: -58.5257, users: 67, color: '#fbbf24' },
  { id: 6, name: 'Quilmes', lat: -34.7276, lng: -58.2547, users: 43, color: '#f87171' },
  { id: 7, name: 'Tigre', lat: -34.4297, lng: -58.5814, users: 28, color: '#fb923c' },
  { id: 8, name: 'Pilar', lat: -34.4596, lng: -58.8144, users: 19, color: '#ec4899' },
];

const MOCK_NEARBY_USERS = [
  {
    id: 1,
    name: 'Sofia',
    age: 24,
    city: 'Buenos Aires',
    distance: 2.3,
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
    theriotype: '🦊',
    online: true,
  },
  {
    id: 2,
    name: 'Valentina',
    age: 22,
    city: 'CABA Centro',
    distance: 3.1,
    photo: 'https://randomuser.me/api/portraits/women/2.jpg',
    theriotype: '🐺',
    online: true,
  },
  {
    id: 3,
    name: 'Lucia',
    age: 25,
    city: 'San Isidro',
    distance: 8.5,
    photo: 'https://randomuser.me/api/portraits/women/3.jpg',
    theriotype: '🦁',
    online: false,
  },
  {
    id: 4,
    name: 'Martina',
    age: 23,
    city: 'La Plata',
    distance: 54.2,
    photo: 'https://randomuser.me/api/portraits/women/4.jpg',
    theriotype: '🐆',
    online: true,
  },
  {
    id: 5,
    name: 'Camila',
    age: 26,
    city: 'Morón',
    distance: 15.7,
    photo: 'https://randomuser.me/api/portraits/women/5.jpg',
    theriotype: '🦅',
    online: false,
  },
];

export default function LocalizationPage() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [selectedCity, setSelectedCity] = useState(null);
  const [filterDistance, setFilterDistance] = useState(null);
  const [isTraveling, setIsTraveling] = useState(false);

  // Cuando están viajando, filtrar solo usuarios entre 20-30 km
  const getTravelingUsers = () => {
    return MOCK_NEARBY_USERS.filter(u => u.distance >= 20 && u.distance <= 30);
  };

  const filteredUsers = isTraveling
    ? getTravelingUsers()
    : selectedCity
    ? MOCK_NEARBY_USERS.filter(u => u.city === selectedCity.name)
    : MOCK_NEARBY_USERS;

  const sortedUsers = filteredUsers.sort((a, b) => a.distance - b.distance);

  const renderCityCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.cityCard,
        selectedCity?.id === item.id && styles.cityCardSelected,
        { borderColor: item.color },
      ]}
      onPress={() => {
        setIsTraveling(false); // Desactivar modo viajero al seleccionar ciudad
        setSelectedCity(selectedCity?.id === item.id ? null : item);
      }}
    >
      <LinearGradient
        colors={[item.color + '20', item.color + '10']}
        style={styles.cityGradient}
      >
        <Text style={styles.cityEmoji}>📍</Text>
        <Text style={styles.cityName}>{item.name}</Text>
        <Text style={[styles.cityUsers, { color: item.color }]}>{item.users} usuarios</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('DiscoveryPage')}
    >
      <Image
        source={{ uri: item.photo }}
        style={styles.userPhoto}
      />

      {item.online && <View style={styles.onlineBadge} />}

      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.userInfo}
      >
        <View style={styles.userHeader}>
          <Text style={styles.userName}>
            {item.name}, {item.age}
          </Text>
          <Text style={styles.userTheriotype}>{item.theriotype}</Text>
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userCity}>{item.city}</Text>
          <Text style={styles.userDistance}>
            📍 {item.distance} km
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>🗺️ Localización</Text>
          <Text style={styles.subtitle}>
            Descubre usuarios cercanos en tu ciudad
          </Text>
        </View>

        {/* CURRENT LOCATION */}
        <View style={styles.currentLocation}>
          <Text style={styles.currentLabel}>Tu ubicación</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationText}>
              <Text style={styles.locationCity}>
                {user?.city || 'Buenos Aires'}
              </Text>
              <Text style={styles.locationSubtext}>
                {user?.country || 'Argentina'}
              </Text>
            </View>
            <Text style={styles.usersHere}>
              {CITIES.find(c => c.name === (user?.city || 'Buenos Aires'))?.users || 156}
            </Text>
          </View>
        </View>

        {/* TRAVELING MODE */}
        <TouchableOpacity
          style={[styles.travelingToggle, isTraveling && styles.travelingToggleActive]}
          onPress={() => {
            setIsTraveling(!isTraveling);
            if (!isTraveling) {
              setSelectedCity(null);
              setFilterDistance(null);
            }
          }}
        >
          <LinearGradient
            colors={isTraveling ? ['#ff6b9d', '#ec4899'] : ['rgba(255,107,157,0.1)', 'rgba(236,72,153,0.1)']}
            style={styles.travelingGradient}
          >
            <Text style={styles.travelingIcon}>{isTraveling ? '✈️' : '🏠'}</Text>
            <View style={styles.travelingText}>
              <Text style={styles.travelingLabel}>
                {isTraveling ? 'Modo Viajero Activo' : 'Estoy viajando'}
              </Text>
              <Text style={styles.travelingSubtext}>
                {isTraveling ? 'Rango: 20-30 km' : 'Expande tu rango a 20-30 km'}
              </Text>
            </View>
            <Text style={styles.travelingToggleIcon}>{isTraveling ? '✓' : '→'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* DISTANCIA SLIDER */}
        {!isTraveling && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Rango de distancia</Text>
            <View style={styles.distanceOptions}>
              {[5, 15, 50, 100].map(dist => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.distanceButton,
                    filterDistance === dist && styles.distanceButtonActive,
                  ]}
                  onPress={() => setFilterDistance(filterDistance === dist ? null : dist)}
                >
                  <Text
                    style={[
                      styles.distanceText,
                      filterDistance === dist && styles.distanceTextActive,
                    ]}
                  >
                    {dist}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isTraveling && (
          <View style={styles.travelingRangeInfo}>
            <Text style={styles.travelingRangeIcon}>🎯</Text>
            <View style={styles.travelingRangeText}>
              <Text style={styles.travelingRangeTitle}>Rango de viajero activo</Text>
              <Text style={styles.travelingRangeDesc}>
                Viendo usuarios entre 20-30 km de distancia
              </Text>
            </View>
          </View>
        )}

        {/* CIUDADES */}
        {!isTraveling && (
          <View style={styles.citiesSection}>
            <Text style={styles.sectionTitle}>Ciudades Cercanas</Text>
            <FlatList
              data={CITIES}
              renderItem={renderCityCard}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.citiesGrid}
            />
          </View>
        )}

        {/* USUARIOS CERCANOS */}
        <View style={styles.nearbySection}>
          <View style={styles.nearbyHeader}>
            <Text style={styles.sectionTitle}>
              👥 Usuarios Cercanos
              {isTraveling && ' (Viajeros)'}
              {selectedCity && ` en ${selectedCity.name}`}
            </Text>
            <Text style={styles.nearbyCount}>{sortedUsers.length}</Text>
          </View>

          {sortedUsers.length > 0 ? (
            <FlatList
              data={sortedUsers}
              renderItem={renderUserCard}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.usersGrid}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                No hay usuarios en esta área
              </Text>
              <Text style={styles.emptySubtext}>
                Intenta expandir tu rango de distancia
              </Text>
            </View>
          )}
        </View>

        {/* STATS */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🌍</Text>
            <Text style={styles.statLabel}>Alcance</Text>
            <Text style={styles.statValue}>
              {filterDistance ? `${filterDistance}km` : 'Todos'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statLabel}>Totales</Text>
            <Text style={styles.statValue}>
              {CITIES.reduce((sum, c) => sum + c.users, 0)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🟢</Text>
            <Text style={styles.statLabel}>En línea</Text>
            <Text style={styles.statValue}>
              {sortedUsers.filter(u => u.online).length}
            </Text>
          </View>
        </View>

        {/* TIPS */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Tips para Viajeros</Text>
          <Text style={styles.tipItem}>
            ✓ Actualiza tu ubicación cuando viajes
          </Text>
          <Text style={styles.tipItem}>
            ✓ Filtra por distancia para encontrar cercanos
          </Text>
          <Text style={styles.tipItem}>
            ✓ Los usuarios offline hace 7+ días aparecen grises
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b9d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },

  // CURRENT LOCATION
  currentLocation: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  currentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b9d',
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationText: {
    flex: 1,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  locationSubtext: {
    fontSize: 12,
    color: '#999',
  },
  usersHere: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b9d',
  },

  // FILTERS
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  distanceButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
  },
  distanceButtonActive: {
    backgroundColor: '#ff6b9d',
    borderColor: '#ff6b9d',
  },
  distanceText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  distanceTextActive: {
    color: '#fff',
  },

  // TRAVELING RANGE INFO
  travelingRangeInfo: {
    marginHorizontal: 20,
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b9d',
    gap: 12,
  },
  travelingRangeIcon: {
    fontSize: 24,
  },
  travelingRangeText: {
    flex: 1,
  },
  travelingRangeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff6b9d',
    marginBottom: 2,
  },
  travelingRangeDesc: {
    fontSize: 12,
    color: '#aaa',
  },

  // CITIES
  citiesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  citiesGrid: {
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cityCard: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cityCardSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  cityGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cityEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  cityUsers: {
    fontSize: 11,
    marginTop: 4,
  },

  // NEARBY USERS
  nearbySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nearbyCount: {
    backgroundColor: '#ff6b9d',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  usersGrid: {
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userCard: {
    flex: 1,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  userPhoto: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  onlineBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 3,
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  userTheriotype: {
    fontSize: 16,
  },
  userDetails: {
    gap: 4,
  },
  userCity: {
    fontSize: 11,
    color: '#aaa',
  },
  userDistance: {
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: '600',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
  },

  // STATS
  statsSection: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6b9d33',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b9d',
  },

  // TIPS
  tipsBox: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#60a5fa',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 6,
    lineHeight: 16,
  },

  // TRAVELING MODE
  travelingToggle: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,107,157,0.3)',
  },
  travelingToggleActive: {
    borderColor: '#ff6b9d',
  },
  travelingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  travelingIcon: {
    fontSize: 28,
  },
  travelingText: {
    flex: 1,
  },
  travelingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  travelingSubtext: {
    fontSize: 11,
    color: '#aaa',
  },
  travelingToggleIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
