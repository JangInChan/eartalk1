declare module 'react-native-voice' {
    // 음성 인식 시작
    export function start(language: string): Promise<void>;
  
    // 음성 인식 중지
    export function stop(): Promise<void>;
  
    // 음성 인식 취소
    export function cancel(): Promise<void>;
  
    // 이벤트 리스너 등록 (기본적으로 onSpeechStart, onSpeechEnd, onSpeechError 등)
    export function on(
      event: 'speechStart' | 'speechEnd' | 'speechError' | 'speechPartialResults',
      callback: (...args: any[]) => void
    ): void;
  
    // 모든 이벤트 리스너 제거
    export function removeAllListeners(event: string): void;
  
    // 음성 인식 상태 확인
    export function isSpeechAvailable(): Promise<boolean>;
  
    // 현재 음성 인식 중인지 여부
    export function isSpeaking(): boolean;
  
    // 음성 인식 텍스트 결과 가져오기 (getSpeechResult는 음성 인식 결과를 배열로 반환)
    export function getSpeechResult(): string[];
  
    // 음성 인식 중에 발생할 수 있는 오류 처리 (이벤트 핸들러로 사용)
    export const onSpeechError: (error: any) => void;

    export function addListener(arg0: string, onSpeechError: (event: any) => void) {
        throw new Error('Function not implemented.');
    }
  }
  