import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

const DeleteAccountScreen = ({ navigation }: { navigation: any }) => {
  const deleteAccount = async () => {
    try {
      Alert.alert(
        '회원 탈퇴',
        '정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            style: 'destructive',
            onPress: async () => {
              const token = await AsyncStorage.getItem('access_token');
              if (!token) {
                Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인해주세요.');
                return;
              }

              // DELETE API 요청
              const response = await fetch(`${config.API_BASE_URL}/api/users/me`, {
                method: 'DELETE',
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                // 탈퇴 성공 처리
                Alert.alert('탈퇴 완료', '회원 탈퇴가 완료되었습니다.');
                await AsyncStorage.clear(); // 모든 로그인 정보 제거
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              } else {
                const errorText = await response.text();
                console.error('탈퇴 실패:', response.status, errorText);
                Alert.alert('오류', '회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('회원 탈퇴 요청 중 오류 발생:', error);
      Alert.alert('오류', '회원 탈퇴 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.warningText}>
        회원 탈퇴를 진행하면 모든 데이터가 삭제되며 복구할 수 없습니다.
      </Text>
      <Button title="회원 탈퇴" onPress={deleteAccount} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  warningText: {
    fontFamily: 'KCC-Hanbit',
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default DeleteAccountScreen;
