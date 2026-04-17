import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * ConsentScreens
 * Pantallas de consentimiento legal obligatorias:
 * 1. Términos y Condiciones
 * 2. Política de Privacidad
 * 3. Guías de Comunidad
 * 4. Análitica y Tracking (opcional)
 * 5. Marketing (opcional)
 */

const ConsentScreens = ({ onConsentComplete, onCancel }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    community: false,
    analytics: false,
    marketing: false,
  });

  const handleConsent = (key) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const canProceed = () => {
    // Obligatorios: términos, privacidad, comunidad
    return consents.terms && consents.privacy && consents.community;
  };

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Completado
      onConsentComplete(consents);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const screens = [
    {
      title: '⚖️ Términos y Condiciones',
      requiredKey: 'terms',
      content: (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Acuerdo Legal</Text>
          <Text style={styles.text}>
            Al usar esta aplicación, aceptas estar sujeto a nuestros Términos y
            Condiciones completos. Esto incluye:
          </Text>

          <Text style={styles.bulletPoint}>
            • Ser mayor de 18 años
          </Text>
          <Text style={styles.bulletPoint}>
            • Proporcionar información verídica
          </Text>
          <Text style={styles.bulletPoint}>
            • No usar la app para fines ilícitos
          </Text>
          <Text style={styles.bulletPoint}>
            • Respetar derechos de otros usuarios
          </Text>
          <Text style={styles.bulletPoint}>
            • Aceptar renovación automática de planes
          </Text>

          <Text style={[styles.text, styles.disclaimer]}>
            Los regalos virtuales no tienen valor monetario. Puedes ser banido
            por violar estos términos.
          </Text>

          <Text style={styles.linkText}>
            📄 Lee el documento completo en: LEGAL_TERMS.md
          </Text>
        </ScrollView>
      ),
    },
    {
      title: '🔐 Política de Privacidad',
      requiredKey: 'privacy',
      content: (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Tu Privacidad es Sagrada</Text>
          <Text style={styles.text}>
            Protegemos tus datos con encriptación máxima:
          </Text>

          <Text style={styles.bulletPoint}>
            ✓ Encriptación HTTPS/SSL en tránsito
          </Text>
          <Text style={styles.bulletPoint}>
            ✓ AES-256 para datos almacenados
          </Text>
          <Text style={styles.bulletPoint}>
            ✓ No vendemos tus datos
          </Text>
          <Text style={styles.bulletPoint}>
            ✓ Acceso restringido solo a empleados necesarios
          </Text>
          <Text style={styles.bulletPoint}>
            ✓ Derechos GDPR: acceso, corrección, eliminación
          </Text>

          <Text style={styles.sectionTitle}>Lo que recopilamos:</Text>
          <Text style={styles.bulletPoint}>
            • Perfil: Nombre, edad, fotos, bio
          </Text>
          <Text style={styles.bulletPoint}>
            • Mensajes entre usuarios
          </Text>
          <Text style={styles.bulletPoint}>
            • Datos de pago (sin número completo)
          </Text>
          <Text style={styles.bulletPoint}>
            • Datos de comportamiento (swipes, clicks)
          </Text>

          <Text style={[styles.text, styles.disclaimer]}>
            Nunca compartimos mensajes privados con terceros.
            Tus datos se borran en máximo 30 días después de eliminación de
            cuenta.
          </Text>

          <Text style={styles.linkText}>
            📄 Lee el documento completo en: LEGAL_PRIVACY.md
          </Text>
        </ScrollView>
      ),
    },
    {
      title: '👥 Guías de Comunidad',
      requiredKey: 'community',
      content: (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Comunidad Segura y Respetuosa</Text>

          <Text style={styles.sectionSubtitle}>✅ Comportamiento Bienvenido:</Text>
          <Text style={styles.bulletPoint}>
            • Sé auténtico (fotos reales, bio honesta)
          </Text>
          <Text style={styles.bulletPoint}>
            • Respeta a todos sin discriminación
          </Text>
          <Text style={styles.bulletPoint}>
            • Respeta el consentimiento
          </Text>
          <Text style={styles.bulletPoint}>
            • Reporta comportamiento sospechoso
          </Text>

          <Text style={styles.sectionSubtitle}>❌ Comportamiento Prohibido:</Text>
          <Text style={styles.bulletPoint}>
            • Acoso, amenazas o violencia
          </Text>
          <Text style={styles.bulletPoint}>
            • Discriminación o lenguaje de odio
          </Text>
          <Text style={styles.bulletPoint}>
            • Solicitar dinero o estafas
          </Text>
          <Text style={styles.bulletPoint}>
            • Impersonación o fraude
          </Text>
          <Text style={styles.bulletPoint}>
            • Spam o automatización
          </Text>

          <Text style={styles.sectionSubtitle}>⚠️ Consecuencias:</Text>
          <Text style={styles.bulletPoint}>
            • 1ª vez: Advertencia
          </Text>
          <Text style={styles.bulletPoint}>
            • 2ª vez: Bloqueo temporal
          </Text>
          <Text style={styles.bulletPoint}>
            • 3ª vez: Banimiento permanente
          </Text>
          <Text style={styles.bulletPoint}>
            • Ilegalidad: Banimiento + reporte a policía
          </Text>

          <Text style={styles.linkText}>
            📄 Lee el documento completo en: LEGAL_COMMUNITY_GUIDELINES.md
          </Text>
        </ScrollView>
      ),
    },
    {
      title: '📊 Análitica y Mejoras',
      requiredKey: 'analytics',
      required: false,
      content: (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Ayúdanos a Mejorar</Text>
          <Text style={styles.text}>
            Usamos datos anonimizados para entender cómo usas la app:
          </Text>

          <Text style={styles.bulletPoint}>
            • Qué features usas más
          </Text>
          <Text style={styles.bulletPoint}>
            • Dónde ocurren errores técnicos
          </Text>
          <Text style={styles.bulletPoint}>
            • Velocidad de carga
          </Text>

          <Text style={[styles.text, styles.disclaimer]}>
            ✓ Los datos se anonimizar (no vemos tu nombre)
            ✓ No vemos mensajes privados
            ✓ Puedes optar por NO participar
          </Text>

          <Text style={styles.sectionTitle}>¿Qué Rastreamos?</Text>
          <Text style={styles.bulletPoint}>
            • Eventos de la app (clics, vistas de pantalla)
          </Text>
          <Text style={styles.bulletPoint}>
            • Tiempo en app
          </Text>
          <Text style={styles.bulletPoint}>
            • Errores/crashes
          </Text>

          <Text style={[styles.text, styles.info]}>
            💡 Esto es OPCIONAL. Puedes decir "No" y la app funciona igual.
          </Text>
        </ScrollView>
      ),
    },
    {
      title: '💌 Marketing y Notificaciones',
      requiredKey: 'marketing',
      required: false,
      content: (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>
            Notificaciones y Promociones
          </Text>
          <Text style={styles.text}>
            Nos gustaría enviarte:
          </Text>

          <Text style={styles.bulletPoint}>
            • Nuevos matches 🎯
          </Text>
          <Text style={styles.bulletPoint}>
            • Mensajes no leídos 💬
          </Text>
          <Text style={styles.bulletPoint}>
            • Ofertas limitadas ⏰
          </Text>
          <Text style={styles.bulletPoint}>
            • Actualizaciones de seguridad 🔐
          </Text>

          <Text style={[styles.text, styles.disclaimer]}>
            ✓ Máximo 2-3 notificaciones por semana
            ✓ Puedes silenciar en cualquier momento
            ✓ Nunca vendemos tu email
          </Text>

          <Text style={styles.sectionTitle}>Puedes Cambiar Esto Después</Text>
          <Text style={styles.text}>
            Ve a Configuración / Notificaciones para ajustar preferencias en cualquier momento.
          </Text>

          <Text style={[styles.text, styles.info]}>
            💡 Esto es OPCIONAL. Puedes decir "No" sin problemas.
          </Text>
        </ScrollView>
      ),
    },
  ];

  const screen = screens[currentScreen];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{screen.title}</Text>
          <Text style={styles.step}>
            Paso {currentScreen + 1} de {screens.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${((currentScreen + 1) / screens.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* CONTENIDO */}
        <View style={styles.contentContainer}>
          {screen.content}
        </View>

        {/* CONSENTIMIENTO */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleConsent(screen.requiredKey)}
          >
            <View
              style={[
                styles.checkboxBox,
                consents[screen.requiredKey] && styles.checkboxBoxChecked,
              ]}
            >
              {consents[screen.requiredKey] && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              Acepto {screen.title.split(' ')[1]} {!screen.required && '(opcional)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          {currentScreen > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.buttonText}>← Atrás</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              !consents[screen.requiredKey] && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!consents[screen.requiredKey]}
          >
            <Text style={styles.buttonText}>
              {currentScreen === screens.length - 1 ? '¡Empezar!' : 'Siguiente →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SKIP */}
        <TouchableOpacity style={styles.skipButton} onPress={onCancel}>
          <Text style={styles.skipText}>Cancelar</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  step: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#ff6b9d',
  },

  // CONTENIDO
  contentContainer: {
    flex: 1,
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b9d',
    marginTop: 15,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    color: '#b0b0b0',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 13,
    color: '#b0b0b0',
    marginLeft: 10,
    marginBottom: 6,
    lineHeight: 18,
  },
  disclaimer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: 12,
    paddingVertical: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  info: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
    paddingLeft: 12,
    paddingVertical: 8,
    marginTop: 15,
  },
  linkText: {
    fontSize: 12,
    color: '#ff6b9d',
    fontWeight: '600',
    marginTop: 10,
  },

  // CHECKBOX
  checkboxContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ff6b9d',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#ff6b9d',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#fff',
    flex: 1,
  },

  // BOTONES
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ff6b9d',
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipText: {
    color: '#666',
    fontSize: 13,
  },
});

export default ConsentScreens;
