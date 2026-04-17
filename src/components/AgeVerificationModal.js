import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * AgeVerificationModal
 * Verifica que el usuario sea mayor de 18 años
 * Métodos: Fecha de nacimiento, Documentación de ID, Verificación facial
 */

const AgeVerificationModal = ({ visible, onAgeVerified, onCancel }) => {
  const [step, setStep] = useState('method'); // method → dateInput → success
  const [birthDate, setBirthDate] = useState(null);
  const [isLegal, setIsLegal] = useState(false);

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDateObj = new Date(dateString);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateInput = () => {
    if (!birthDate) {
      Alert.alert('Error', 'Por favor ingresa tu fecha de nacimiento');
      return;
    }

    const age = calculateAge(birthDate);
    if (age < 18) {
      Alert.alert(
        'Menor de edad',
        'Debes tener 18 años o más para usar esta app. Lamentamos que no puedas participar ahora.',
        [{ text: 'OK', onPress: onCancel }]
      );
      return;
    }

    setIsLegal(true);
    setStep('success');
    setTimeout(() => {
      onAgeVerified();
      reset();
    }, 2000);
  };

  const handleManualDate = () => {
    setStep('dateInput');
  };

  const reset = () => {
    setStep('method');
    setBirthDate(null);
    setIsLegal(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {/* PASO 1: SELECCIONAR MÉTODO */}
          {step === 'method' && (
            <View style={styles.content}>
              <Text style={styles.title}>🔐 Verificación de Edad</Text>
              <Text style={styles.subtitle}>
                Debes confirmar que tienes 18 años o más
              </Text>

              <View style={styles.methodsContainer}>
                {/* Método 1: Fecha de Nacimiento */}
                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={handleManualDate}
                >
                  <Text style={styles.methodIcon}>📅</Text>
                  <Text style={styles.methodTitle}>
                    Fecha de Nacimiento
                  </Text>
                  <Text style={styles.methodDesc}>
                    Ingresa tu fecha directamente
                  </Text>
                </TouchableOpacity>

                {/* Método 2: Documento de Identidad */}
                <TouchableOpacity
                  style={[styles.methodButton, styles.methodButtonDisabled]}
                  disabled
                >
                  <Text style={styles.methodIcon}>🪪</Text>
                  <Text style={styles.methodTitle}>
                    Documentación de ID
                  </Text>
                  <Text style={styles.methodDesc}>
                    (Próximamente disponible)
                  </Text>
                </TouchableOpacity>

                {/* Método 3: Verificación Facial */}
                <TouchableOpacity
                  style={[styles.methodButton, styles.methodButtonDisabled]}
                  disabled
                >
                  <Text style={styles.methodIcon}>📸</Text>
                  <Text style={styles.methodTitle}>
                    Verificación Facial
                  </Text>
                  <Text style={styles.methodDesc}>
                    (Próximamente disponible)
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Tu privacidad está protegida. Los datos de edad se usan solo para verificación.
              </Text>
            </View>
          )}

          {/* PASO 2: INGRESAR FECHA */}
          {step === 'dateInput' && (
            <View style={styles.content}>
              <Text style={styles.title}>📅 Tu Fecha de Nacimiento</Text>
              <Text style={styles.subtitle}>
                Formato: DD/MM/YYYY (ej: 15/03/1995)
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mes y Año:</Text>
                <View style={styles.dateInputs}>
                  <View style={styles.inputField}>
                    <Text style={styles.placeholder}>DD</Text>
                  </View>
                  <Text style={styles.separator}>/</Text>
                  <View style={styles.inputField}>
                    <Text style={styles.placeholder}>MM</Text>
                  </View>
                  <Text style={styles.separator}>/</Text>
                  <View style={styles.inputField}>
                    <Text style={styles.placeholder}>YYYY</Text>
                  </View>
                </View>
              </View>

              {/* Picker simulado: Mostrar ejemplo */}
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Ejemplo válido:</Text>
                <Text style={styles.exampleText}>25/06/1995 ✅ (28 años)</Text>
                <Text style={styles.exampleText}>10/12/2010 ❌ (13 años)</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleDateInput}
              >
                <Text style={styles.buttonText}>Verificar Edad</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep('method')}
              >
                <Text style={styles.secondaryButtonText}>Atrás</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PASO 3: ÉXITO */}
          {step === 'success' && (
            <View style={styles.content}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>
                ¡Verificación Completada!
              </Text>
              <Text style={styles.successSubtitle}>
                Bienvenido a la comunidad therianthrope
              </Text>

              <View style={styles.checklistContainer}>
                <View style={styles.checkItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.checkText}>Edad verificada</Text>
                </View>
                <View style={styles.checkItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.checkText}>Términos aceptados</Text>
                </View>
                <View style={styles.checkItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.checkText}>Privacidad protegida</Text>
                </View>
              </View>

              <Text style={styles.successMessage}>
                Entrando a la app...
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },

  // MÉTODOS
  methodsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  methodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff6b9d',
    alignItems: 'center',
  },
  methodButtonDisabled: {
    opacity: 0.5,
    borderColor: '#666',
  },
  methodIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  methodDesc: {
    fontSize: 12,
    color: '#999',
  },

  // INPUT
  inputContainer: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputField: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b9d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    color: '#fff',
    fontSize: 20,
    marginHorizontal: 5,
  },

  // EJEMPLO
  exampleContainer: {
    width: '100%',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  exampleLabel: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 5,
  },

  // BOTONES
  primaryButton: {
    width: '100%',
    backgroundColor: '#ff6b9d',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#999',
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 20,
  },
  cancelText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // SUCCESS
  successIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 30,
    textAlign: 'center',
  },
  checklistContainer: {
    width: '100%',
    marginBottom: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  checkText: {
    color: '#fff',
    fontSize: 14,
  },
  successMessage: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
  },

  disclaimer: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default AgeVerificationModal;
