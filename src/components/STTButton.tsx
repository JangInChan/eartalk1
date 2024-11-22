import React, { useState, useEffect } from 'react';
import { Button, Text, TextInput, View, StyleSheet } from 'react-native';
import Voice from 'react-native-voice';

const STTButton = () => {
  const [text, setText] = useState<string>(''); // 음성 인식 결과 저장
  const [status, setStatus] = useState<string>(''); // 상태 메시지

  // 음성 인식 시작
  const startListening = () => {
    setText('');
    setStatus('듣고 있습니다...');
    Voice.start('ko-KR'); // 한국어 설정
  };

  // 음성 인식 종료
  const stopListening = () => {
    setStatus('처리 중입니다...');
    Voice.stop();
  };

  // 음성 인식 결과 처리
  const onSpeechPartialResults = (event: any) => {
    setStatus(''); // 처리 완료 후 상태 초기화
    setText(event.value[0]); // 첫 번째 음성 인식 결과 저장
  };

  // 음성 인식 오류 처리
  const onSpeechError = (event: any) => {
    setStatus('오류가 발생했습니다.'); // 오류 메시지 표시
    console.error(event.error);
  };

  useEffect(() => {
    // 'speechPartialResults'와 'speechError' 이벤트 리스너 등록
    Voice.on('speechPartialResults', onSpeechPartialResults);
    Voice.on('speechError', onSpeechError);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      Voice.removeAllListeners('speechPartialResults');
      Voice.removeAllListeners('speechError');
    };
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={status || text} // 상태 메시지 또는 음성 인식 결과 표시
        editable={false} // 텍스트 입력 비활성화
      />
      <Button
        title={status === '듣고 있습니다...' ? '녹음 중지' : '녹음 시작'}
        onPress={status === '듣고 있습니다...' ? stopListening : startListening}
      />
      <Text style={styles.statusText}>{status || text}</Text> {/* 상태와 텍스트 표시 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default STTButton;
