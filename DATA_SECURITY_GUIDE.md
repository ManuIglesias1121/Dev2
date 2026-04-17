# DATA SECURITY & COMPLIANCE GUIDE

**Para Desarrolladores y Administradores**

---

## 1. ARQUITECTURA DE SEGURIDAD

### 1.1 Capas de Protección

```
┌─────────────────────────────────────────┐
│ Capa 1: CLIENTE (React Native)          │
│ - HTTPS only                            │
│ - Token encryption en Keychain/Keystore │
│ - No almacenar contraseña en plaintext  │
└─────────────────────────────────────────┘
                   ↓ HTTPS/SSL 1.3 ↓
┌─────────────────────────────────────────┐
│ Capa 2: API GATEWAY                     │
│ - Rate limiting (10 req/sec por user)   │
│ - CORS restringido                      │
│ - Token validation (JWT)                │
│ - Request signing                       │
└─────────────────────────────────────────┘
                   ↓ Encriptado ↓
┌─────────────────────────────────────────┐
│ Capa 3: BACKEND (Node.js/Python)        │
│ - Input validation                      │
│ - SQL/NoSQL injection prevention        │
│ - Cross-site request forgery (CSRF)     │
│ - Authentication & Authorization        │
└─────────────────────────────────────────┘
                   ↓ Encriptado ↓
┌─────────────────────────────────────────┐
│ Capa 4: BASE DE DATOS                   │
│ - AES-256 encryption                    │
│ - bcrypt for passwords (salt + 12rnd)   │
│ - Field-level encryption para sensibles │
│ - Access logs                           │
└─────────────────────────────────────────┘
```

### 1.2 Protocolos Criptográficos

**Contraseñas:**
```javascript
// ✅ CORRECTO
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// ❌ INCORRECTO - No hagas esto
const crypto = require('crypto');
const hashedPassword = crypto.createHash('sha256').update(plainPassword).digest('hex');
// SHA-256 sin salt es vulnerable a ataques de diccionario
```

**Tokens de Sesión:**
```javascript
// ✅ CORRECTO - JWT con firma
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,  // Secret muy largo (mínimo 32 caracteres)
  { 
    expiresIn: '7d',       // Expiración corta
    algorithm: 'HS512'     // Algoritmo fuerte
  }
);

// ❌ INCORRECTO
const token = userId.toString();  // Predecible
```

**Datos Sensibles en Base de Datos:**
```javascript
// ✅ CORRECTO - AES-256 para SSN, datos sensibles
const crypto = require('crypto');

function encryptField(plaintext, encryptionKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
}

// ❌ INCORRECTO
const plaintext = user.socialSecurityNumber;  // Nunca sin encriptación
```

---

## 2. VALIDACIÓN Y SANITIZACIÓN

### 2.1 Input Validation

```javascript
// Para Email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Email inválido');
}

// Para Contraseñas
function validatePassword(password) {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };
  
  return Object.values(requirements).every(r => r);
}

// Para Texto (Bio, Mensajes)
function sanitizeText(text) {
  // Entidades HTML
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Para URLs
const validUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
```

### 2.2 Prevenir Inyecciones

```javascript
// ❌ SQL INJECTION - No hagas esto
const userId = req.body.userId;
const query = `SELECT * FROM users WHERE id = ${userId}`;
// Si userId = "1; DROP TABLE users; --" → Desastre

// ✅ SQL INJECTION - Usa parametrización
const query = 'SELECT * FROM users WHERE id = ?';
const results = await db.query(query, [userId]);

// ❌ NoSQL INJECTION - No hagas esto
const username = req.body.username;
const user = await User.findOne({ username: username });
// Si username = { "$ne": null } → devuelve todos los usuarios

// ✅ NoSQL INJECTION - Valida tipos
if (typeof username !== 'string') {
  throw new Error('Username debe ser string');
}
const user = await User.findOne({ username: username });

// ❌ XSS (Cross-Site Scripting) - No hagas esto
res.send(`<h1>Bienvenido ${userInput}</h1>`);
// Si userInput = "<script>alert('XSS')</script>"

// ✅ XSS - Escapa HTML
const escaped = sanitizeText(userInput);
res.send(`<h1>Bienvenido ${escaped}</h1>`);
```

---

## 3. GESTIÓN DE TOKENS Y SESIONES

### 3.1 JWT Securo

```javascript
// Configuración en .env
JWT_SECRET=crypto.randomBytes(32).toString('hex')  // Regenerar si se filtra
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=crypto.randomBytes(32).toString('hex')
REFRESH_TOKEN_EXPIRES_IN=30d

// Crear token con refresh logic
function createTokenPair(userId) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }  // Muy corto
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// Validar token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return null;  // Force refresh
    }
    throw new Error('Token inválido');
  }
}
```

### 3.2 Revocación de Tokens

```javascript
// Blacklist para casos de logout/cambio de contraseña
const tokenBlacklist = new Set();

function revokeToken(token) {
  tokenBlacklist.add(token);
}

function isTokenRevoked(token) {
  return tokenBlacklist.has(token);
}

// Middleware
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && isTokenRevoked(token)) {
    return res.status(401).json({ error: 'Token revocado' });
  }
  next();
});
```

---

## 4. AUTENTICACIÓN Y AUTORIZACIÓN

### 4.1 Two-Factor Authentication (2FA)

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Registrar 2FA
async function setup2FA(user) {
  const secret = speakeasy.generateSecret({
    name: `Therianthrope Dating (${user.email})`,
    issuer: 'Therianthrope',
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode: qrCode,
  };
}

// Verificar 2FA token
function verify2FAToken(token, secret) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1,  // Permite 1 código anterior/siguiente
  });
}
```

### 4.2 Role-Based Access Control (RBAC)

```javascript
const roles = {
  user: ['viewProfile', 'sendMessage', 'uploadPhotos'],
  moderator: ['viewProfile', 'sendMessage', 'uploadPhotos', 'reviewReports', 'warnUsers'],
  admin: ['*'],  // Todos los permisos
};

function hasPermission(user, actionRequired) {
  const userPermissions = roles[user.role] || [];
  return userPermissions.includes(actionRequired) || userPermissions.includes('*');
}

// Middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};

// Uso
app.post('/reports/review', requirePermission('reviewReports'), handleReview);
```

---

## 5. PROTECCIÓN DE DATOS SENSIBLES

### 5.1 PII (Personally Identifiable Information)

```javascript
// Nunca loguees PII
// ❌ INCORRECTO
console.log(`User ${user.email} logged in`);

// ✅ CORRECTO
console.log(`User ${user.id} logged in`);

// Nunca envíes PII en respuestas error
// ❌ INCORRECTO
res.json({ error: `User ${email} no encontrado` });

// ✅ CORRECTO
res.json({ error: 'Usuario no encontrado' });
```

### 5.2 Gestión de Contraseñas

```javascript
// Nunca guardes en plaintext
// ❌ INCORRECTO
user.password = plainPassword;

// ✅ CORRECTO
user.password = await bcrypt.hash(plainPassword, 12);

// Nunca envíes contraseña al cliente
// ❌ INCORRECTO
return { user, password: user.password };

// ✅ CORRECTO
const { password, ...safeUser } = user.toJSON();
return safeUser;

// Implementa límite de intentos fallidos
async function attemptLogin(email, password, maxAttempts = 5) {
  let user = await User.findOne({ email });
  
  if (user.failedLoginAttempts >= maxAttempts) {
    throw new Error('Cuenta temporalmente bloqueada');
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    user.failedLoginAttempts++;
    await user.save();
    throw new Error('Contraseña incorrecta');
  }
  
  user.failedLoginAttempts = 0;
  await user.save();
  return user;
}
```

---

## 6. COMUNICACIÓN SEGURA

### 6.1 HTTPS / TLS

```javascript
// ✅ Fuerza HTTPS en producción
const express = require('express');
const app = express();

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Configurar certificado SSL
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem'),
};

https.createServer(options, app).listen(443);
```

### 6.2 Headers de Seguridad

```javascript
const helmet = require('helmet');
app.use(helmet());

// Específicamente:
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}));

app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: 'deny' }));
```

---

## 7. AUDITORÍA Y LOGGING

### 7.1 Logging Seguro

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Log eventos importantes sin PII
logger.info('User login attempt', { userId: user.id });  // ✅
logger.info('User login attempt', { email: user.email }); // ❌

// Rastrear cambios sensibles
logger.warn('Password changed', { userId: user.id, timestamp: new Date() });
logger.warn('Email changed', { userId: user.id, oldEmail: masked(oldEmail), timestamp: new Date() });

// Rastrear acceso a datos sensibles
logger.info('Accessed user profile', { userId: user.id, accessedUserId: target.id });
```

### 7.2 Audit Trail

```javascript
// Guardar cambios en tabla audit
async function logAudit(action, userId, details) {
  await AuditLog.create({
    action,        // 'user_created', 'password_changed', 'email_changed'
    userId,
    details,       // Contexto del cambio
    ip: req.ip,    // IP del cliente
    userAgent: req.get('User-Agent'),
    timestamp: new Date(),
  });
}

// Uso
await logAudit('password_changed', user.id, { method: 'reset_email' });
await logAudit('2fa_enabled', user.id, {});
await logAudit('data_export_requested', user.id, {});
```

---

## 8. GESTIÓN DE INCIDENTES DE SEGURIDAD

### 8.1 Detección de Anomalías

```javascript
// Detectar acceso desde nuevas ubicaciones
async function detectAnomaly(user, newIp) {
  const previousIps = await AccessLog.distinct('ip', { userId: user.id });
  
  if (!previousIps.includes(newIp)) {
    // Potencial credential compromise
    await sendSecurityAlert(user.email, {
      subject: 'Nuevo acceso a tu cuenta',
      body: `Se detectó login desde IP ${newIp}`,
      action: 'Verifica tu cuenta o cambia contraseña',
    });
  }
}

// Detectar actividad inusual
async function detectSuspiciousActivity(userId) {
  const recentActions = await ActionLog.find(
    { userId },
    { createdAt: { $gte: new Date(Date.now() - 3600000) } }
  );
  
  if (recentActions.length > 100) {
    // Posible ataque de fuerza bruta
    await lockAccount(userId);
    await notifyAdmin(`Suspicious activity detected on ${userId}`);
  }
}
```

### 8.2 Respuesta a Incidentes

```javascript
/**
 * PLAN DE RESPUESTA A BRECHA DE DATOS
 * 
 * FASE 1: Detección (0-2 horas)
 *   - Alertas automáticas
 *   - Monitoreo de seguridad
 *   - Revisar logs
 * 
 * FASE 2: Contención (2-6 horas)
 *   - Aislar sistemas afectados
 *   - Revocar tokens
 *   - Cambiar credenciales de servicio
 * 
 * FASE 3: Investigación (6-48 horas)
 *   - Análisis forense
 *   - Determinar datos afectados
 *   - Identificar causa raíz
 * 
 * FASE 4: Notificación (máximo 72 horas)
 *   - Notificar usuarios afectados
 *   - Contactar autoridades
 *   - Comunicado de prensa
 * 
 * FASE 5: Remediación (1-4 semanas)
 *   - Parchear vulnerabilidad
 *   - Auditoría de seguridad
 *   - Implementar controles adicionales
 */

async function handleSecurityBreach(breachDetails) {
  // 1. Contención inmediata
  await revokeAllTokens();
  await lockSuspiciousAccounts();
  await isolateDatabase();
  
  // 2. Documentar
  const incident = await SecurityIncident.create({
    type: breachDetails.type,
    severity: breachDetails.severity,
    affectedUsers: breachDetails.users,
    description: breachDetails.description,
    detectedAt: new Date(),
  });
  
  // 3. Notificar a usuarios
  for (const user of breachDetails.users) {
    await sendBreachNotification(user.email, {
      details: breachDetails,
      actions: ['Change password', 'Enable 2FA'],
    });
  }
  
  // 4. Reportar a autoridades si es requerido
  if (breachDetails.severity === 'critical') {
    await reportToRegulator('data_breach', incident);
  }
}
```

---

## 9. CUMPLIMIENTO REGULATORIO

### 9.1 GDPR (Regulación Europea)

```javascript
// Derecho a Acceso (Art. 15)
app.get('/api/user/export-data', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const data = {
    profile: user,
    messages: await Message.find({ userId: user.id }),
    loginHistory: await AccessLog.find({ userId: user.id }),
    purchaseHistory: await Purchase.find({ userId: user.id }),
  };
  
  res.json(data);
});

// Derecho a Olvido (Art. 17)
app.delete('/api/user/account', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  // Anonimizar datos
  await User.updateOne({ _id: userId }, {
    email: `deleted_${userId}`,
    name: 'Deleted User',
    photos: [],
    bio: '',
  });
  
  // Eliminar datos de pago
  await Payment.deleteMany({ userId });
  
  // Conservar para auditoría legal (7 años)
  await AuditLog.create({
    action: 'account_deleted',
    userId,
    timestamp: new Date(),
  });
  
  res.json({ message: 'Account deleted and anonymized' });
});

// Derecho a Portabilidad (Art. 20)
app.get('/api/user/portable-data', requireAuth, async (req, res) => {
  const userData = await User.findById(req.user.id);
  
  const jsonData = {
    profile: userData,
    preferences: userData.preferences,
    matches: userData.matches,
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=my_data.json');
  res.send(JSON.stringify(jsonData, null, 2));
});
```

### 9.2 CCPA (Regulación California)

```javascript
// Similar a GDPR pero con consideraciones adicionales
// California también requiere:
// - Notificación de venta de datos personales
// - Opt-out derecho a no vender
// - Categorías específicas de datos

app.post('/api/user/opt-out-sale', requireAuth, async (req, res) => {
  await User.updateOne(
    { _id: req.user.id },
    { dataSaleOptOut: true }
  );
  
  res.json({ message: 'You have opted out of data sales' });
});
```

---

## 10. CHECKLIST DE SEGURIDAD PRE-LAUNCH

### Antes de Producción:

- ✅ Cambiar todas las credenciales de desarrollo
- ✅ Habilitar HTTPS/TLS con certificados válidos
- ✅ Configurar JWT_SECRET fuerte y único
- ✅ Implementar rate limiting en API
- ✅ Implementar CORS restringido
- ✅ Habilitar logging y monitoreo
- ✅ Configurar alertas de seguridad
- ✅ Realizar test de penetración
- ✅ Auditar dependencias (npm audit)
- ✅ Configurar firewall y WAF
- ✅ Hacer backup de base de datos
- ✅ Configurar plan de recuperación ante desastres (DRP)
- ✅ Revisar políticas de privacidad con legal
- ✅ Implementar 2FA para admins
- ✅ Crear manual de respuesta a incidentes

### Después del Launch:

- 📋 Monitoreo 24/7
- 📋 Auditorías de seguridad mensuales
- 📋 Actualización de dependencias
- 📋 Rotación de credenciales cada 90 días
- 📋 Tests de penetración anual
- 📋 Simulacros de incidentes trimestrales
- 📋 Capacitación de seguridad para equipo

---

**Preguntas? Contacta: security@therianthrope-dating.com**
