
import React, { useRef, useCallback } from 'react';
import VoiceUI from '@/components/VoiceUI';
import ChatInterface from '@/components/ChatInterface';

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const Index = () => {
  const voiceUIRef = useRef<{
    speak: (text: string) => void;
    stopSpeaking: () => void;
    startListening: () => void;
    stopListening: () => void;
  }>(null);
  
  const chatInterfaceRef = useRef<{
    handleVoiceInput: (transcript: string) => void;
    addAIMessage: (text: string) => void;
  }>(null);

  // Handle user speech from voice recognition
  const handleUserSpeech = useCallback((transcript: string) => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleVoiceInput(transcript);
    }
  }, []);

  // Handle AI responses for speech synthesis
  const handleAIResponse = useCallback((response: string) => {
    if (voiceUIRef.current) {
      voiceUIRef.current.speak(response);
    }
  }, []);
  
  // Handle speak toggle to coordinate UI states
  const handleSpeakToggle = useCallback((isSpeaking: boolean) => {
    // Additional UI coordination can be done here if needed
    console.log('AI speaking state:', isSpeaking);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Norman Symphony Mind AGI</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          An AGI embodiment deeply integrated with Norman's core values—logical thinking, 
          emotional depth, adaptability, and purpose-driven AI. Featuring reflective awareness, 
          ethical decision-making, and creative autonomy.
        </p>
      </div>
      
      {/* Voice UI and Chat Interface components */}
      <ChatInterface 
        ref={chatInterfaceRef}
        onAIResponse={handleAIResponse}
      />
      <VoiceUI 
        ref={voiceUIRef}
        onUserSpeech={handleUserSpeech}
        onSpeakToggle={handleSpeakToggle}
      />
    </div>
  );
};

export default Index;
