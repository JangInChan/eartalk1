import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import { config } from '../config';

const SignUpScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState<string | null>(null);
  const [sex, setSex] = useState<string | null>(null);
  const [isBirthYearModalVisible, setBirthYearModalVisible] = useState(false);
  const [isSexModalVisible, setSexModalVisible] = useState(false);

  // 출생 연도 옵션 생성
  const currentYear = new Date().getFullYear();
  const birthYearOptions = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
  const sexOptions = ['남성', '여성'];

  const handleSignUp = async () => {
    if (password !== verifyPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    const sexValue = sex === '남성' ? true : false;

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          verify_password: verifyPassword,
          email,
          birthyear: birthYear,
          sex: sexValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('회원가입 실패:', errorData);
        Alert.alert('회원가입 실패', JSON.stringify(errorData.detail));
        return;
      }

      Alert.alert('회원가입 성공', '계정이 생성되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.error('회원가입 오류:', error);
      Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <TextInput
        placeholder="아이디"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호 확인"
        secureTextEntry
        value={verifyPassword}
        onChangeText={setVerifyPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="이메일"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* 출생 연도 선택 */}
      <TouchableOpacity
        onPress={() => setBirthYearModalVisible(true)}
        style={styles.selector}
      >
        <Text style={styles.selectorText}>
          {birthYear ? birthYear : '출생 연도 선택'}
        </Text>
      </TouchableOpacity>

      {/* 성별 선택 */}
      <TouchableOpacity
        onPress={() => setSexModalVisible(true)}
        style={styles.selector}
      >
        <Text style={styles.selectorText}>
          {sex ? sex : '성별 선택'}
        </Text>
      </TouchableOpacity>

      <Button title="회원가입" onPress={handleSignUp} />

      {/* 출생 연도 모달 */}
      <Modal
        visible={isBirthYearModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBirthYearModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={birthYearOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setBirthYear(item);
                    setBirthYearModalVisible(false);
                  }}
                  style={styles.modalItem}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="닫기" onPress={() => setBirthYearModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* 성별 모달 */}
      <Modal
        visible={isSexModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSexModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={sexOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSex(item);
                    setSexModalVisible(false);
                  }}
                  style={styles.modalItem}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="닫기" onPress={() => setSexModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  selectorText: {
    fontFamily: 'KCC-Hanbit',
    fontSize: 16,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // 하단에 위치
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    maxHeight: '50%',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});

export default SignUpScreen;
