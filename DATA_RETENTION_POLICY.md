# POLÍTICA DE RETENCIÓN DE DATOS

**Última actualización: Abril 5, 2026**

---

## 1. PROPÓSITO

Esta política define cuánto tiempo retenemos cada tipo de dato del usuario después de:
- Fin del contrato
- Eliminación de cuenta
- Solicitud del usuario
- Inactividad

---

## 2. TABLA MAESTRA DE RETENCIÓN

### 2.1 DATOS DE USUARIO

| Dato | Retención | Después de Eliminación | Motivo |
|------|-----------|-----|--------|
| **Perfil de Usuario** | Active + 30 días | Deletree o anonimice | Requerido GDPR Art. 17 |
| Nombre | Active | Anonimice a "Deleted User" | No required para funcionalidad |
| Email | Active + 2 años | Guardar encriptado (no identificable) | Auditoría de cuenta |
| Contraseña | Active | Elimine permanentemente | Nunca necesario post-borrado |
| Foto de perfil | Active + 90 días | Elimine | Derecho a olvido |
| Fotos privadas | Active | Elimine en 30 días | Usuario debe tenercontrol |
| Bio/Descripción | Active + 30 días | Anonimice | GDPR |
| Fecha de nacimiento | Active + 7 años | Guardar para auditoría | Verificación de edad legal |
| Ubicación | Active + 1 año | Elimine | GDPR derecho a privacidad |
| Género/Identidad | Active | Anonimice | GDPR derecho a privacidad |
| Datos de pago | Active + 7 años | Guardar para impuestos | Requerimiento legal |

### 2.2 DATOS DE ACTIVIDAD

| Dato | Retención | Después de Eliminación | Motivo |
|------|-----------|-----|--------|
| **Mensajes** | 1 año | Elimine en 30 días | Usuario puede solicitar portabilidad |
| Historial de chat | 1 año | Elimine | Privacidad de conversación |
| Swipes (like/pass) | 90 días | Elimine | No relevant |
| Búsquedas | 30 días | Elimine | Privacidad |
| Vistas a perfil | 30 días | Elimine | No identificable sin cuenta |
| Time spent | 6 meses | Elimine | Analytics anonimizado |
| Gifts enviados | 1 año | Guardar anonimizado | Auditoría de pagos |
| Gifts recibidos | 1 año | Guardar anonimizado | Auditoría |

### 2.3 DATOS DE SEGURIDAD Y AUDITORÍA

| Dato | Retención | Nunca Eliminar | Motivo |
|------|-----------|-----|--------|
| **Access logs** | 90 días activos | Login attempts (30 días adicionales) | Detectar fraude |
| Login success/failure | 90 días | Sí (fraud prevention) | Intentos bruto force |
| IP addresses | 90 días | Sí (última sesión) | Análisis de anomalías |
| Device info | 90 días | Sí (reconocimiento) | Detección de compromiso |
| 2FA events | 1 año | Sí | Auditoría de seguridad |
| Password changes | 3 años | Sí | Auditoría de cumplimiento |
| Cambios de email | 3 años | Sí | Auditoría |
| Resets de contraseña | 1 año | Sí | Detectar patrones sospechosos |
| Cambios de plan | 7 años | Sí (impuestos) | Requerimiento legal |

### 2.4 DATOS DE PAGO

| Dato | Retención | Nunca Eliminar | Motivo |
|------|-----------|-----|--------|
| **Último 4 dígitos tarjeta** | Mientras activa | Sí | Reconocimiento del usuario |
| Nombre titular | 7 años | Sí | Requerimiento impositivo |
| Email de facturación | 7 años | Sí | Auditoría impositiva |
| Historial de transacciones | 7 años | Sí | Requerimiento legal |
| Número tarjeta completo | NUNCA | Nunca guardar | PCI DSS compliance |
| CVV | NUNCA | Nunca guardar | Seguridad |
| Tokens de pago | Mientras activo | Sí (últimoToken) | Renovación automática |

### 2.5 DATOS DE REPORTES Y MODERACIÓN

| Dato | Retención | Nunca Eliminar | Motivo |
|------|-----------|-----|--------|
| **Reports de usuarios** | 2 años | Sí | Patrones de abuso |
| Evidencia de reporte | 2 años | Sí | Litigio potencial |
| Acciones de moderación | 3 años | Sí | Auditoría de cumplimiento |
| Warnings/Bans | Permanente | Sí | Reincidencia patterns |
| Appeals | 1 año | Sí | Auditoría de justicia |
| Reporte a autoridades | Permanente | Sí | Requerimiento legal |

### 2.6 DATOS ANALÍTICOS

| Dato | Retención | Después de Eliminación | Motivo |
|------|-----------|-----|--------|
| **Eventos agregados** | 2 años | Anonimice | Analytics de producto |
| Eventos de usuario (sin ID) | 1 año | Elimine | Privacy |
| Funnel analytics | 1 año | Anonimice | Mejora de producto |
| Crash reports | 6 meses | Elimine | Bug fixing |
| Performance metrics | 6 meses | Elimine | Optimization |

---

## 3. EXCEPCIONES LEGALES

### 3.1 Casos Donde NO Eliminamos

Aunque el usuario solicite eliminación, podemos retener:

1. **Requisito Legal**
   - Orden judicial válida
   - Investigación de autoridades
   - Requerimiento de regulador

2. **Litigio Potencial**
   - Usuario presentó denuncia contra otra persona
   - Data podría ser necesaria en corte
   - Retención de 3 años mínimo

3. **Fraude Detectado**
   - Usuario estafó a otros
   - Usar dinero fraudulento
   - Actividad criminal
   - Retención de 7 años

4. **Obligaciones Impositivas**
   - Transacciones pagadas
   - Reportes a hacienda
   - Retención de 7 años post-eliminación

---

## 4. SOLICITUDES DE ELIMINACIÓN

### 4.1 Proceso

**Paso 1: Usuario solicita eliminación**
```
POST /api/user/request-deletion
{
  reason: "No longer using the app",
  password: "[confirmar contraseña]"
}
```

**Paso 2: Período de "cooling off" (Opcional)**
- Recomendado: 14 días
- Usuario puede reactivar cuenta
- Después: Eliminación irreversible

**Paso 3: Eliminación**
- Anonimizar datos personales
- Eliminar datos no-essentials
- Guardar datos legales/de auditoría

**Paso 4: Confirmación**
- Enviar email de confirmación
- Proporcionar copia de datos exportados

### 4.2 Ejemplo de Anonimización

```javascript
async function anonymizeUserData(userId) {
  const user = await User.findById(userId);
  
  // Guardar hash para auditoría (no identificable)
  const emailHash = await hashForAudit(user.email);
  
  // Anonimizar
  const anonymized = {
    _id: user._id,  // Guardar para auditoría
    email: emailHash,  // Hash, no identificable
    name: 'Deleted User',
    photos: [],
    bio: '',
    gender: null,
    theriotype: null,
    location: null,
    isDeleted: true,
    deletedAt: new Date(),
  };
  
  await User.updateOne({ _id: userId }, anonymized);
  
  // Logs permanecen para auditoría
  await AuditLog.create({
    action: 'user_anonymized',
    userId,
    timestamp: new Date(),
  });
}
```

---

## 5. ELIMINACIÓN AUTOMÁTICA

### 5.1 Cron Jobs

```javascript
// Ejecutar diariamente
const schedule = require('node-schedule');

// Eliminar logs de acceso antiguos (>90 días)
schedule.scheduleJob('0 2 * * *', async () => {
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  await AccessLog.deleteMany({ createdAt: { $lt: ninetyDaysAgo } });
  console.log('Cleaned old access logs');
});

// Eliminar eventos de analytics anonimizados (>2 años)
schedule.scheduleJob('0 3 * * *', async () => {
  const twoYearsAgo = Date.now() - (2 * 365 * 24 * 60 * 60 * 1000);
  await AnalyticsEvent.deleteMany({ createdAt: { $lt: twoYearsAgo } });
  console.log('Cleaned old analytics');
});

// Eliminar mensajes archivados (>1 año)
schedule.scheduleJob('0 4 * * *', async () => {
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  await Message.deleteMany({ 
    deletedAt: { $lt: oneYearAgo },
    isArchived: true
  });
  console.log('Cleaned old archived messages');
});
```

### 5.2 Auditoría de Eliminación

```javascript
// Registrar cada eliminación para auditoría
async function auditDeletion(dataType, count, timestamp) {
  await DeletionAudit.create({
    dataType,        // 'AccessLog', 'AnalyticsEvent', etc.
    recordsDeleted: count,
    timestamp,
    executedBy: 'cron',
  });
  
  // Alertar si count > expected
  if (count > 100000) {
    await sendAdminAlert(`Large deletion detected: ${dataType} (${count} records)`);
  }
}
```

---

## 6. EXPORTACIÓN DE DATOS (GDPR Art. 20)

### 6.1 Formato Portátil

```javascript
app.get('/api/user/export-data', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const messages = await Message.find({ 
    $or: [{ senderId: user.id }, { recipientId: user.id }] 
  });
  
  const exportData = {
    _exported_at: new Date().toISOString(),
    _user_id: user.id,
    _export_format: 'JSON',
    profile: {
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      theriotype: user.theriotype,
      bio: user.bio,
      photos: user.photos,
    },
    messages: messages.map(m => ({
      id: m.id,
      content: m.content,
      sender: m.senderId === user.id ? 'me' : 'them',
      timestamp: m.createdAt,
    })),
    dataRetentionPolicies: {
      profile_retention: '30 days after deletion',
      messages_retention: '1 year after creation',
      payments_retention: '7 years (legal requirement)',
      activity_retention: '90 days (analytics)',
    },
  };
  
  const json = JSON.stringify(exportData, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=my_therianthrope_data.json');
  res.send(json);
});
```

---

## 7. INACTIVIDAD Y DORMANT ACCOUNTS

### 7.1 Usuarios Inactivos

Después de **12 meses sin login**:

| Período | Acción |
|--------|--------|
| 11 meses | Email de recordatorio: "Vuelve a la comunidad" |
| 12 meses | Account marcado como "dormant" |
| 13 meses | Email: "Tu cuenta será eliminada en 30 días" |
| 13 meses + 30 días | Cuenta eliminada (o anonimizada según GDPR) |

```javascript
// Detectar y manejar cuentas inactivas
async function handleDormantAccounts() {
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  const dormantUsers = await User.find({
    lastLogin: { $lt: oneYearAgo },
    isDormant: false,
  });
  
  for (const user of dormantUsers) {
    // 1. Enviar correo final
    await sendEmail(user.email, {
      subject: 'Tu cuenta será eliminada',
      body: 'Tu cuenta ha estado inactiva. Será eliminada en 30 días.',
      action: 'Vuelve ahora para reactivar',
    });
    
    // 2. Marcar como dormant
    await User.updateOne(
      { _id: user.id },
      { isDormant: true, dormantAt: new Date() }
    );
  }
}

// Eliminar cuentas dormant after 30 días
async function deleteDormantAccounts() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const toDelete = await User.find({
    isDormant: true,
    dormantAt: { $lt: thirtyDaysAgo },
  });
  
  for (const user of toDelete) {
    await anonymizeUserData(user.id);
  }
}
```

---

## 8. DATOS COMPARTIDOS CON TERCEROS

### 8.1 Retención en Proveedores

Cuando compartimos datos con especialistas (Stripe, AWS):

| Proveedor | Datos Compartidos | Retención | Control |
|-----------|------------------|-----------|---------|
| **Stripe** | Últimos 4 dígitos, nombre | 7 años | Contrato DPA |
| **AWS** | Datos encriptados | Mientras activa | Encriptación + delete scheduled |
| **Firebase** | Eventos anonimizados | 2 años | No identificable |
| **SendGrid** (emails) | Email solo | Mientras activa | Opt-out disponible |

### 8.2 Data Processing Agreements (DPA)

Todos los terceros deben firmar DPA que incluya:
- ✅ Solo procesar para fines específicos
- ✅ Cumplir GDPR/CCPA
- ✅ Auditoría de seguridad anual
- ✅ Notificación en caso de breach
- ✅ Eliminación de datos en solicitud

---

## 9. AUDITORÍA Y REPORTE

### 9.1 Dashboard de Retención

Crear dashboard para monitorear:
- Datos retenidos por tipo
- Eliminaciones programadas
- Cumplimiento de políticas
- Violaciones de retención

```javascript
async function getRetentionMetrics() {
  return {
    totalUsers: await User.countDocuments(),
    deletedUsers: await User.countDocuments({ isDeleted: true }),
    dormantUsers: await User.countDocuments({ isDormant: true }),
    messages: await Message.countDocuments(),
    accessLogs: await AccessLog.countDocuments(),
    auditLogs: await AuditLog.countDocuments(),
    totalDataSize: await calculateDatabaseSize(),
    nextScheduledDeletion: getNextCronJob(),
  };
}
```

### 9.2 Reporte Anual de Privacidad

Publicar anualmente datos sobre:
- Cuántos usuarios eliminaron sus datos
- Cuántos data exports se entregaron
- Cuántos reportes de abuso procesamos
- Cuántos banned users por violaciones
- GDPR requests atendidos

---

## 10. CAMBIOS A POLÍTICA

### 10.1 Notificación de Cambios

Si modificamos esta política de forma que **reduce** retención:
- Notificación por email a usuarios
- Cambio toma efecto después 30 días
- Los usuarios pueden optar por exportar datos
- No afecta datos ya eliminados

Si modificamos retención para **aumentar**:
- Requiere consentimiento explícito
- Email con opción de opt-out
- Explicar razón legal/comercial

---

## 11. CONTACTO Y APELACIONES

**Para Preguntas sobre Retención:**
privacy@therianthrope-dating.com

**Para Solicitudes GDPR:**
- Envía a: dpo@therianthrope-dating.com
- Incluye: nombre, email, tipo de solicitud
- Respuesta garantizada en 30 días

**Para Reportes a Reguladores:**
- Autoridad de protección de datos de tu país
- Adjunta copia de tu solicitud y nuestra respuesta si resulta insatisfecha

---

**Última revisión: Abril 5, 2026**
**Próxima revisión: Abril 5, 2027**
