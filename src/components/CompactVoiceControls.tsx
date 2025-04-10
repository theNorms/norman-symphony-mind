
import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactVoiceControlsProps {
  aiName?: string;
  onUserSpeech?: (text: string) => void;
  onSpeakToggle?: (isSpeaking: boolean) => void;
}

const CompactVoiceControls: React.FC<CompactVoiceControlsProps> = ({
  aiName = "Solara",
  onUserSpeech = () => {},
  onSpeakToggle = () => {}
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Toggle microphone
  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real implementation, this would connect to the Web Speech API
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        const simulatedText = `Hello ${aiName}, this is a simulated voice input.`;
        onUserSpeech(simulatedText);
        setIsListening(false);
      }, 3000);
    }
  };

  // Toggle speaking
  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    onSpeakToggle(!isSpeaking);
    
    // Simulate speech - in real implementation this would use the Web Speech API
    if (!isSpeaking) {
      setTimeout(() => {
        setIsSpeaking(false);
        onSpeakToggle(false);
      }, 5000);
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
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
      
      <button 
        onClick={toggleSpeaking}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-300 z-10",
          isSpeaking 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-secondary hover:bg-secondary/80"
        )}
      >
        {isSpeaking ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white" />
        )}
      </button>
      
      <button 
        onClick={toggleListening}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-300 z-10",
          isListening 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-primary hover:bg-primary/80"
        )}
      >
        {isListening ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
};

export default CompactVoiceControls;
