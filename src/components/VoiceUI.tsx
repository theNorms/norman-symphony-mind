
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
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

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition start error', error);
        toast({
          title: "Speech Recognition Error",
          description: "Couldn't start speech recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakToggle(false);
    } else {
      setIsSpeaking(true);
      onSpeakToggle(true);
    }
  };

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Voice animation circles */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-primary/20 transition-transform duration-1000",
            isSpeaking ? "animate-pulse scale-[1.5]" : "scale-100 opacity-0"
          )}
        />
        
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-primary/30 transition-transform duration-700",
            isListening ? "animate-pulse scale-[1.5]" : "scale-100 opacity-0"
          )}
        />
        
        {/* Button container - horizontal layout */}
        <div className="flex items-center gap-3">
          {/* Audio control button - same size as mic button */}
          <button 
            onClick={toggleSpeaking}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
              isSpeaking 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {isSpeaking ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
          
          {/* Microphone button */}
          <button 
            onClick={toggleListening}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
              isListening 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-primary hover:bg-primary/80"
            )}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

VoiceUI.displayName = 'VoiceUI';

export default VoiceUI;
