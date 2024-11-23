import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { config } from '../config';
import axios from 'axios';

const ResetPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/reset-password/${email}`);

      if (response.status === 200) {
        Alert.alert('비밀번호 변경 요청', '임시 비밀번호가 이메일로 발송되었습니다.');
        navigation.navigate('Login');  // 비밀번호 찾기 후 로그인 화면으로 이동
      } else {
        Alert.alert('오류', '비밀번호 재설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error);
      Alert.alert('오류', '비밀번호 찾기 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="가입한 이메일 입력"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Button title="비밀번호 재설정" onPress={handleResetPassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default ResetPasswordScreen;
