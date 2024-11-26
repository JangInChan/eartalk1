import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import { useFonts } from 'expo-font'; // expo-font 사용

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [soundUri, setSoundUri] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null); // 동적으로 설정될 토큰

  // 폰트 로딩
  const [fontsLoaded] = useFonts({
    'KCC-Hanbit': require('../assets/font/KCC-Hanbit.ttf'),
  });

  useEffect(() => {
    const loadTokenAndCheckLoginStatus = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        setApiToken(token); // 토큰 저장
      }
    };

    loadTokenAndCheckLoginStatus();

    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>폰트를 로딩 중...</Text>
      </View>
    );
  }

  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
      setTimeout(() => setStatus(''), 2000); 
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setStatus('녹음 종료 중...');
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      if (uri) {
        console.log('녹음 파일 경로:', uri);
        await uploadAudio(uri);
        setStatus('녹음 완료 및 업로드 중...');
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    } finally {
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const speakText = () => {
    if (text.trim()) {
      try {
        setStatus('텍스트 음성 변환 중...');
        Speech.speak(text, {
          onDone: () => setTimeout(() => setStatus(''), 2000),
        });
      } catch (error) {
        console.error('음성 변환 중 오류 발생:', error);
        setStatus('텍스트 음성 변환 실패');
      }
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };  

  const uploadAudio = async (uri: string) => {
    try {
      if (!apiToken) {
        Alert.alert('토큰 없음', '로그인 후 다시 시도해주세요.');
        return;
      }

      setStatus('파일 업로드 중...');
      const formData = new FormData();

      formData.append('audio', {
        uri: uri,
        name: 'recording.wav',
        type: 'audio/wav',
      });

      const response = await fetch(`${config.API_BASE_URL}/api/audio`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        console.error('백엔드 응답:', errorResponse);
        Alert.alert('오류', `API 요청 실패: ${response.status} - ${errorResponse}`);
        return;
      }

      const data = await response.json();
      setText(data.text);
      setSoundUri(data.audioUrl);
      setStatus('파일 업로드 완료');
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setStatus('파일 업로드 실패');
    } finally {
      setTimeout(() => setStatus(''), 2000); 
    }
  };

  const playAudio = async () => {
    if (!soundUri) {
      Alert.alert('오디오 없음', '재생할 오디오 파일이 없습니다.');
      return;
    }

    try {
      setStatus('오디오 재생 중...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUri },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      setStatus('오디오 재생 실패');
    } finally {
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="여기에 텍스트를 입력하세요"
                style={[
                  styles.textInput,
                  {
                    height: screenHeight * 0.5,
                    width: screenWidth * 0.9,
                    opacity: isLoggedIn ? 1 : 0.5,
                  },
                ]}
                editable={isLoggedIn}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={() => {
                  if (!isLoggedIn) {
                    Alert.alert(
                      '로그인 필요',
                      '텍스트 입력은 로그인 후에 가능합니다.'
                    );
                  }
                }}
              />
              <View style={styles.buttonsContainer}>
                <Button
                  title="음성 녹음 시작"
                  onPress={startRecording}
                  disabled={isRecording}
                />
                <Button
                  title="음성 녹음 종료"
                  onPress={stopRecording}
                  disabled={!isRecording}
                />
                <Button title="텍스트 읽기" onPress={speakText} />
                <Button title="오디오 재생" onPress={playAudio} disabled={!soundUri} />
              </View>
              <Text style={styles.status}>{status}</Text>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  textInput: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    fontFamily: 'KCC-Hanbit',
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
    fontFamily: 'KCC-Hanbit',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'gray',
    fontFamily: 'KCC-Hanbit',
  },
});

export default App;
