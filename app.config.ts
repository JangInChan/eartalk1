import 'dotenv/config';  // dotenv 라이브러리로 .env 파일을 불러옵니다.

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
        NSMicrophoneUsageDescription: "앱에서 마이크를 사용하여 음성 인식을 합니다."  // iOS에서 마이크 권한 요청
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: ["RECORD_AUDIO"],  // Android에서 마이크 권한 요청
      useBridgeless: false  // Bridgeless 모드 비활성화
    },
    platforms: ["ios", "android"],  // "web" 제거 (웹을 사용하지 않을 경우)
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || "https://eartalk.site:17004"  // .env 파일에서 불러오기
    },
    "experimental": {
      "useBridgeless": false  // 이 부분을 추가해 보세요
    }
  }
};
