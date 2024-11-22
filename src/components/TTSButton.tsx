import React from 'react';
import { Button } from 'react-native';
import * as Speech from 'expo-speech';

const TTSButton = ({ text }: { text: string }) => {
  const speak = () => {
    Speech.speak(text, { language: 'Ko' }); 
  };

  return <Button title="Speak" onPress={speak} />;
};

export default TTSButton;
