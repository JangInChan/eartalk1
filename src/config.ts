import AsyncStorage from '@react-native-async-storage/async-storage';

export const getHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token || ''}`,
  };
};

export const config = {
  API_BASE_URL: 'https://eartalk.site:17004',
};
