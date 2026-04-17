import { Platform } from "react-native";

// Configura estas claves desde https://app.revenuecat.com
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

let Purchases = null;
let initialized = false;

async function getPurchases() {
  if (Purchases) return Purchases;
  try {
    const mod = await import("react-native-purchases");
    Purchases = mod.default;
    return Purchases;
  } catch {
    return null;
  }
}

export async function initPayments(userId) {
  if (initialized) return;
  const P = await getPurchases();
  if (!P) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  if (!apiKey) {
    console.warn("[Payments] RevenueCat API key not configured. Add EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY to .env");
    return;
  }

  try {
    await P.configure({ apiKey });
    if (userId) await P.logIn(userId);
    initialized = true;
  } catch (e) {
    console.warn("[Payments] Init error:", e);
  }
}

export async function getOfferings() {
  const P = await getPurchases();
  if (!P) return null;
  try {
    return await P.getOfferings();
  } catch {
    return null;
  }
}

export async function purchasePackage(packageToPurchase) {
  const P = await getPurchases();
  if (!P) return { success: false, error: "RevenueCat no disponible" };
  try {
    const { customerInfo } = await P.purchasePackage(packageToPurchase);
    return { success: true, customerInfo };
  } catch (e) {
    if (e.userCancelled) return { success: false, cancelled: true };
    return { success: false, error: e.message };
  }
}

export async function restorePurchases() {
  const P = await getPurchases();
  if (!P) return null;
  try {
    return await P.restorePurchases();
  } catch {
    return null;
  }
}

export async function getCustomerInfo() {
  const P = await getPurchases();
  if (!P) return null;
  try {
    return await P.getCustomerInfo();
  } catch {
    return null;
  }
}

export function mapEntitlementToPlan(customerInfo) {
  if (!customerInfo?.entitlements?.active) return "free";
  const active = customerInfo.entitlements.active;
  if (active["elite"]) return "anual";
  if (active["depredador"]) return "trimestral";
  if (active["cazador"]) return "mensual";
  return "free";
}
