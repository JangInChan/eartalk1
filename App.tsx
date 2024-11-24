import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import HomeScreen from './src/App';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import UpdatePasswordScreen from './src/screens/UpdatePasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import DeleteAccountScreen from './src/screens/DeleteAccountScreen';
import RecordingListScreen from './src/screens/RecordingListScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';

const Stack = createStackNavigator();

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'KCC-Hanbit': require('./assets/font/KCC-Hanbit.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error('폰트 로딩 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.loadingText}>폰트를 로딩 중...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: '메인 화면',
            headerLeft: () => null,
            headerRight: () => (
              <Button
                title="메뉴"
                onPress={() => navigation.navigate('Menu')}
              />
            ),
          })}
        />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '회원가입' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: '로그인' }} />
        <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} options={{ title: '비밀번호 변경' }} />
        <Stack.Screen name="UserInfo" component={UserInfoScreen} options={{ title: '내 정보' }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: '비밀번호 찾기' }} />
        <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: '회원탈퇴' }} />
        <Stack.Screen name="RecordingList" component={RecordingListScreen} options={{ title: '녹음 기록' }} />
        <Stack.Screen name="Menu" component={MenuScreen} options={{ title: '메뉴' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MenuScreen = ({ navigation }: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('로그인 상태 확인 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      setIsLoggedIn(false);
      Alert.alert('로그아웃', '로그아웃 되었습니다.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
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
          <Button title="녹음 기록" onPress={() => navigation.navigate('RecordingList')} />
          <Button title="비밀번호 변경" onPress={() => navigation.navigate('UpdatePassword')} />
          <Button title="회원탈퇴" onPress={() => navigation.navigate('DeleteAccount')} />
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

const styles = StyleSheet.create({
  loadingText: {
    fontFamily: 'KCC-Hanbit',
    fontSize: 20,
    color: 'black',
  },
  text: {
    fontFamily: 'KCC-Hanbit',
  },
});

export { styles };
export default App;
