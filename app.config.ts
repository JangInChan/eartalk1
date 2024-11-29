import 'dotenv/config';

export default {
  name: "eartalk", // 앱 이름
  slug: "eartalk", // 프로젝트 고유 식별자
  version: "1.0.1", // 앱 버전
  orientation: "portrait", // 세로 모드 고정
  icon: "./assets/icon.png", // 앱 아이콘 경로
  userInterfaceStyle: "light", // 라이트 모드 UI
  newArchEnabled: true, // New Architecture 활성화
  splash: {
    image: "./assets/splash-icon.png", // 스플래시 이미지 경로
    resizeMode: "contain", // 스플래시 이미지 리사이즈 모드
    backgroundColor: "#ffffff", // 스플래시 배경 색상
  },
  ios: {
    bundleIdentifier: "com.chosun.eartalk", // iOS 번들 식별자
    buildNumber: "3", // iOS 빌드 넘버
    supportsTablet: true, // 태블릿 지원 여부
    infoPlist: {
      NSMicrophoneUsageDescription: "앱에서 마이크를 사용하여 음성 인식을 합니다.", // 마이크 사용 설명
    },
  },
  android: {
    package: "com.chosun.eartalk", // Android 패키지 이름
    versionCode: 3, // Android 버전 코드
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png", // Android 적응형 아이콘
      backgroundColor: "#ffffff", // 아이콘 배경 색상
    },
    permissions: [
      "RECORD_AUDIO", // 음성 녹음 권한
    ],
    useNextNotificationsApi: true, // 새로운 알림 API 활성화
  },
  platforms: ["ios", "android"], // 지원 플랫폼
  extra: {
    API_BASE_URL: process.env.API_BASE_URL || "https://eartalk.site:17004", // 환경 변수 기본값
    eas: {
      projectId: "a5c651d4-1f8d-410a-b604-14eede9c4388", // EAS 프로젝트 ID
    },
  },
  updates: {
    fallbackToCacheTimeout: 0, // 앱 업데이트 전략 설정
  },
  runtimeVersion: {
    policy: "sdkVersion", // 런타임 버전 정책 설정
  },
  experiments: {
    turboModules: true, // 터보 모듈 활성화
  },
};
