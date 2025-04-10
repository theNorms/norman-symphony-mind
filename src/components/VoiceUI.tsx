
import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

const VoiceUI = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

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
};

export default VoiceUI;
