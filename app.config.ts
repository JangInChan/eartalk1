import 'dotenv/config';

export default {
  expo: {
    name: "eartalk",
    slug: "eartalk",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription: "앱에서 마이크를 사용하여 음성 인식을 합니다." 
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: ["RECORD_AUDIO"], 
      useBridgeless: false
    },
    platforms: ["ios", "android"], 
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || "https://eartalk.site:17004"
    },
    "experimental": {
      "useBridgeless": false 
    }
  }
};
