import axios from 'axios';

const API_BASE_URL = 'https://eartalk.site:17004/api';

export const sendAudio = async (audioData: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioData, 'audio.wav'); // 파일 업로드
    const response = await axios.post(`${API_BASE_URL}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.identifier; // identifier 반환
  } catch (error) {
    console.error('Audio upload failed:', error);
    throw new Error('Failed to upload audio');
  }
};

export const getAudioInfo = async (identifier: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/audio/${identifier}`);
    return response.data; // 음성 정보 반환
  } catch (error) {
    console.error('Failed to fetch audio info:', error);
    throw new Error('Failed to fetch audio info');
  }
};
