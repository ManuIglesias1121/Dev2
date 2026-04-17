import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import ClawFrame from '../assets/icons/claw.png';

export default function ClawButton({ icon, color, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={ClawFrame} style={styles.claw} />

      <View style={styles.iconWrapper}>
        <Feather name={icon} size={32} color={color} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claw: {
    width: 80,
    height: 80,
    position: 'absolute',
    tintColor: '#ffffff', // podés cambiarlo por cualquier color tribal
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
