import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [soundUri, setSoundUri] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkLoginStatus();

    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  const startRecording = async () => {
    if (isLoggedIn) {
      Alert.alert('로그인 상태에서는 텍스트 입력이 가능합니다.');
    }

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
    }
  };

  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text);
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };

  const uploadAudio = async (uri: string) => {
    try {
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
          Authorization: `Bearer ${config.API_TOKEN}`,
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
    }
  };

  const playAudio = async () => {
    if (!soundUri) {
      Alert.alert('오디오 없음', '재생할 오디오 파일이 없습니다.');
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUri },
        { shouldPlay: true }
      );
      await sound.playAsync();
      setStatus('오디오 재생 중...');
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      setStatus('오디오 재생 실패');
    }
  };

  // 키보드 숨기기 함수
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // 화면 크기 가져오기
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // iOS에서 키보드 처리
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}> 
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="여기에 텍스트를 입력하세요"
                style={[styles.textInput, { height: screenHeight * 0.5, width: screenWidth * 0.9, opacity: isLoggedIn ? 1 : 0.5 }]}  // 화면 높이 50%, 너비 90%로 설정
                editable={isLoggedIn}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.buttonsContainer}>
                <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
                <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
});

export default App;

//잘 작동 음성파일 텍스트 변환기능 X
/* import React, { useState, useEffect } from 'react'; 
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { config } from './config'; // config 파일에서 import

const App = () => {
  const [text, setText] = useState(''); // 텍스트 입력
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null); // 재생될 오디오 상태

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
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
        await uploadAudio(uri); // 서버로 음성 파일 업로드
        setStatus('녹음 완료 및 업로드 중...');
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    }
  };

  // 텍스트 음성 출력
  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text); 
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };

  const uploadAudio = async (uri: string) => {
    try {
      setStatus('파일 업로드 중...');
      const formData = new FormData();
  
      formData.append('audio', {
        uri: uri, // 파일 URI
        name: 'recording.wav', // 파일 이름
        type: 'audio/wav', // 파일의 MIME 타입
      });
  
      const response = await fetch(`${config.API_BASE_URL}/api/audio`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${config.API_TOKEN}`, // 필요 시 인증 토큰
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
  
      // 서버 응답에서 identifier 값을 받아와서 상태 설정
      const data = await response.json(); 
      const newIdentifier = data.identifier; // 서버 응답에서 identifier 추출
      setIdentifier(newIdentifier); // identifier 상태 설정
      console.log('받은 identifier:', newIdentifier);
      setStatus('파일 업로드 완료');
  
      await fetchAudioFile(newIdentifier); // 변환된 음성 파일을 바로 받아옴
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setStatus('파일 업로드 실패');
    }
  };

  // 변환된 음성 파일을 가져오기
  const fetchAudioFile = async (identifier: string) => {
    try {
      setStatus('오디오 파일 로딩 중...');
      const response = await fetch(`${config.API_BASE_URL}/api/file/${identifier}`, {
        method: 'GET',
        headers: config.headers,
      });
  
      if (!response.ok) {
        const errorResponse = await response.text(); 
        console.error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        console.error('백엔드 응답:', errorResponse); 
        Alert.alert('오류', `API 요청 실패: ${response.status} - ${errorResponse}`);
        throw new Error(`API 요청 실패: ${response.status}`);
      }
  
      // URL을 직접 재생에 사용
      const fileUrl = `${config.API_BASE_URL}/api/file/${identifier}`;
      await playAudio(fileUrl);
      
    } catch (error) {
      console.error('오디오 파일 로딩 실패:', error);
      setStatus('오디오 파일 로딩 실패');
    }
  };

  // 오디오 재생
  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      setSound(sound); // 음성 재생 상태 저장
      await sound.playAsync();
      setStatus('오디오 재생 중...');
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      setStatus('오디오 재생 실패');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
        <Button title="텍스트 읽기" onPress={speakText} />
        <Button title="오디오 재생" onPress={() => sound?.playAsync()} disabled={!sound} />
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
});

export default App; */


/* import React, { useState, useEffect } from 'react'; 
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { config } from './config'; // config 파일에서 import

const App = () => {
  const [text, setText] = useState(''); // 텍스트 입력
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null); // 재생될 오디오 상태

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
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
        await uploadAudio(uri); // 서버로 음성 파일 업로드
        setStatus('녹음 완료 및 업로드 중...');
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    }
  };

  // 텍스트 음성 출력
  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text); 
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };

  const uploadAudio = async (uri: string) => {
    try {
      setStatus('파일 업로드 중...');
      const formData = new FormData();
  
      formData.append('audio', {
        uri: uri, // 파일 URI
        name: 'recording.wav', // 파일 이름
        type: 'audio/wav', // 파일의 MIME 타입
      });
  
      const response = await fetch(`${config.API_BASE_URL}/api/audio`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${config.API_TOKEN}`, // 필요 시 인증 토큰
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
  
      // 응답에서 identifier 값 받기
      const result = await response.json();
      const apiIdentifier = result.identifier; // 응답에서 identifier 값 추출
      setIdentifier(apiIdentifier); // identifier 저장
      console.log('받은 identifier:', apiIdentifier);
      setStatus('파일 업로드 완료');
  
      await fetchAudioFile(apiIdentifier); // 변환된 음성 파일을 바로 받아옴
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setStatus('파일 업로드 실패');
    }
  };

  // 변환된 음성 파일을 가져오기
  const fetchAudioFile = async (identifier: string) => {
    try {
      setStatus('오디오 파일 로딩 중...');
      const response = await fetch(`${config.API_BASE_URL}/api/file/${identifier}`, {
        method: 'GET',
        headers: config.headers,
      });
  
      if (!response.ok) {
        const errorResponse = await response.text(); 
        console.error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        console.error('백엔드 응답:', errorResponse); 
        Alert.alert('오류', `API 요청 실패: ${response.status} - ${errorResponse}`);
        throw new Error(`API 요청 실패: ${response.status}`);
      }
  
      // URL을 직접 재생에 사용
      const fileUrl = `${config.API_BASE_URL}/api/file/${identifier}`;
      await playAudio(fileUrl);
      
    } catch (error) {
      console.error('오디오 파일 로딩 실패:', error);
      setStatus('오디오 파일 로딩 실패');
    }
  };

  // 오디오 재생
  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      setSound(sound); // 음성 재생 상태 저장
      await sound.playAsync();
      setStatus('오디오 재생 중...');
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      setStatus('오디오 재생 실패');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
        <Button title="텍스트 읽기" onPress={speakText} />
        <Button title="오디오 재생" onPress={() => sound?.playAsync()} disabled={!sound} />
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
});

export default App; */


//음성만 받아옴
/* import React, { useState, useEffect } from 'react'; 
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { config } from './config'; // config 파일에서 import

const App = () => {
  const [status, setStatus] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null); // 재생될 오디오 상태

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  // 오디오 재생
  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      setSound(sound); // 음성 재생 상태 저장
      await sound.playAsync();
      setStatus('오디오 재생 중...');
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      setStatus('오디오 재생 실패');
    }
  };

  // 파일 요청 테스트
  const testFetchAudioFile = async () => {
    try {
      const testIdentifier ="06927719-c4c1-4bee-a01e-46d8e7bc1641"; // 원하는 identifier 값 설정
      const response = await fetch(`${config.API_BASE_URL}/api/file/${testIdentifier}`, {
        method: 'GET',
        headers: config.headers, // 필요한 헤더 (API_TOKEN 등)
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        console.error('백엔드 응답:', errorResponse);
        Alert.alert('오류', `API 요청 실패: ${response.status} - ${errorResponse}`);
        return;
      }

      const fileUrl = `${config.API_BASE_URL}/api/file/${testIdentifier}`;
      console.log('파일 URL:', fileUrl);

      // 파일 URL을 확인하고 오디오 재생
      await playAudio(fileUrl); // 음성 파일 재생 테스트

    } catch (error) {
      console.error('오디오 파일 로딩 실패:', error);
      setStatus('오디오 파일 로딩 실패');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Button title="오디오 파일 요청 테스트" onPress={testFetchAudioFile} />
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
});

export default App;  */


//audio/api 로 요청보내는 코드
/* import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { config } from './config';

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
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
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    }
  };

  const uploadAudio = async (uri: string) => {
    try {
      setStatus('파일 업로드 중...');
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('파일 정보:', fileInfo);
  
      if (!fileInfo.exists) {
        console.error('파일이 존재하지 않습니다.');
        Alert.alert('오류', '녹음된 파일을 찾을 수 없습니다.');
        return;
      }
  
      // 파일을 Base64로 변환
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const response = await fetch(`${config.API_BASE_URL}/api/audio`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.API_TOKEN}`,
        },
        body: JSON.stringify({
          audio: base64Audio,
          filename: 'recording.wav',
        }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        console.error('백엔드 응답:', errorResponse);
        Alert.alert('오류', `API 요청 실패: ${response.status}`);
        return;
      }
  
      // 강제로 identifier 설정
      const fixedIdentifier = "4d511127-5eb4-4c09-b177-12a89bfe6557";
      console.log('identifier 강제 설정:', fixedIdentifier);
  
      setStatus('파일 업로드 완료');
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setStatus('파일 업로드 실패');
    }
  };  

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
});

export default App; */


/* import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { config } from './config'; 

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [identifier, setIdentifier] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
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
        await transcribeAudio(uri); // 바로 서버로 업로드
        setStatus('녹음 완료 및 업로드 중...');
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    }
  };

  const transcribeAudio = async (uri: string) => {
    try {
      setStatus('파일 업로드 중...');
      const formData = new FormData();

      formData.append('audio', {
        uri: uri, 
        name: 'recording.m4a', // 파일 이름
        type: 'audio/m4a', // 파일의 MIME 타입
      });

      const formDataAny = formData as any;

      let hasAudio = false;
      for (let pair of formDataAny.entries()) {
        if (pair[0] === 'audio') {
          hasAudio = true;
          break;
        }
      }

      if (!hasAudio) {
        formData.append('audio', '');
      }

      for (let pair of formDataAny.entries()) {
        console.log(pair[0] + ': ' + pair[1]); 
      }

      const response = await fetch(`${config.API_BASE_URL}/api/audio`, {
        method: 'POST',
        headers: config.headers, 
        body: formData,
      });

      if (!response.ok) {
        console.error(`API 요청 실패: ${response.status} - ${response.statusText}`);
        Alert.alert('오류', `API 요청 실패: ${response.status}`);
        return;
      }

      const result = await response.json();
      console.log('API 응답:', result);
      setIdentifier(result.identifier);
      setStatus('변환 요청 완료');
      await fetchTranscriptionResult(result.identifier);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setStatus('파일 업로드 실패');
    }
  };

  const fetchTranscriptionResult = async (identifier: string) => {
    try {
      setStatus('변환 결과 조회 중...');
      const response = await fetch(`${config.API_BASE_URL}/api/audio/${identifier}`, {
        method: 'GET',
        headers: config.headers, 
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('변환 결과:', result);

      if (result.text) {
        setText(result.text);
        setStatus('변환 완료');
      } else {
        setText('변환된 텍스트가 없습니다.');
        setStatus('텍스트 변환 실패');
      }
    } catch (error) {
      console.error('결과 조회 실패:', error);
      setStatus('결과 조회 실패');
    }
  };

  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text);
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
        <Button title="텍스트 읽기" onPress={speakText} />
      </View>
      <Text style={styles.status}>{status}</Text>
      {text && <Text style={styles.transcript}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
  transcript: {
    marginTop: 10,
    fontSize: 18,
    color: 'black',
  },
});

export default App; */


/* import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';  // expo-file-system 추가

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [identifier, setIdentifier] = useState<string | null>(null);  // 식별자 추가
  const API_TOKEN = 'YOUR_API_TOKEN'; // 환경 변수 또는 안전한 저장소에 저장 권장

  // 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
      console.log('녹음 시작');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
    }
  };

  // 음성 녹음 종료
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setStatus('녹음 종료 중...');
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      setStatus('녹음 완료');
      console.log('녹음 파일 경로:', uri);

      if (uri) {
        // 원하는 경로로 파일 복사
        await saveFileToCustomPath(uri);
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    }
  };

  // 파일을 원하는 경로로 복사
  const saveFileToCustomPath = async (uri: string) => {
    try {
      // 사용자 정의 경로
      const customPath = FileSystem.documentDirectory + 'custom_audio/recording.m4a';

      // 폴더가 없다면 생성
      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'custom_audio', {
        intermediates: true,
      });

      // 파일 복사
      await FileSystem.copyAsync({ from: uri, to: customPath });

      console.log('파일 저장 완료:', customPath);
      setStatus(`파일 저장 완료: ${customPath}`);
    } catch (error) {
      console.error('파일 저장 실패:', error);
      setStatus('파일 저장 실패');
    }
  };

  // 오디오 파일 전송 및 텍스트 변환
  const transcribeAudio = async (uri: string) => {
    try {
      setStatus('파일 업로드 중...');
      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'recording.m4a',
        type: 'audio/x-m4a',
      });

      const response = await fetch('https://eartalk.site:17004/api/audio', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('변환 결과', result)
      setIdentifier(result.identifier); // 식별자 저장
      setStatus('변환 요청 완료');
      
      // 변환된 텍스트를 받기 위한 후속 처리
      await fetchTranscriptionResult(result.identifier);
    } catch (error) {
      console.error('오류:', error);
      setText('오류가 발생했습니다. 다시 시도해 주세요.');
      setStatus('파일 업로드 실패');
    }
  };

  // 텍스트 변환 결과 받기
  const fetchTranscriptionResult = async (identifier: string) => {
    try {
      setStatus('변환 결과 조회 중...');
      
      const response = await fetch(`https://eartalk.site:17004/api/audio/${identifier}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.transcript) {
        setText(result.transcript); // 텍스트 설정
        setStatus('변환 완료');
      } else {
        setText('변환된 텍스트가 없습니다.');
        setStatus('텍스트 변환 실패');
      }
    } catch (error) {
      console.error('오류:', error);
      setText('변환 결과를 가져올 수 없습니다.');
      setStatus('결과 조회 실패');
    }
  };

  // 텍스트를 음성으로 변환
  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text);
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
        <Button title="텍스트 읽기" onPress={speakText} />
      </View>
      <Text style={styles.status}>{status}</Text>
      {text && <Text style={styles.transcript}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
  transcript: {
    marginTop: 10,
    fontSize: 18,
    color: 'black',
  },
});

export default App; */


/* import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const [identifier, setIdentifier] = useState<string | null>(null);  // 식별자 추가
  const [fileData, setFileData] = useState<any>(null);  // 파일 데이터 상태 추가
  const API_TOKEN = 'YOUR_API_TOKEN'; // 환경 변수 또는 안전한 저장소에 저장 권장

  // 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
      console.log('녹음 시작');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
    }
  };

  // 음성 녹음 종료
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setStatus('녹음 종료 중...');
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      setStatus('녹음 완료');
      console.log('녹음 파일 경로:', uri);

      if (uri) {
        await transcribeAudio(uri); // 서버로 전송
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    }
  };

  // 오디오 파일 전송 및 텍스트 변환
  const transcribeAudio = async (uri: string) => {
    try {
      setStatus('파일 업로드 중...');
      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'recording.m4a',
        type: 'audio/x-m4a',
      });

      const response = await fetch('https://eartalk.site:17004/api/audio', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      const result = await response.json();
      setIdentifier(result.identifier); // 식별자 저장
      setStatus('변환 요청 완료');
      
      // 변환된 텍스트를 받기 위한 후속 처리
      await fetchTranscriptionResult(result.identifier);
      
      // 변환된 오디오 파일 데이터도 가져오기
      await fetchFileData(result.identifier);
    } catch (error) {
      console.error('오류:', error);
      setText('오류가 발생했습니다. 다시 시도해 주세요.');
      setStatus('파일 업로드 실패');
    }
  };

  // 텍스트 변환 결과 받기
  const fetchTranscriptionResult = async (identifier: string) => {
    try {
      setStatus('변환 결과 조회 중...');
      
      const response = await fetch(`https://eartalk.site:17004/api/audio/${identifier}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.transcript) {
        setText(result.transcript); // 텍스트 설정
        setStatus('변환 완료');
      } else {
        setText('변환된 텍스트가 없습니다.');
        setStatus('텍스트 변환 실패');
      }
    } catch (error) {
      console.error('오류:', error);
      setText('변환 결과를 가져올 수 없습니다.');
      setStatus('결과 조회 실패');
    }
  };

  // 파일 데이터 가져오기 (새로운 API로 변환된 오디오 파일 데이터 가져오기)
  const fetchFileData = async (identifier: string) => {
    try {
      setStatus('파일 데이터 조회 중...');
      
      const response = await fetch(`https://eartalk.site:17004/api/file/${identifier}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`파일 데이터 요청 실패: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('파일 데이터:', result);
      setFileData(result); // 파일 데이터 상태에 저장
    } catch (error) {
      console.error('파일 데이터 조회 실패:', error);
      setStatus('파일 데이터 조회 실패');
    }
  };

  // 텍스트를 음성으로 변환
  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text);
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
        <Button title="텍스트 읽기" onPress={speakText} />
      </View>
      <Text style={styles.status}>{status}</Text>
      {text && <Text style={styles.transcript}>{text}</Text>}

      {/* 파일 데이터 출력 *///}
      /*{fileData && (
        <View style={styles.fileDataContainer}>
          <Text style={styles.fileDataHeader}>파일 데이터:</Text>
          <Text style={styles.fileDataText}>{JSON.stringify(fileData, null, 2)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
  transcript: {
    marginTop: 10,
    fontSize: 18,
    color: 'black',
  },
  fileDataContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
  },
  fileDataHeader: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileDataText: {
    fontFamily: 'monospace',
    color: '#333',
  },
});

export default App; */




/* import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState('');
  const API_TOKEN = 'YOUR_API_TOKEN'; // 환경 변수 또는 안전한 저장소에 저장 권장

  // 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 부족', '앱 기능을 사용하려면 마이크 권한이 필요합니다.');
      }
    })();
  }, []);

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      setStatus('녹음 준비 중...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
      console.log('녹음 시작');
    } catch (error) {
      console.error('녹음 실패:', error);
      setStatus('녹음 실패');
    }
  };

  // 음성 녹음 종료
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setStatus('녹음 종료 중...');
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      setStatus('녹음 완료');
      console.log('녹음 파일 경로:', uri);

      if (uri) {
        await transcribeAudio(uri); // 서버로 전송
      } else {
        setStatus('녹음된 파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('녹음 종료 실패:', error);
      setStatus('녹음 종료 실패');
    }
  };

  // 오디오 파일 전송 및 텍스트 변환
  const transcribeAudio = async (uri: string) => {
    try {
      setStatus('파일 업로드 중...');
      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'recording.m4a',
        type: 'audio/x-m4a',
      });

      const response = await fetch('https://eartalk.site:17004/api/audio', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      const result = await response.json();
      setText(result.transcript || '음성 인식 실패');
      setStatus('변환 완료');
    } catch (error) {
      console.error('오류:', error);
      setText('오류가 발생했습니다. 다시 시도해 주세요.');
      setStatus('파일 업로드 실패');
    }
  };

  // 텍스트를 음성으로 변환
  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text);
    } else {
      Alert.alert('텍스트 없음', '읽을 텍스트를 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
        <Button title="텍스트 읽기" onPress={speakText} />
      </View>
      <Text style={styles.status}>{status}</Text>
      {text && <Text style={styles.transcript}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
  transcript: {
    marginTop: 10,
    fontSize: 18,
    color: 'black',
  },
});

export default App; */




/* import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const App = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [status, setStatus] = useState('');

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatus('녹음 중...');
      console.log('녹음 시작');
    } catch (error) {
      console.error('녹음 실패:', error);
    }
  };

  // 음성 녹음 중지
  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      setStatus('녹음 완료');
      const uri = recording.getURI();
      console.log('녹음 완료:', uri);
      await transcribeAudio(uri); // 녹음된 오디오 파일을 API로 전송
    } catch (error) {
      console.error('녹음 종료 실패:', error);
    }
  };

 /*  // 오디오 파일을 전송하는 함수
  const transcribeAudio = async (uri: string) => {
    try {
      const audioFile = await fetch(uri);
      const audioBlob = await audioFile.blob();

      // 'audio.wav'라는 파일 이름을 명시적으로 지정
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav'); // 오디오 파일을 FormData에 추가

      const response = await fetch('https://eartalk.site:17004/api/audio', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.transcript) {
        setText(result.transcript);  // API 응답에서 텍스트 추출
      } else {
        setText('음성 인식 실패');
      }
    } catch (error) {
      console.error('음성 텍스트 변환 실패:', error);
      setText('음성 텍스트 변환 실패');
    }
  }; */

// 오디오 파일을 전송하는 함수
/*const transcribeAudio = async (uri: string) => {
  try {
    // 파일 불러오기
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('파일을 가져오는데 실패했습니다.');
    }

    const audioBlob = await response.blob();

    // FormData 구성 (파일 이름 제외)
    const formData = new FormData();
    formData.append('file', audioBlob); // 두 개의 인수만 사용

    // API 요청 보내기
    const apiResponse = await fetch('https://eartalk.site:17004/api/audio', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    if (!apiResponse.ok) {
      throw new Error(`API 요청 실패: ${apiResponse.statusText}`);
    }

    const result = await apiResponse.json();
    if (result.transcript) {
      setText(result.transcript); // API 응답에서 텍스트 추출
    } else {
      setText('음성 인식 실패');
    }
  } catch (error) {
    console.error('오류:', error);
    setText('오류가 발생했습니다. 다시 시도해 주세요.');
  }
};

  // 텍스트를 음성으로 변환
  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text);  // 텍스트를 음성으로 변환
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="여기에 텍스트를 입력하세요"
        style={styles.textInput}
      />
      <View style={styles.buttonsContainer}>
        <Button title="음성 녹음 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="음성 녹음 종료" onPress={stopRecording} disabled={!isRecording} />
        <Button title="텍스트 읽기" onPress={speakText} />
      </View>
      <Text style={styles.status}>{status}</Text>
      {text && <Text style={styles.transcript}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  status: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
  transcript: {
    marginTop: 10,
    fontSize: 18,
    color: 'black',
  },
});

export default App;
 */