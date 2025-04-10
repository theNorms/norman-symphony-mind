
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionError extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
}

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface VoiceUIHandle {
  speak: (text: string) => void;
  stopSpeaking: () => void;
  startListening: () => void;
  stopListening: () => void;
}

interface VoiceUIProps {
  onUserSpeech?: (text: string) => void;
  onSpeakToggle?: (isSpeaking: boolean) => void;
}

const VoiceUI = forwardRef<VoiceUIHandle, VoiceUIProps>(({ 
  onUserSpeech = () => {}, 
  onSpeakToggle = () => {} 
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          onUserSpeech(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      };
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast, onUserSpeech]);

  // Initialize speech synthesis
  useEffect(() => {
    speechSynthesisRef.current = new SpeechSynthesisUtterance();
    
    speechSynthesisRef.current.onend = () => {
      setIsSpeaking(false);
      onSpeakToggle(false);
    };

    speechSynthesisRef.current.onerror = (event) => {
      console.error('Speech synthesis error', event);
      setIsSpeaking(false);
      onSpeakToggle(false);
      toast({
        title: "Speech Synthesis Error",
        description: "There was an error with text-to-speech. Please try again.",
        variant: "destructive"
      });
    };

    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast, onSpeakToggle, isSpeaking]);

  const speak = (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Set the text to speak
    speechSynthesisRef.current.text = text;
    
    // Start speaking
    setIsSpeaking(true);
    onSpeakToggle(true);
    window.speechSynthesis.speak(speechSynthesisRef.current);
  };

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    speak,
    stopSpeaking: () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakToggle(false);
    },
    startListening: () => {
      if (!isListening && recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    },
    stopListening: () => {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }));

  // No visible UI elements - the component now only provides functionality
  return null;
});

VoiceUI.displayName = 'VoiceUI';

export default VoiceUI;
