// Pagos en modo demo — sin RevenueCat nativo

export async function initPayments() {}

export async function getOfferings() {
  return null;
}

export async function purchasePackage() {
  return { success: false, error: "Pagos no configurados aún." };
}

export async function restorePurchases() {
  return null;
}

export async function getCustomerInfo() {
  return null;
}

export function mapEntitlementToPlan() {
  return "free";
}
