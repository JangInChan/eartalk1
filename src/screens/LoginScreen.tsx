//로그인 실패 뜸 고쳐야함.

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { config } from '../config';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/login/access-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,  // 로그인 API에서 email을 username으로 처리할 수 있음
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('로그인 실패:', data);
        Alert.alert('로그인 실패', JSON.stringify(data.detail));
        return;
      }

      // 로그인 성공 시 받은 access token 처리
      const token = data.access_token;
      console.log('로그인 성공, 토큰:', token);

      // 토큰을 로컬 스토리지나 상태 관리 시스템에 저장
      // 예: AsyncStorage에 저장
      // await AsyncStorage.setItem('access_token', token);

      Alert.alert('로그인 성공', '로그인에 성공했습니다!');
      navigation.navigate('Home');  // 로그인 후 홈 화면으로 이동

    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('오류', '로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        placeholder="이메일"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="로그인" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default LoginScreen;
