import { Feather } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// IMPORT CORREGIDO
import { HABITATS, PACK_ROLES, SPECIES_FAMILIES } from '../supabase';

export default function SwipeCard({ profile, onSwipeLeft, onSwipeRight, onSuperLike }) {
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-120, 0],
    outputRange: [1, 0],
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,

    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },

    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 150) {
        Animated.timing(position, {
          toValue: { x: 500, y: gesture.dy },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipeRight();
          position.setValue({ x: 0, y: 0 });
        });
      } else if (gesture.dx < -150) {
        Animated.timing(position, {
          toValue: { x: -500, y: gesture.dy },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipeLeft();
          position.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const getSpeciesIcon = (familyId) => {
    const species = SPECIES_FAMILIES.find(s => s.id === familyId);
    return species?.icon || '🐾';
  };

  const getHabitatIcon = (habitatId) => {
    const habitat = HABITATS.find(h => h.id === habitatId);
    return habitat?.icon || '🌍';
  };

  const getPackRole = (roleId) => {
    const role = PACK_ROLES.find(r => r.id === roleId);
    return role?.name || '';
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          transform: [...position.getTranslateTransform(), { rotate }],
        },
      ]}
    >
      {/* LIKE Overlay */}
      <Animated.View style={[styles.likeBox, { opacity: likeOpacity }]}>
        <Text style={styles.likeText}>LIKE</Text>
      </Animated.View>

      {/* NOPE Overlay */}
      <Animated.View style={[styles.nopeBox, { opacity: nopeOpacity }]}>
        <Text style={styles.nopeText}>NOPE</Text>
      </Animated.View>

      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              profile.photos?.[0] ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
          }}
          style={styles.image}
        />

        <View style={styles.speciesTag}>
          <Text style={styles.speciesIcon}>{getSpeciesIcon(profile.species_family)}</Text>
          <Text style={styles.speciesText}>{profile.primary_theriotype}</Text>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.display_name}</Text>

          {profile.pack_role && (
            <Text style={styles.roleTag}>{getPackRole(profile.pack_role)}</Text>
          )}
        </View>

        <Text style={styles.bio} numberOfLines={3}>
          {profile.biography}
        </Text>

        <View style={styles.habitatTag}>
          <Text style={styles.habitatIcon}>{getHabitatIcon(profile.habitat)}</Text>
          <Text style={styles.habitatText}>
            {HABITATS.find(h => h.id === profile.habitat)?.name}
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity onPress={onSwipeLeft} style={styles.nopeButton}>
            <Feather name="x" size={28} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSuperLike} style={styles.superButton}>
            <Feather name="star" size={28} color="#f97316" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwipeRight} style={styles.likeButton}>
            <Feather name="heart" size={28} color="#22c55e" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  likeBox: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 10,
  },
  likeText: {
    color: '#22c55e',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nopeBox: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: '#ef4444',
    borderRadius: 10,
  },
  nopeText: {
    color: '#ef4444',
    fontSize: 32,
    fontWeight: 'bold',
  },
  imageContainer: { flex: 3 },
  image: { width: '100%', height: '100%' },
  speciesTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#000a',
    padding: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  speciesIcon: { fontSize: 20, marginRight: 6 },
  speciesText: { color: 'white', fontSize: 16 },
  info: { flex: 2, padding: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { color: 'white', fontSize: 28, fontWeight: 'bold', flex: 1 },
  roleTag: {
    backgroundColor: '#22c55e33',
    color: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 14,
  },
  bio: { color: '#ccc', marginVertical: 10 },
  habitatTag: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  habitatIcon: { fontSize: 20, marginRight: 6 },
  habitatText: { color: 'white', fontSize: 16 },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  nopeButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  superButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#f97316',
  },
  likeButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
});
