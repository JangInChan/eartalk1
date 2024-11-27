import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import { useFonts } from 'expo-font';
import { MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [soundUri, setSoundUri] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'KCC-Hanbit': require('../assets/font/KCC-Hanbit.ttf'),
  });

  useEffect(() => {
    const loadTokenAndCheckLoginStatus = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        setApiToken(token);
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

  const copyText = () => {
    Alert.alert('복사 완료', '텍스트가 복사되었습니다.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          {/* 메뉴 버튼 */}
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="menu" size={30} color="black" />
          </TouchableOpacity>

          {/* 텍스트 입력 영역 */}
          <View style={styles.textInputContainer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="여기에 텍스트를 입력하세요"
              style={styles.textInput}
              editable={isLoggedIn}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.iconButton, styles.speakerButton]}
                onPress={speakText}
              >
                <Feather name="volume-2" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.copyButton]}
                onPress={copyText}
              >
                <Feather name="copy" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 녹음 버튼 영역 */}
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[
                styles.recordingButton,
                isRecording && styles.recordingButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <MaterialCommunityIcons
                name={isRecording ? 'microphone-off' : 'microphone'}
                size={80}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.status}>{status}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  menuLine: {
    width: 30,
    height: 3,
    backgroundColor: '#000',
    marginVertical: 3,
  },
  textInputContainer: {
    flex: 6,
    backgroundColor: '#E7E7E7',
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'FFFFFF',
    borderRadius: 10,
    padding: 10,
    color: '#000',
    fontSize: 16,
    fontFamily: 'KCC-Hanbit',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  iconButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#DDD',
  },
  speakerButton: {
    marginRight: 10,
  },
  copyButton: {},
  buttonText: {
    fontSize: 18,
    color: '000',
  },
  recordingContainer: {
    flex: 4,
    backgroundColor: '#FFE400',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recordingButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE400',
    borderRadius: 50,
    width: 80,
    height: 80,
  },
  recordingButtonActive: {
    backgroundColor: '#FF6347',
  },
  recordingText: {
    color: '#FFF',
    fontSize: 24,
  },
  status: {
    fontFamily: 'KCC-Hanbit',
    fontSize: 16,
    marginTop: 10,
    color: 'gray',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'f5f5f5',
  },
  loadingText: {
    fontFamily: 'KCC-Hanbit',
    fontSize: 16,
    color: '#555',
  },
});

export default App;


/* import React, { useState, useEffect } from 'react';
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
 */