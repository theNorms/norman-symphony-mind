
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import WebView from './WebView';

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
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Research Browsers</h2>
      <ResizablePanelGroup
        direction="horizontal" // Changed to horizontal for side-by-side layout
        className="flex-1 rounded-lg border h-full"
      >
        <ResizablePanel defaultSize={50}>
          <WebView 
            initialUrl={initialUrls[0]} 
            onVoiceInput={(text) => onVoiceInput(text, 0)}
            onSpeakToggle={(isSpeaking) => onSpeakToggle(isSpeaking, 0)}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <WebView 
            initialUrl={initialUrls[1]}
            onVoiceInput={(text) => onVoiceInput(text, 1)}
            onSpeakToggle={(isSpeaking) => onSpeakToggle(isSpeaking, 1)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default SplitWebView;
