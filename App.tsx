import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/App'; // 기존 App 파일에서 메인 화면
import SignUpScreen from './src/screens/SignUpScreen'; // 회원가입 화면
import LoginScreen from './src/screens/LoginScreen'; // 로그인 화면
import UpdatePasswordScreen from './src/screens/UpdatePasswordScreen'; // 비밀번호 변경 화면
import ResetPasswordScreen from './src/screens/ResetPasswordScreen'; // 비밀번호 찾기 화면
import UserInfoScreen from './src/screens/UserInfoScreen'; // 내 정보 화면

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* 메인 화면 */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: '메인 화면',
            headerRight: () => (
              <Button
                title="메뉴"
                onPress={() => navigation.navigate('Menu')} // 메뉴로 이동
              />
            ),
          })}
        />

        {/* 회원가입 */}
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: '회원가입' }}
        />

        {/* 로그인 */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: '로그인' }}
        />

        {/* 비밀번호 변경 */}
        <Stack.Screen
          name="UpdatePassword"
          component={UpdatePasswordScreen}
          options={{ title: '비밀번호 변경' }}
        />

        {/* 내 정보 화면 */}
        <Stack.Screen
          name="UserInfo"
          component={UserInfoScreen}
          options={{title: '내 정보'}}
        />

        {/* 비밀번호 찾기 화면 */}
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{title: '비밀번호 찾기'}}
        />

        {/* 메뉴 화면 */}
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ title: '메뉴' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// 메뉴 화면 정의
const MenuScreen = ({ navigation }: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인 함수
  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      setIsLoggedIn(!!token); // 토큰이 있으면 로그인 상태
    } catch (error) {
      console.error('로그인 상태 확인 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []); // 컴포넌트가 처음 렌더링될 때 로그인 상태 확인

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      setIsLoggedIn(false); // 로그아웃 후 로그인 상태 업데이트
      Alert.alert('로그아웃', '로그아웃 되었습니다.');
      navigation.navigate('Login'); // 로그인 화면으로 이동
    } catch (error) {
      console.error('로그아웃 오류:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isLoggedIn ? (
        <>
          <Button title="내 정보" onPress={() => navigation.navigate('UserInfo')} />
          <Button title="비밀번호 변경" onPress={() => navigation.navigate('UpdatePassword')} />
          <Button title="로그아웃" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Button title="회원가입" onPress={() => navigation.navigate('SignUp')} />
          <Button title="로그인" onPress={() => navigation.navigate('Login')} />
          <Button title="비밀번호 찾기" onPress={() => navigation.navigate('ResetPassword')} />
        </>
      )}
    </View>
  );
};

export default App;
