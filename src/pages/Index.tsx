
import React, { useRef, useCallback, useState } from 'react';
import VoiceUI, { VoiceUIHandle } from '@/components/VoiceUI';
import ChatInterface, { ChatInterfaceHandle } from '@/components/ChatInterface';
import BlogArticle from '@/components/BlogArticle';
import SplitWebView from '@/components/SplitWebView';
import CompactVoiceControls from '@/components/CompactVoiceControls';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const voiceUIRef = useRef<VoiceUIHandle>(null);
  const chatInterfaceRef = useRef<ChatInterfaceHandle>(null);
  const [blogTitle, setBlogTitle] = useState<string | undefined>();
  const [blogContent, setBlogContent] = useState<string | undefined>();

  // Handle user speech from voice recognition
  const handleUserSpeech = useCallback((transcript: string) => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleVoiceInput(transcript);
    }
  }, []);

  // Handle AI responses for speech synthesis and potential blog content
  const handleAIResponse = useCallback((response: string) => {
    if (voiceUIRef.current) {
      voiceUIRef.current.speak(response);
    }
    
    // Optionally update blog content here when the API integration is complete
  }, []);
  
  // Handle speak toggle to coordinate UI states
  const handleSpeakToggle = useCallback((isSpeaking: boolean) => {
    // Additional UI coordination can be done here if needed
    console.log('AI speaking state:', isSpeaking);
  }, []);

  // Handle sending message with attachments
  const handleSendMessage = useCallback((message: string, attachments?: any[]) => {
    console.log('Sending message:', message);
    
    if (attachments && attachments.length > 0) {
      console.log('With attachments:', attachments);
      toast({
        title: "Files attached",
        description: `${attachments.length} file(s) will be processed by the AGI.`,
      });
      
      // Here you would integrate with your API to process the attachments
      // For now, we'll just simulate a response
      setTimeout(() => {
        setBlogTitle("Analysis of Attached Files");
        setBlogContent("The Norman AGI has analyzed your attached files and generated this blog article.\n\nThis is a placeholder for the actual content that would be generated based on your file analysis. In a real implementation, the files would be sent to the AGI's multimodal synthesis API endpoint and the response would populate this area.\n\nThe content would be formatted as an article and displayed here for easy reading.");
      }, 3000);
    }
  }, []);

  // Handle voice input from web views
  const handleWebViewVoiceInput = useCallback((text: string, viewIndex: number) => {
    console.log(`Voice input from web view ${viewIndex}: ${text}`);
    // In a real implementation, this would process the voice input
    // specifically for the web view that generated it
  }, []);

  // Handle speak toggle from web views
  const handleWebViewSpeakToggle = useCallback((isSpeaking: boolean, viewIndex: number) => {
    console.log(`Web view ${viewIndex} speaking state: ${isSpeaking}`);
    // In a real implementation, this would coordinate the speaking state
    // specifically for the web view that triggered it
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top controls */}
      <CompactVoiceControls 
        onUserSpeech={handleUserSpeech}
        onSpeakToggle={handleSpeakToggle}
      />
      
      {/* Split the page into two sections */}
      <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Blog Article Area */}
        <BlogArticle 
          title={blogTitle}
          content={blogContent}
        />
        
        {/* Web Views Area */}
        <div className="h-[500px]">
          <SplitWebView 
            onVoiceInput={handleWebViewVoiceInput}
            onSpeakToggle={handleWebViewSpeakToggle}
          />
        </div>
      </div>
      
      {/* Voice UI and Chat Interface components */}
      <ChatInterface 
        ref={chatInterfaceRef}
        onAIResponse={handleAIResponse}
        onSendMessage={handleSendMessage}
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
