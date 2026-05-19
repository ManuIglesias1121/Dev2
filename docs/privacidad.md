---
layout: default
title: Política de privacidad
permalink: /privacidad.html
---

# POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS

**Última actualización: Mayo 19, 2026**

---

## 1. INTRODUCCIÓN

Tu privacidad es nuestra prioridad. Esta Política explica qué datos recopilamos, cómo los protegemos y tus derechos sobre ellos.

**Responsable del Tratamiento de Datos:**
- **Nombre/Razón social**: TherianMatchConnect, operada por **Juan Manuel Iglesias** (Monotributo)
- **CUIT/CUIL**: **20-26670296-6**
- **Domicilio legal**: **Av. de la Virreina 794, San Carlos de Bariloche (CP 8400), Provincia de Río Negro, República Argentina**
- **Email de contacto**: soportetherianmatch@gmail.com
- **Teléfono / WhatsApp**: **+54 9 2944 41-2637**

Esta Política se rige por la **Ley 25.326 de Protección de los Datos Personales de la República Argentina** y su Decreto Reglamentario 1558/2001. Para usuarios de otros países, también aplicamos los estándares equivalentes de su legislación local (GDPR en la UE, LGPD en Brasil, CCPA en California).

**La base de datos de usuarios de TherianMatchConnect se inscribirá ante la Agencia de Acceso a la Información Pública (AAIP) bajo el N° de registro: [N° de inscripción AAIP — pendiente].**

---

## 2. DATOS QUE RECOPILAMOS

### 2.1 Datos de Registro
- Nombre o apodo
- Email
- Contraseña (almacenada en formato hash, nunca en texto plano)
- **Fecha de nacimiento** (verificación obligatoria de mayoría de edad)

### 2.2 Datos de Perfil
- **Fotos públicas** (hasta 6 free / 12 premium) — visibles para todos los usuarios
- **Fotos exclusivas** (hasta 12, solo usuarios Premium) — ver sección 2.7
- Biografía
- Tipo therianthrope *(dato sensible — ver sección 2.6)*
- Moods e intereses
- Ubicación aproximada (ciudad — opcional)

### 2.3 Datos de Comportamiento
- Mensajes de chat (contenido y timestamp)
- Perfiles vistos, swipes, likes y matches
- Encuentros (eventos) creados y asistencia
- Visitantes de tu perfil
- Reportes y bloqueos realizados

### 2.4 Datos de Dispositivo
- Tipo de dispositivo y sistema operativo
- Versión de la App
- Idioma del dispositivo
- Dirección IP (registrada por Supabase para protección contra abuso, retención limitada)

### 2.5 Datos de Pago

Los pagos se procesan **exclusivamente a través de Apple App Store o Google Play Store**, según el dispositivo desde donde compres.

- **No recibimos ni almacenamos datos de tarjetas de crédito o débito.**
- Apple y Google nos envían únicamente confirmación de compra, identificador de transacción y plan adquirido.
- La política de privacidad de Apple/Google rige el tratamiento de tus datos de pago.

### 2.6 Datos Sensibles (Art. 2, Ley 25.326)

Bajo la Ley 25.326, se consideran **datos sensibles** aquellos que revelan origen étnico, opiniones políticas, convicciones religiosas, datos de salud, vida sexual e identidad de género. En nuestra App, los siguientes datos tienen esta categoría:

- **Identidad de género** (si la incluís en tu perfil)
- **Tipo therianthrope** (puede revelar aspectos íntimos de identidad personal)
- **Orientación sexual** (si la incluís en tu perfil)
- **Datos biométricos** locales (huella/face ID — ver sección 2.8)

Estos datos se tratan con protección reforzada. Al completar tu perfil con esta información **otorgás consentimiento explícito** para su tratamiento dentro del ecosistema cerrado de la App. Podés eliminarlos en cualquier momento desde tu perfil.

### 2.7 Fotos Exclusivas (Premium)

Las fotos exclusivas son contenido íntimo o privado que solo querés compartir con un grupo limitado de usuarios Premium.

**Almacenamiento**
- Bucket **privado** en Supabase Storage (no accesible públicamente)
- Segregación por user ID: solo tu UUID puede escribir en tu carpeta
- Row Level Security (RLS) a nivel de base de datos

**Acceso**
- Solo usuarios con suscripción Premium activa pueden generar URLs firmadas
- Las URLs firmadas expiran automáticamente en **1 hora**
- Los usuarios no premium no acceden técnicamente al archivo

**Protección anti-captura**
- **Android**: capturas bloqueadas vía `FLAG_SECURE` al visualizar fotos exclusivas
- **iOS**: el sistema no permite bloquear capturas, pero detectamos intentos y queda registrado (ver Términos, sección 5.5)

**Uso restringido**
- NO se utilizan para entrenamiento de algoritmos
- NO se incluyen en analytics
- Eliminación permanente dentro de **24 horas** desde tu solicitud

### 2.8 Datos Biométricos para Autenticación Local

La App permite usar huella digital o reconocimiento facial para iniciar sesión más rápido:
- **Permanecen en tu dispositivo** (Keychain en iOS / Keystore en Android)
- **Nunca se transmiten** a nuestros servidores
- **Nunca son visibles** para nosotros
- Podés desactivarlos desde Configuración → Seguridad

### 2.9 Registro de Eventos de Seguridad

Para proteger a otros usuarios, registramos en la tabla `security_violations` y `user_reports` los siguientes eventos:
- Intentos de captura de pantalla detectados sobre fotos exclusivas ajenas
- Reportes recibidos contra tu cuenta
- Bloqueos entre usuarios
- Strikes acumulados por el filtro de contenido pre-envío

Estos registros se conservan por **2 años** y son auditables solo por nuestro equipo de moderación bajo procedimientos documentados.

### 2.10 Registro de Consentimientos

Toda aceptación de Términos, Privacidad y Guías de Comunidad se registra en la tabla `consent_log` con:
- Fecha y hora exacta
- Versión del documento aceptado
- Versión de la app y plataforma (iOS/Android)
- Contexto (signup, reaceptación tras cambio de versión)

Este registro es **inmutable** (no se puede modificar ni borrar) y constituye prueba del consentimiento prestado, conforme al Art. 7 del GDPR y Art. 5 de la Ley 25.326.

---

## 3. CÓMO USAMOS TUS DATOS

### 3.1 Servicios Esenciales
- Crear y gestionar tu cuenta
- Procesar pagos (vía Apple/Google)
- Enviar y recibir mensajes
- Mostrar perfiles compatibles
- Sistema de matches, super matches y encuentros
- Soporte técnico

### 3.2 Mejora de la App
- Detectar y prevenir fraudes
- Identificar errores técnicos
- Mejorar la experiencia general

### 3.3 Comunicación
- Notificaciones sobre nuevos mensajes, matches y visitantes
- Actualizaciones de seguridad
- Cambios en Términos o Privacidad

### 3.4 Marketing (SOLO CON CONSENTIMIENTO EXPLÍCITO)
- Promociones de planes
- Novedades de la App
- Encuestas opcionales de satisfacción

**Podés retirar tu consentimiento de marketing en cualquier momento desde Configuración → Notificaciones.**

---

## 4. DATOS COMPARTIDOS CON TERCEROS

Compartimos datos únicamente cuando es estrictamente necesario para operar la App:

| Proveedor | Datos compartidos | Propósito | Protección |
|-----------|------------------|-----------|------------|
| **Apple App Store / Google Play** | Email de la cuenta de la tienda, historial de compras de la app | Procesar pagos y suscripciones | Cumplimiento PCI DSS, política de privacidad propia |
| **Supabase** (infraestructura en AWS, regiones US-East / EU) | Perfil, mensajes, fotos, eventos | Base de datos PostgreSQL, autenticación, storage de archivos, realtime | Row Level Security (RLS), encriptación AES-256 en reposo, TLS 1.3 en tránsito, SOC 2 Type II, GDPR-compliant |
| **OpenStreetMap / Nominatim** | Coordenadas geográficas anonimizadas | Geocodificación inversa (mostrar nombre de ciudad) | No persistente del lado nuestro, política open data |
| **Autoridades legales** | Lo requerido por orden judicial válida | Cumplimiento legal | Solo bajo orden judicial fundada |

**NO usamos:**
- ❌ Servicios de analytics de terceros (sin Firebase Analytics, sin Google Analytics, sin Facebook SDK)
- ❌ Brokers de datos ni redes de publicidad
- ❌ Trackers cross-app
- ❌ Procesadores de pago externos (Stripe, MercadoPago, etc.) — TODO va por las tiendas

### NO compartimos:
- ❌ Mensajes privados con terceros
- ❌ Fotos a redes sociales sin tu acción explícita
- ❌ Datos a anunciantes
- ❌ Información a otras apps o servicios

El acuerdo DPA con Supabase está disponible públicamente en [supabase.com/legal/dpa](https://supabase.com/legal/dpa).

---

## 5. TRANSFERENCIA INTERNACIONAL DE DATOS

Supabase opera infraestructura en Estados Unidos y la Unión Europea. Esto implica una transferencia internacional de tus datos.

De acuerdo con el **Art. 12 de la Ley 25.326**, la transferencia de datos a países sin nivel adecuado de protección está prohibida salvo excepciones. Por eso:

- Supabase opera bajo el régimen **GDPR (UE) y Standard Contractual Clauses (SCCs)** para transferencias desde la UE, niveles equivalentes para Argentina
- Todos los datos viajan **encriptados** (TLS 1.3 en tránsito, AES-256 en reposo)
- El DPA de Supabase incluye cláusulas de protección equivalente a las exigidas por la Ley 25.326

Si preferís que tus datos no se transfieran fuera de Argentina, podés solicitar la eliminación de tu cuenta en cualquier momento.

---

## 6. CIFRADO Y SEGURIDAD

### 6.1 Medidas Técnicas

**En tránsito:**
- HTTPS/TLS 1.3 obligatorio en toda comunicación con Supabase
- Perfect Forward Secrecy (PFS)

**En reposo:**
- AES-256 en los servidores de Supabase
- Contraseñas hasheadas con bcrypt (Supabase Auth)
- Tokens JWT de sesión firmados y con expiración

**En dispositivo:**
- Keychain (iOS) / Keystore (Android) para tokens de sesión
- Credenciales biométricas opcionales nunca salen del dispositivo

**Control de acceso a fotos:**
- Fotos públicas (bucket `avatars`, `chat-images`): URLs cacheables
- Fotos exclusivas (bucket `exclusive-photos`): bucket privado, acceso únicamente vía URLs firmadas con expiración de 1 hora
- Row Level Security (RLS) a nivel de Postgres: cada usuario solo escribe/borra archivos en su propia carpeta
- Intentos de captura quedan registrados (sección 2.9)

### 6.2 Medidas Administrativas

- Acceso restringido al panel de Supabase: solo personal autorizado con 2FA obligatorio
- Auditorías periódicas de logs de acceso
- Monitoreo de accesos inusuales

### 6.3 Respuesta a Incidentes de Seguridad

Si detectamos una brecha de seguridad que afecte tus datos:
1. Contención inmediata (máximo 2 horas)
2. Investigación interna del alcance
3. Notificación a los usuarios afectados en un **máximo de 72 horas**
4. Reporte a la **AAIP** conforme al Art. 11 de la Resolución 47/2018

---

## 7. RETENCIÓN DE DATOS

| Tipo de dato | Período de retención | Qué pasa al vencer |
|---|---|---|
| Perfil activo | Mientras usás la App | Se anonimiza a los 30 días del cierre |
| Fotos públicas | Hasta eliminación o cierre | Se eliminan en 30 días desde cierre de cuenta |
| **Fotos exclusivas (Premium)** | Hasta eliminación | **Se eliminan en 24 horas** desde solicitud |
| Mensajes de chat | Indefinido mientras la conversación esté activa | Se eliminan al cerrar cuenta o eliminar conversación |
| Likes / matches | Mientras ambas cuentas existan | Se borran si cualquiera cierra cuenta |
| Encuentros y asistencia | 90 días post-evento | Se eliminan automáticamente |
| Datos de pago (info de tienda) | 7 años | Requerimiento impositivo (AFIP) |
| Registro de violaciones de seguridad | 2 años | Para moderación y eventual denuncia judicial |
| Registro de consentimientos | 5 años post-cierre | Prueba legal del consentimiento prestado |
| Fecha de nacimiento | 5 años post-cierre | Prueba de verificación de mayoría de edad |

Los datos se borran permanentemente o se anonimizan al vencer el plazo, salvo obligaciones legales que requieran conservación más larga.

---

## 8. TUS DERECHOS (Ley 25.326, Arts. 14–16 y GDPR Arts. 15–22)

Tenés derecho a:

### 8.1 Acceso (Art. 14 / GDPR Art. 15)
Ver todos los datos que tenemos sobre vos.
- Solicitá: **soportetherianmatch@gmail.com**
- Plazo de respuesta: **30 días corridos**
- Sin costo

### 8.2 Rectificación (Art. 16 / GDPR Art. 16)
Actualizar datos incorrectos o desactualizados.
- Directamente desde tu perfil en la App
- O contactando: soportetherianmatch@gmail.com

### 8.3 Supresión / Derecho al Olvido (Art. 16 / GDPR Art. 17)
Solicitar la eliminación de tus datos.
- Desde la App: **Configuración → Eliminar cuenta**
- Procesamos en máximo **30 días**
- Excepto datos legalmente requeridos (impuestos, seguridad, registro de consentimientos)
- No recuperable una vez ejecutado

### 8.4 Portabilidad (GDPR Art. 20)
Descargar una copia de tus datos en formato JSON.
- Solicitá desde: Configuración → Exportar mis datos (próximamente)
- Mientras tanto, por email: soportetherianmatch@gmail.com
- Plazo: 30 días

### 8.5 Oposición y revocación de consentimiento
- Retirar consentimiento de analytics o marketing en cualquier momento desde Configuración
- Retirar consentimientos opcionales no afecta el funcionamiento esencial de la App
- Retirar los consentimientos obligatorios (Términos, Privacidad, Guías) implica el cierre de la cuenta

### 8.6 Cómo ejercer tus derechos
Enviá un email a **soportetherianmatch@gmail.com** con:
- Asunto claro: [Tipo de solicitud] + tu email de cuenta
- Descripción de lo que solicitás

Respondemos dentro de los **30 días corridos**. Si la respuesta no te satisface, podés recurrir a la **AAIP**.

---

## 9. EDAD Y MENORES

9.1 Esta App es **solo para mayores de 18 años**.

9.2 Verificamos la edad mediante validación de fecha de nacimiento en el registro, registrada en la tabla `profiles` con timestamp y método de verificación. Existe además un check constraint a nivel de base de datos que impide guardar fechas de nacimiento que correspondan a menores de 18 años.

9.3 Si detectamos que un usuario es menor de edad:
- Eliminamos la cuenta de inmediato
- No retenemos los datos personales más allá de lo necesario para prevenir re-registro
- Reportamos a las autoridades si corresponde bajo la **Ley 26.904 (Grooming)**

---

## 10. COOKIES Y TECNOLOGÍAS DE SEGUIMIENTO

La App **no usa cookies de tracking publicitario**. Utiliza tecnologías equivalentes solo para funcionalidad:

| Tecnología | Propósito | Duración |
|---|---|---|
| Token JWT de sesión (Supabase Auth) | Mantener tu sesión activa | Configurable, máx 60 días con refresh |
| AsyncStorage local | Recordar preferencias (idioma, sonidos, badge counters) | Hasta que reinstales la app o las borres |
| Credenciales biométricas locales | Login rápido con huella/face | Hasta que las desactives |

Podés borrar estos datos desde: **Configuración → Cerrar sesión** (borra tokens) o desinstalando la App (borra AsyncStorage).

---

## 11. CAMBIOS A ESTA POLÍTICA

11.1 Actualizaremos esta Política según sea necesario (cambios regulatorios, nuevas funcionalidades, mejoras de seguridad).

11.2 Los cambios materiales requieren:
- Notificación previa por email y/o notificación in-app con **14 días de anticipación**
- Posibilidad de rechazar eliminando tu cuenta
- Re-aceptación expresa al ingresar después del cambio (el sistema detecta versión vigente vs aceptada)
- El uso continuado tras aceptar implica conformidad

---

## 12. CONTACTO Y RECLAMOS

**Oficial de Protección de Datos / Responsable de tratamiento:**
- Responsable: Juan Manuel Iglesias (Monotributo, CUIT 20-26670296-6)
- Email: **soportetherianmatch@gmail.com**
- Teléfono / WhatsApp: **+54 9 2944 41-2637**
- Domicilio: Av. de la Virreina 794, San Carlos de Bariloche (CP 8400), Provincia de Río Negro, Argentina

**Plazo de respuesta:** 30 días corridos desde la recepción de tu solicitud.

**Si no quedás satisfecho con nuestra respuesta**, podés presentar una denuncia ante la autoridad de control:

**Agencia de Acceso a la Información Pública (AAIP)**
- Web: [argentina.gob.ar/aaip](https://www.argentina.gob.ar/aaip)
- Email: datospersonales@aaip.gob.ar
- Av. Pte. Gral. Julio A. Roca 710, Piso 2 — CABA, Argentina

---

## RESUMEN PARA USUARIOS

✅ **Protegemos** tus datos con encriptación AES-256 y RLS a nivel de base de datos
❌ **No vendemos** datos, no usamos analytics de terceros, no compartimos con anunciantes
🔐 **Vos tenés el control**: descargá, corregí o eliminá tus datos cuando quieras
💳 **Sin riesgo de pago**: nunca vemos tu tarjeta, todo pasa por Apple/Google
📋 **Transparencia total**: registro inmutable de qué aceptaste y cuándo
🇦🇷 **Ley aplicable**: Ley 25.326 de Protección de Datos Personales (Argentina) + GDPR para usuarios europeos

**¿Dudas? Escribinos a soportetherianmatch@gmail.com**
