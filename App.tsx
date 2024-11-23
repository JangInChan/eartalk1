import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/App'; // 기존 App 파일에서 메인 화면
import SignUpScreen from './src/screens/SignUpScreen'; // 회원가입 화면
 import LoginScreen from './src/screens/LoginScreen'; // 로그인 화면
import ResetPasswordScreen from './src/screens/UpdatePasswordScreen'; // 비밀번호 찾기 화면 
import { View, Button } from 'react-native';
import UpdatePasswordScreen from './src/screens/UpdatePasswordScreen';

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
                onPress={() =>
                  navigation.navigate('Menu')
                } // 메뉴로 이동
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

        {/* 비밀번호 찾기 */}
        <Stack.Screen
          name="UpdatePassword"
          component={UpdatePasswordScreen}
          options={{ title: '비밀번호 변경' }}
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
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="회원가입" onPress={() => navigation.navigate('SignUp')} />
      <Button title="로그인" onPress={() => navigation.navigate('Login')} />
      <Button title="비밀번호 변경" onPress={() => navigation.navigate('UpdatePassword')} />
    </View>
  );
};

export default App;
