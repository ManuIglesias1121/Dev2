# POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS

**Última actualización: Mayo 3, 2026**

---

## 1. INTRODUCCIÓN

Tu privacidad es nuestra prioridad. Esta Política explica qué datos recopilamos, cómo los protegemos y tus derechos sobre ellos.

**Responsable del Tratamiento de Datos:**
- **Nombre/Razón social**: TherianMatchConnect / [Nombre legal del desarrollador]
- **CUIT**: [CUIT del responsable]
- **Domicilio legal**: [Dirección completa, Ciudad, Provincia, Argentina]
- **Email de contacto**: soportetherianmatch@gmail.com
- **Teléfono**: [Teléfono de contacto]

Esta Política se rige por la **Ley 25.326 de Protección de los Datos Personales de la República Argentina** y su Decreto Reglamentario 1558/2001. Para usuarios de otros países, también aplicamos los estándares equivalentes de su legislación local.

**La base de datos de usuarios de TherianMatchConnect se encuentra inscripta ante la Agencia de Acceso a la Información Pública (AAIP) bajo el N° de registro: [N° de inscripción AAIP].**

---

## 2. DATOS QUE RECOPILAMOS

### 2.1 Datos de Registro
- Nombre o apodo
- Email
- Fecha de nacimiento (para verificar mayoría de edad)
- Género / Identidad de género *(dato sensible — ver sección 2.6)*

### 2.2 Datos de Perfil
- **Fotos públicas** (hasta 6) — visibles para todos los usuarios
- **Fotos exclusivas** (hasta 12, solo usuarios Premium) — ver sección 2.7
- Biografía
- Tipo therianthrope *(dato sensible — ver sección 2.6)*
- Moods e intereses
- Ubicación aproximada (ciudad — opcional)

### 2.3 Datos de Comportamiento
- Mensajes de chat (contenido y timestamp)
- Perfiles vistos y swipes (like/pass)
- Regalos enviados/recibidos
- Planes comprados
- Navegación dentro de la App (anonimizado)

### 2.4 Datos de Dispositivo
- Tipo de dispositivo y sistema operativo
- Versión de la App
- ID de dispositivo (para seguridad y notificaciones push)
- Dirección IP (anonimizada tras 90 días)

### 2.5 Datos de Pago
- Últimos 4 dígitos de tarjeta (NO guardamos el número completo)
- Nombre del titular
- Email de facturación
- Historial de transacciones

Los pagos se procesan mediante Apple App Store, Google Play Store o Stripe. Nosotros **no almacenamos datos completos de tarjeta**.

### 2.6 Datos Sensibles (Art. 2, Ley 25.326)

Bajo la Ley 25.326, se consideran **datos sensibles** aquellos que revelan origen étnico, opiniones políticas, convicciones religiosas, datos de salud, vida sexual e identidad de género. En nuestra App, los siguientes datos tienen esta categoría:

- **Identidad de género**
- **Tipo therianthrope** (puede revelar aspectos de identidad personal)
- **Datos biométricos** (solo si verificás identidad con foto de documento)

Estos datos se tratan con protección reforzada. Al completar tu perfil con esta información **otorgás consentimiento explícito** para su tratamiento. Podés eliminarlos en cualquier momento desde tu perfil.

### 2.7 Fotos Exclusivas (Premium)

Las fotos exclusivas son contenido íntimo o privado que solo querés compartir con un grupo limitado de usuarios. Tienen tratamiento reforzado:

**Almacenamiento**
- Bucket privado en Supabase Storage (no accesible públicamente)
- Segregación por user ID: solo tu UUID puede escribir en tu carpeta
- Row Level Security (RLS) a nivel de base de datos

**Acceso**
- Solo usuarios con suscripción **Premium activa** generan URLs firmadas para visualizarlas
- Las URLs firmadas expiran **automáticamente en 1 hora**
- Los usuarios no premium ven un placeholder bloqueado, sin posibilidad técnica de acceder al archivo

**Protección anti-captura**
- **Android**: capturas de pantalla bloqueadas por sistema operativo (FLAG_SECURE) cuando se visualizan fotos exclusivas
- **iOS**: el sistema operativo no permite bloquear capturas, pero detectamos cada intento y queda registrado en tu cuenta para fines de seguridad
- Los intentos reiterados resultan en bloqueo de cuenta (ver Términos, sección 5.4)

**Uso restringido**
- NO se utilizan para entrenamiento de algoritmos
- NO se incluyen en analytics anonimizados
- NO se replican en backups de larga duración
- Eliminación: permanente y dentro de 24 horas desde tu solicitud

### 2.8 Datos Biométricos para Autenticación

La App permite usar tu huella digital o reconocimiento facial para iniciar sesión. Estos datos:
- **Permanecen en tu dispositivo** (Keychain en iOS / Keystore en Android)
- **Nunca se transmiten** a nuestros servidores
- **Nunca son visibles** para nosotros
- Podés desactivarlos desde Configuración → Seguridad

### 2.9 Registro de Eventos de Seguridad

Para proteger a otros usuarios, registramos en nuestra base de datos los siguientes eventos:
- Intentos de captura de pantalla detectados sobre fotos exclusivas ajenas
- Reportes recibidos contra tu cuenta
- Acciones de moderación tomadas

Estos registros se conservan por 2 años y son auditables solo por nuestro equipo de moderación bajo procedimientos documentados.

---

## 3. CÓMO USAMOS TUS DATOS

### 3.1 Servicios Esenciales
- Crear y gestionar tu cuenta
- Procesar pagos
- Enviar y recibir mensajes
- Mostrar perfiles compatibles
- Soporte técnico

### 3.2 Mejora de la App
- Analizar patrones de uso (datos anonimizados)
- Mejorar algoritmos de matching
- Detectar y prevenir fraudes
- Identificar errores técnicos

### 3.3 Comunicación
- Notificaciones sobre nuevos mensajes y matches
- Actualizaciones de seguridad
- Cambios en Términos o Privacidad

### 3.4 Marketing (SOLO CON CONSENTIMIENTO EXPLÍCITO)
- Promociones de planes
- Novedades de la App
- Encuestas opcionales de satisfacción

**Podés retirar tu consentimiento de marketing en cualquier momento desde Configuración → Notificaciones.**

---

## 4. DATOS COMPARTIDOS CON TERCEROS

Compartimos datos únicamente cuando es necesario para operar la App:

| Proveedor | Datos compartidos | Propósito | Protección |
|-----------|------------------|-----------|------------|
| **Apple / Google Play** | Email, historial de compras | Procesar pagos | Cumplimiento PCI DSS |
| **Stripe** | Últimos 4 dígitos, email | Procesar pagos | Encriptación extremo a extremo |
| **Supabase** (AWS infra, EE.UU./UE) | Perfil, mensajes, fotos | Base de datos y almacenamiento de archivos | RLS, encriptación AES-256 en reposo, TLS 1.3 en tránsito, SOC 2 Type II |
| **Firebase** | Eventos anonimizados | Analítica y notificaciones push | Sin datos identificables |
| **Autoridades legales** | Lo requerido por orden judicial | Cumplimiento legal | Solo con orden judicial válida |

### NO compartimos:
- ❌ Mensajes privados con terceros
- ❌ Fotos a redes sociales sin tu acción
- ❌ Datos completos de pago
- ❌ Datos a anunciantes o brokers de datos
- ❌ Información a otras apps o servicios

Todos los proveedores tienen firmados **Acuerdos de Tratamiento de Datos (DPA)** que los obligan a usar los datos solo para los fines especificados y a cumplir con los estándares de seguridad requeridos.

---

## 5. TRANSFERENCIA INTERNACIONAL DE DATOS

Algunos de nuestros proveedores (AWS, Google Cloud, Stripe, Firebase) operan en servidores fuera de Argentina.

De acuerdo con el **Art. 12 de la Ley 25.326**, la transferencia de datos a países u organismos internacionales que no proporcionen niveles adecuados de protección está prohibida. Por eso:

- Solo transferimos datos a proveedores ubicados en países o bajo certificaciones con nivel de protección adecuado (Estados Unidos bajo Privacy Shield / SCCs, Unión Europea, etc.)
- Todos los datos transferidos viajan **encriptados**
- Los contratos con proveedores incluyen cláusulas de protección equivalente a las exigidas por la Ley 25.326

---

## 6. CIFRADO Y SEGURIDAD

### 6.1 Medidas Técnicas

**En tránsito:**
- HTTPS/TLS 1.3
- Perfect Forward Secrecy (PFS)

**En reposo:**
- AES-256 para datos sensibles
- bcrypt (12 rounds) para contraseñas
- Tokens de sesión encriptados

**En dispositivo:**
- Keychain (iOS) para tokens
- Keystore (Android) para datos sensibles

**Control de acceso a fotos:**
- Fotos públicas: bucket público de Supabase Storage, URLs estables y cacheables
- Fotos exclusivas: bucket privado, acceso únicamente vía URLs firmadas con expiración de 1 hora
- Row Level Security (RLS) a nivel de base de datos: cada usuario solo puede escribir/borrar archivos en su propia carpeta
- Solo usuarios Premium activos pueden generar URLs firmadas para fotos exclusivas ajenas
- Los intentos de captura de pantalla quedan registrados (sección 2.9)

### 6.2 Medidas Administrativas

- Acceso restringido: solo personal con necesidad operativa
- NDA obligatorio para empleados con acceso a datos
- Auditorías de seguridad periódicas
- Monitoreo continuo de accesos inusuales

### 6.3 Respuesta a Incidentes de Seguridad

Si detectamos una brecha de seguridad que afecte tus datos:
1. Contención inmediata (máximo 2 horas)
2. Investigación interna
3. Notificación a los usuarios afectados en un **máximo de 72 horas**
4. Reporte a la **AAIP** conforme al Art. 11 de la Resolución 47/2018

---

## 7. RETENCIÓN DE DATOS

| Tipo de dato | Período de retención | Qué pasa al vencer |
|---|---|---|
| Perfil activo | Mientras usás la App | Se anonimiza a los 30 días del cierre |
| Fotos públicas de perfil | Hasta eliminación | Se eliminan en 30 días |
| **Fotos exclusivas (Premium)** | Hasta eliminación | **Se eliminan en 24 horas** desde tu solicitud, sin replicación en backups de larga duración |
| Mensajes | 1 año desde envío | Se eliminan permanentemente |
| Datos de pago | 7 años | Requerimiento legal impositivo (AFIP) |
| Logs de acceso | 90 días | Se eliminan automáticamente |
| Datos de dispositivo | 30 días | Se eliminan automáticamente |
| Registro de violaciones de seguridad | 2 años | Para fines de moderación y denuncias judiciales |
| Fecha de nacimiento | 7 años post-cierre | Verificación de edad legal |

Los datos se borran permanentemente o se anonimizan al vencer el plazo.

---

## 8. TUS DERECHOS (Ley 25.326, Arts. 14–16)

Tenés derecho a:

### 8.1 Acceso (Art. 14)
Ver todos los datos que tenemos sobre vos.
- Solicitá: soportetherianmatch@gmail.com
- Plazo de respuesta: **30 días corridos**
- Sin costo

### 8.2 Rectificación (Art. 16)
Actualizar datos incorrectos o desactualizados.
- Directamente desde tu perfil en la App
- O contactando: soportetherianmatch@gmail.com

### 8.3 Supresión ("Derecho al Olvido") (Art. 16)
Solicitar la eliminación de tus datos.
- Procesamos en **30 días**
- Excepto datos legalmente requeridos (impuestos, seguridad)
- No recuperable una vez ejecutado

### 8.4 Portabilidad
Descargar una copia de tus datos en formato JSON/CSV.
- Solicitá desde: Configuración → Exportar mis datos
- Plazo: 30 días

### 8.5 Oposición
- Optar por no recibir marketing en cualquier momento
- Optar por no participar en analítica desde Configuración

### 8.6 Cómo ejercer tus derechos
Enviá un email a **soportetherianmatch@gmail.com** con:
- Asunto: [Tipo de solicitud] + tu email de cuenta
- Descripción de lo que solicitás

Respondemos dentro de los **30 días corridos**. Si la respuesta no te satisface, podés recurrir a la **AAIP**.

---

## 9. EDAD Y MENORES

9.1 Esta App es **solo para mayores de 18 años**.

9.2 Verificamos la edad mediante validación de fecha de nacimiento al registrarse.

9.3 Si detectamos que un usuario es menor de edad:
- Eliminamos la cuenta de inmediato
- No retenemos los datos
- Reportamos a las autoridades si corresponde bajo la **Ley 26.904 (Grooming)**

---

## 10. COOKIES Y TECNOLOGÍAS DE SEGUIMIENTO

La App utiliza tecnologías equivalentes a cookies para:

| Tecnología | Propósito | Duración |
|---|---|---|
| Token de sesión | Mantener tu sesión | 90 días |
| Preferencias | Recordar ajustes | 1 año |
| Analytics (Firebase) | Analítica anonimizada | 6 meses |

Podés borrar estos datos desde: **Configuración → Privacidad → Limpiar datos locales**.

---

## 11. CAMBIOS A ESTA POLÍTICA

11.1 Actualizaremos esta Política según sea necesario.

11.2 Los cambios materiales requieren:
- Notificación previa por email con **14 días de anticipación**
- Posibilidad de rechazar eliminando tu cuenta
- El uso continuado implica aceptación

---

## 12. CONTACTO Y RECLAMOS

**Oficial de Protección de Datos (DPO):**
- Email: soportetherianmatch@gmail.com
- Teléfono: [Teléfono de contacto]
- Domicilio: [Dirección legal, Ciudad, Argentina]

**Plazo de respuesta:** 30 días corridos desde la recepción de tu solicitud.

**Si no quedás satisfecho con nuestra respuesta**, podés presentar una denuncia ante la autoridad de control:

**Agencia de Acceso a la Información Pública (AAIP)**
- Web: [aaip.gob.ar](https://www.aaip.gob.ar)
- Email: infopublica@aaip.gob.ar
- Av. Pte. Gral. Julio A. Roca 710, Piso 2 — CABA, Argentina

---

## RESUMEN PARA USUARIOS

✅ **Protegemos** tus datos con encriptación y acceso restringido
❌ **No vendemos** datos, no rastreamos entre apps, no compartimos con anunciantes
🔐 **Vos tenés el control**: descargá, corregí o eliminá tus datos cuando quieras
📋 **Transparencia**: acceso a toda tu información personal en menos de 30 días
🇦🇷 **Ley aplicable**: Ley 25.326 de Protección de Datos Personales (Argentina)

**¿Dudas? Escribinos a soportetherianmatch@gmail.com**
