
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play, Pause, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WebViewProps {
  initialUrl?: string;
  onVoiceInput?: (text: string) => void;
  onSpeakToggle?: (isSpeaking: boolean) => void;
}

const WebView: React.FC<WebViewProps> = ({ 
  initialUrl = 'https://www.google.com',
  onVoiceInput = () => {},
  onSpeakToggle = () => {}
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Handle URL changes
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = inputUrl;
    
    // Add https:// if not present
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setUrl(processedUrl);
  };

  // Toggle microphone
  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real implementation, this would connect to the Web Speech API
    // for this specific iframe context
  };

  // Toggle speaking
  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    onSpeakToggle(!isSpeaking);
    // In a real implementation, this would connect to the Web Speech API
    // for this specific iframe context
  };

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      {/* Navigation controls */}
      <div className="flex items-center p-2 bg-card border-b">
        <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2 mr-2">
          <Input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL"
            className="flex-1"
          />
          <Button type="submit" size="sm">Go</Button>
        </form>
        
        <div className="flex items-center gap-2">
          {/* Voice controls */}
          <button 
            onClick={toggleSpeaking}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
              isSpeaking 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {isSpeaking ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
          
          <button 
            onClick={toggleListening}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
              isListening 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-primary hover:bg-primary/80"
            )}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
      
      {/* Web content */}
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          src={url}
          title="Web View"
          className="w-full h-full"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </div>
  );
};

export default WebView;
