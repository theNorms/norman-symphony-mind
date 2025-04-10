
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import WebView from './WebView';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface SplitWebViewProps {
  initialUrls?: [string, string];
  onVoiceInput?: (text: string, viewIndex: number) => void;
  onSpeakToggle?: (isSpeaking: boolean, viewIndex: number) => void;
}

const SplitWebView: React.FC<SplitWebViewProps> = ({ 
  initialUrls = ['https://www.google.com', 'https://www.bing.com'],
  onVoiceInput = () => {},
  onSpeakToggle = () => {}
}) => {
  const [urls, setUrls] = useState<[string, string]>(initialUrls);
  const [currentUrls, setCurrentUrls] = useState<[string, string]>(initialUrls);
  
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls] as [string, string];
    newUrls[index] = value;
    setUrls(newUrls);
  };
  
  const handleNavigate = (index: number) => {
    const newCurrentUrls = [...currentUrls] as [string, string];
    newCurrentUrls[index] = urls[index];
    setCurrentUrls(newCurrentUrls);
  };
  
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Research Browsers</h2>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border h-full"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <div className="flex items-center p-2 border-b">
              <Input 
                value={urls[0]}
                onChange={(e) => handleUrlChange(0, e.target.value)}
                placeholder="Enter URL"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(0)}
              />
              <Button 
                onClick={() => handleNavigate(0)}
                className="ml-2 bg-gray-800 text-white"
              >
                Go
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="ml-1"
                onClick={() => onVoiceInput("Search query for browser 1", 0)}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <WebView 
                initialUrl={currentUrls[0]} 
                onVoiceInput={(text) => onVoiceInput(text, 0)}
                onSpeakToggle={(isSpeaking) => onSpeakToggle(isSpeaking, 0)}
              />
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <div className="flex items-center p-2 border-b">
              <Input 
                value={urls[1]}
                onChange={(e) => handleUrlChange(1, e.target.value)}
                placeholder="Enter URL"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(1)}
              />
              <Button 
                onClick={() => handleNavigate(1)}
                className="ml-2 bg-gray-800 text-white"
              >
                Go
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="ml-1"
                onClick={() => onVoiceInput("Search query for browser 2", 1)}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <WebView 
                initialUrl={currentUrls[1]} 
                onVoiceInput={(text) => onVoiceInput(text, 1)}
                onSpeakToggle={(isSpeaking) => onSpeakToggle(isSpeaking, 1)}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default SplitWebView;
