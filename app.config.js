export default {
  expo: {
    name: "TherianMatchConnect",
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
      supportsTablet: true,
      bundleIdentifier: "com.manuiglesias.therianmatchconnect"
    },

    android: {
      package: "com.manuiglesias.therianmatchconnect",
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.CAMERA",
      ],
    },

    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "TherianMatchConnect necesita acceso a tu galería para cambiar tu foto de perfil.",
          cameraPermission: "TherianMatchConnect necesita acceso a tu cámara.",
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "TherianMatchConnect usa tu ubicación para mostrarte perfiles cercanos."
        }
      ]
    ],

    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      output: "single",
      name: "TherianMatchConnect",
      shortName: "TherianMatchConnect",
      description: "Encuentra tu manada",
      themeColor: "#22c55e",
      backgroundColor: "#000000",
      display: "standalone",
      orientation: "portrait",
      lang: "es",
    },

    // Plugin de AdMob — descomentar al hacer EAS Build con react-native-google-mobile-ads instalado
    // plugins: [
    //   ["react-native-google-mobile-ads", {
    //     androidAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    //     iosAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    //   }]
    // ],

    extra: {
      eas: {
        projectId: "0062dc03-d32e-4eb2-9678-295e8a01e762"
      }
    }
  }
};
