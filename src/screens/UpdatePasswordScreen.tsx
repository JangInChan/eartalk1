import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { config } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UpdatePasswordScreen = ({ navigation }: any) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyNewPassword, setVerifyNewPassword] = useState('');  // verifyNewPassword 상태 추가

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !verifyNewPassword) {
      Alert.alert('오류', '모든 필드를 입력하세요.');
      return;
    }

    if (newPassword !== verifyNewPassword) {
      Alert.alert('오류', '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('오류', '인증되지 않았습니다. 로그인 해주세요.');
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/api/users/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // 인증 토큰을 헤더에 추가
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
          verify_new_password: verifyNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('비밀번호 변경 실패:', data);
        Alert.alert('비밀번호 변경 실패', data.detail || '알 수 없는 오류가 발생했습니다.');
        return;
      }

      Alert.alert('비밀번호 변경 성공', '비밀번호가 성공적으로 변경되었습니다.');
      navigation.goBack();  // 비밀번호 변경 후 이전 화면으로 돌아감

    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      Alert.alert('오류', '비밀번호 변경 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 변경</Text>
      <TextInput
        placeholder="현재 비밀번호"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="새 비밀번호"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="새 비밀번호 확인"
        secureTextEntry
        value={verifyNewPassword}
        onChangeText={setVerifyNewPassword}
        style={styles.input}
      />
      <Button title="비밀번호 변경" onPress={handlePasswordChange} />
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
    fontFamily: 'KCC-Hanbit',
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

export default UpdatePasswordScreen;
