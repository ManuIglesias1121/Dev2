// Filtro de contenido agresivo / acoso
// Lista expandible de patrones. Por privacidad NO se logan los matches específicos,
// solo se registra que un mensaje fue flageado.

const HATE_PATTERNS = [
  // Slurs y discriminación (lista base, ampliable)
  /\b(maric[oó]n|trav[ae]|tort[ai]|put[ao]|tarad[ao])\b/i,
  /\b(negr[ao]\s+de\s+m)/i,
  /\b(nazi|fascist[ao])\b/i,
];

const THREAT_PATTERNS = [
  /\b(te\s+(voy|vamos)\s+a\s+(matar|cag[ao]r|romper|reventar))\b/i,
  /\b((te|los|las)\s+mato)\b/i,
  /\b(amenaz[ao])\b/i,
  /\b(viol[ao]r(?:te)?|abus[ao]r(?:te)?)\b/i,
];

const SEXUAL_HARASSMENT_PATTERNS = [
  /\b(mand[áa]me?\s+(?:una\s+)?(?:foto|nudes|pack|tetas|culo|verga|pija))\b/i,
  /\b(quiero\s+(?:cojer|coger|garchar|fol[lr]ar)(?:te)?)\b/i,
  /\b(?:dale\s+)?(?:bol[uo]da|gil|estúpid[ao]|pelotud[ao])\b/i,
];

const SCAM_PATTERNS = [
  /\b(transferi(?:me|s)|envi[ao]me|mand[áa]me)\s+(?:plata|dinero|pesos|d[oó]lares|usdt|btc|crypto)/i,
  /\b(necesito|me\s+pas[áa]s)\s+(?:plata|guita|dinero|d[oó]lares)/i,
  /\b(cbu|alias\s+mp|mercado\s*pago|binance|usdt)\b/i,
];

const DOXXING_PATTERNS = [
  /\bdir(?:ecci[óo]n)?\s+(?:de|donde\s+(?:viv[íi]s|trabaj[áa]s))/i,
  /\b(?:dame|pas[áa]me)\s+tu\s+(?:tel|n[úu]mero|whats|insta|face|domicilio)/i,
];

const ALL_FILTERS = [
  { type: "hate", patterns: HATE_PATTERNS, severity: "high" },
  { type: "threat", patterns: THREAT_PATTERNS, severity: "critical" },
  { type: "sexual_harassment", patterns: SEXUAL_HARASSMENT_PATTERNS, severity: "high" },
  { type: "scam", patterns: SCAM_PATTERNS, severity: "high" },
  { type: "doxxing", patterns: DOXXING_PATTERNS, severity: "medium" },
];

// Analiza un mensaje y devuelve { flagged, type, severity } o null
export function analyzeMessage(text) {
  if (!text || typeof text !== "string") return null;

  for (const filter of ALL_FILTERS) {
    for (const pattern of filter.patterns) {
      if (pattern.test(text)) {
        return {
          flagged: true,
          type: filter.type,
          severity: filter.severity,
        };
      }
    }
  }
  return null;
}

// Mensajes de advertencia por tipo
export const WARNING_MESSAGES = {
  hate: {
    title: "Lenguaje discriminatorio detectado",
    body: "Tu mensaje contiene términos que podrían ser ofensivos o discriminatorios. La discriminación por theriotype, género, orientación o identidad está prohibida en TherianMatch.",
  },
  threat: {
    title: "Posible amenaza detectada",
    body: "Tu mensaje contiene lenguaje que puede interpretarse como amenaza. Las amenazas son delito penal y pueden ser denunciadas a la justicia.",
  },
  sexual_harassment: {
    title: "Contenido sexual no solicitado",
    body: "Tu mensaje contiene contenido sexual explícito o solicitudes que pueden constituir acoso. Solo enviá este tipo de mensajes con consentimiento explícito previo.",
  },
  scam: {
    title: "Posible solicitud de dinero",
    body: "Tu mensaje parece pedir dinero o transferencias. Los pedidos de plata son una forma común de estafa y están prohibidos en la App.",
  },
  doxxing: {
    title: "Posible solicitud de información personal",
    body: "Tu mensaje pide datos personales (dirección, teléfono, redes). Por seguridad, no compartas información personal hasta conocer bien a la persona.",
  },
};

// Período de cool-down según número de strikes (en horas)
export function getCooldownHours(strikeCount) {
  if (strikeCount === 1) return 1;
  if (strikeCount === 2) return 24;
  return -1; // -1 = bloqueo permanente del chat
}

// Mensaje de cool-down al usuario
export function getCooldownMessage(strikeCount) {
  if (strikeCount === 1) {
    return "Por la advertencia anterior, no podés enviar más mensajes en este chat por 1 hora.";
  }
  if (strikeCount === 2) {
    return "Segunda advertencia. No podés enviar mensajes en este chat por 24 horas. Una violación más resultará en bloqueo permanente.";
  }
  return "Bloqueo permanente del chat por reincidencia en violaciones de términos. Si creés que es un error, contactá soporte.";
}
