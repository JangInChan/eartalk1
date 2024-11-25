import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

const RecordingListScreen = () => {
  const [recordings, setRecordings] = useState([]); // 녹음 기록 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  // 녹음 기록 로드 함수
  const fetchRecordings = async () => {
    try {
      setLoading(true); // 로딩 시작
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('로그인 필요', '로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/api/users/me/audios`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`, // 동적으로 토큰 사용
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        console.error('응답:', errorText);
        Alert.alert('오류', `녹음 기록을 불러올 수 없습니다: ${response.statusText}`);
        setRecordings([]);
        return;
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data); // 응답 데이터 확인

      if (data.count > 0) {
        setRecordings(data.data); // 녹음 기록 상태에 저장 (data 배열에 접근)
      } else {
        setRecordings([]); // 녹음 기록이 없으면 빈 배열로 처리
        Alert.alert('정보', '녹음 기록이 없습니다.');
      }
    } catch (error) {
      console.error('녹음 기록 로드 실패:', error);
      Alert.alert('오류', '녹음 기록을 불러오는 중 문제가 발생했습니다.');
      setRecordings([]);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    fetchRecordings(); // 컴포넌트가 마운트될 때 녹음 기록 로드
  }, []);

  const renderRecordingItem = ({ item }: { item: any }) => (
    <View style={styles.recordingItem}>
      <Text style={styles.recordingText}>ID: {item.id}</Text>
      <Text style={styles.recordingText}>텍스트: {item.text}</Text>
      <Text style={styles.recordingText}>원본 파일 경로: {item.original_filepath}</Text>
      <Text style={styles.recordingText}>처리된 파일 경로: {item.processed_filepath}</Text>
      {/* 여기에 업로드 시간 추가 시각화 (optional) */}
      <Text style={styles.recordingText}>업로드 시간: {new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>로딩 중...</Text>
      ) : recordings.length > 0 ? (
        <FlatList
          data={recordings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecordingItem}
        />
      ) : (
        <Text style={styles.emptyText}>녹음 기록이 없습니다.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontFamily: 'KCC-Hanbit',
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
  },
  emptyText: {
    fontFamily: 'KCC-Hanbit',
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
  },
  recordingItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  recordingText: {
    fontFamily: 'KCC-Hanbit',
    fontSize: 14,
    marginVertical: 2,
  },
});

export default RecordingListScreen;
