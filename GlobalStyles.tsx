import { StyleSheet } from 'react-native';

const GlobalStyles = StyleSheet.create({
  // Body 스타일
  body: {
    margin: 0,
    fontFamily:
      'Apple System, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },

  // Code 스타일
  code: {
    fontFamily:
      'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
  },

  // App 컨테이너
  app: {
    textAlign: 'center',
  },

  // 로고 스타일 (height는 고정된 값으로 수정)
  appLogo: {
    height: 150, // React Native에서는 고정된 값으로 설정
  },

  // 헤더 스타일
  appHeader: {
    backgroundColor: '#282c34',
    minHeight: '100%', // React Native에서는 %로 높이를 설정할 수 있음
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20, // React Native는 calc()를 지원하지 않으므로 고정 값으로 변경
    color: 'white',
  },

  // 링크 스타일
  appLink: {
    color: '#61dafb',
  },

  // 'KCC-Hanbit' 폰트 설정
  bodyFont: {
    fontFamily: 'KCC-Hanbit', // React Native에서 폰트를 올바르게 설정했는지 확인 필요
  },

  // 애니메이션을 위해 Animated API 사용 (React Native에서 회전 애니메이션 구현)
  appLogoSpin: {
    // 애니메이션 관련 스타일은 Animated API에서 처리해야 함
    transform: [{ rotate: '0deg' }],
  },
});

export default GlobalStyles;
