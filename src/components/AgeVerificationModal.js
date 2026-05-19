import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateAge, MIN_AGE } from '../services/legalConsentService';

/**
 * AgeVerificationModal
 * Verifica que el usuario sea mayor de 18 años antes de crear cuenta.
 *
 * Props:
 *  - visible: bool
 *  - onAgeVerified: (birthDateIso: 'YYYY-MM-DD') => void
 *  - onCancel: () => void
 */
const AgeVerificationModal = ({ visible, onAgeVerified, onCancel }) => {
  const [step, setStep] = useState('method'); // method | dateInput | success
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const reset = () => {
    setStep('method');
    setDay('');
    setMonth('');
    setYear('');
  };

  const handleManualDate = () => setStep('dateInput');

  const handleVerify = () => {
    const dNum = parseInt(day, 10);
    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);

    if (!dNum || !mNum || !yNum || day.length === 0 || month.length === 0 || year.length !== 4) {
      Alert.alert('Fecha incompleta', 'Ingresá día, mes y año (4 dígitos).');
      return;
    }
    if (dNum < 1 || dNum > 31 || mNum < 1 || mNum > 12) {
      Alert.alert('Fecha inválida', 'Revisá día y mes.');
      return;
    }
    if (yNum < 1900 || yNum > new Date().getFullYear()) {
      Alert.alert('Año inválido', 'Ingresá un año real.');
      return;
    }

    const iso = `${yNum}-${String(mNum).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    const parsed = new Date(iso);
    if (
      isNaN(parsed.getTime()) ||
      parsed.getUTCFullYear() !== yNum ||
      parsed.getUTCMonth() + 1 !== mNum ||
      parsed.getUTCDate() !== dNum
    ) {
      Alert.alert('Fecha inválida', 'Esa fecha no existe (revisá el día).');
      return;
    }

    const age = calculateAge(iso);
    if (age === null || age < MIN_AGE) {
      Alert.alert(
        'Menor de edad',
        `Tenés que tener al menos ${MIN_AGE} años para usar esta app. Lamentamos que no puedas participar.`,
        [{ text: 'OK', onPress: () => { onCancel?.(); reset(); } }]
      );
      return;
    }

    setStep('success');
    setTimeout(() => {
      onAgeVerified?.(iso);
      reset();
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {step === 'method' && (
            <View style={styles.content}>
              <Text style={styles.title}>🔐 Verificación de edad</Text>
              <Text style={styles.subtitle}>
                Debés confirmar que tenés {MIN_AGE} años o más para entrar a la manada.
              </Text>

              <View style={styles.methodsContainer}>
                <TouchableOpacity style={styles.methodButton} onPress={handleManualDate}>
                  <Text style={styles.methodIcon}>📅</Text>
                  <Text style={styles.methodTitle}>Fecha de nacimiento</Text>
                  <Text style={styles.methodDesc}>Ingresá tu fecha</Text>
                </TouchableOpacity>

                <View style={[styles.methodButton, styles.methodButtonDisabled]}>
                  <Text style={styles.methodIcon}>🪪</Text>
                  <Text style={styles.methodTitle}>Documento de identidad</Text>
                  <Text style={styles.methodDesc}>(Próximamente)</Text>
                </View>

                <View style={[styles.methodButton, styles.methodButtonDisabled]}>
                  <Text style={styles.methodIcon}>📸</Text>
                  <Text style={styles.methodTitle}>Verificación facial</Text>
                  <Text style={styles.methodDesc}>(Próximamente)</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Tu fecha de nacimiento se usa solo para verificar tu edad. Queda registrada de forma privada.
              </Text>
            </View>
          )}

          {step === 'dateInput' && (
            <View style={styles.content}>
              <Text style={styles.title}>📅 Tu fecha de nacimiento</Text>
              <Text style={styles.subtitle}>Formato: DD / MM / AAAA</Text>

              <View style={styles.inputContainer}>
                <View style={styles.dateInputs}>
                  <TextInput
                    ref={dayRef}
                    style={styles.dateField}
                    placeholder="DD"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={day}
                    onChangeText={(t) => {
                      const clean = t.replace(/\D/g, '');
                      setDay(clean);
                      if (clean.length === 2) monthRef.current?.focus();
                    }}
                    returnKeyType="next"
                  />
                  <Text style={styles.separator}>/</Text>
                  <TextInput
                    ref={monthRef}
                    style={styles.dateField}
                    placeholder="MM"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={month}
                    onChangeText={(t) => {
                      const clean = t.replace(/\D/g, '');
                      setMonth(clean);
                      if (clean.length === 2) yearRef.current?.focus();
                    }}
                    returnKeyType="next"
                  />
                  <Text style={styles.separator}>/</Text>
                  <TextInput
                    ref={yearRef}
                    style={[styles.dateField, styles.yearField]}
                    placeholder="AAAA"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={year}
                    onChangeText={(t) => setYear(t.replace(/\D/g, ''))}
                    returnKeyType="done"
                    onSubmitEditing={handleVerify}
                  />
                </View>
              </View>

              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Ejemplos</Text>
                <Text style={styles.exampleText}>✅ 25/06/1995</Text>
                <Text style={styles.exampleText}>❌ 10/12/2010 (menor de {MIN_AGE})</Text>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
                <Text style={styles.buttonText}>Verificar edad</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('method')}>
                <Text style={styles.secondaryButtonText}>Atrás</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.content}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Edad verificada</Text>
              <Text style={styles.successSubtitle}>Continuamos con el registro…</Text>
            </View>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },

  methodsContainer: { width: '100%', marginBottom: 16 },
  methodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff6b9d',
    alignItems: 'center',
  },
  methodButtonDisabled: { opacity: 0.5, borderColor: '#666' },
  methodIcon: { fontSize: 32, marginBottom: 8 },
  methodTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 4 },
  methodDesc: { fontSize: 12, color: '#999' },

  inputContainer: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  dateInputs: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dateField: {
    width: 56,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b9d',
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  yearField: { width: 86 },
  separator: { color: '#fff', fontSize: 22, marginHorizontal: 6 },

  exampleContainer: {
    width: '100%',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginBottom: 22,
  },
  exampleLabel: { color: '#4CAF50', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  exampleText: { color: '#fff', fontSize: 13, marginBottom: 3 },

  primaryButton: {
    width: '100%',
    backgroundColor: '#ff6b9d',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#999',
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButtonText: { color: '#999', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  cancelButton: { width: '100%', paddingVertical: 12, marginBottom: 12 },
  cancelText: { color: '#999', fontSize: 16, fontWeight: '600', textAlign: 'center' },

  successIcon: { fontSize: 60, marginBottom: 15 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', marginBottom: 6 },
  successSubtitle: { fontSize: 14, color: '#b0b0b0' },

  disclaimer: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default AgeVerificationModal;
