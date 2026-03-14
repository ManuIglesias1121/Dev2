export default {
  expo: {
    name: "therianmatch",
    slug: "therianmatch",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true
    },

    android: {
      package: "com.manuiglesias.therianmatch"
    },

    web: {
      favicon: "./assets/favicon.png"
    },

    extra: {
      eas: {
        projectId: "0062dc03-d32e-4eb2-9678-295e8a01e762"
      }
    }
  }
};
