import 'dotenv/config';

export default {
  expo: {
    name: "eartalk",
    slug: "eartalk",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.chosun.eartalk", // iOS Bundle Identifier 설정
      buildNumber: "2", // iOS Build Number 설정
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription: "앱에서 마이크를 사용하여 음성 인식을 합니다.",
      },
    },
    android: {
      package: "com.chosun.eartalk", // Android 패키지 이름
      versionCode: 2, // Android 버전 코드
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["RECORD_AUDIO"],
      useBridgeless: false,
    },
    platforms: ["ios", "android"],
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || "https://eartalk.site:17004",
      eas: {
        projectId: "a5c651d4-1f8d-410a-b604-14eede9c4388", // EAS 프로젝트 ID
      },
    },
  },
};
