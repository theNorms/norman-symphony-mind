
import React, { useRef, useCallback, useState } from 'react';
import VoiceUI, { VoiceUIHandle } from '@/components/VoiceUI';
import ChatInterface, { ChatInterfaceHandle } from '@/components/ChatInterface';
import BlogArticle from '@/components/BlogArticle';
import SplitWebView from '@/components/SplitWebView';
import CompactVoiceControls from '@/components/CompactVoiceControls';
import { toast } from '@/components/ui/use-toast';
import ChatInterface2 from '@/components/ChatInterface2';

// AGI configurations
const normanAGI = {
  name: "Norman AGI",
  baseUrl: "https://cm99szw0dk19ydnuv2hulqkru.agent.a.smyth.ai"
};

const solaraAGI = {
  name: "Solara",
  version: "2.0",
  baseDirectives: {
    election_mission: {
      target_location: "Imus, Cavite",
      goal: "identify trustworthy candidate aligned with smart city vision"
    }
  }
};

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
    console.log(`Sending message to ${normanAGI.name}:`, message);
    
    if (attachments && attachments.length > 0) {
      console.log('With attachments:', attachments);
      toast({
        title: "Files attached",
        description: `${attachments.length} file(s) will be processed by the AGI.`,
      });
      
      // Here you would integrate with your API to process the attachments
      // Simulating a response after file processing
      setTimeout(() => {
        setBlogTitle("Analysis of Attached Files");
        setBlogContent("The Norman AGI has analyzed your attached files and generated this blog article.\n\nThis is a placeholder for the actual content that would be generated based on your file analysis. In a real implementation, the files would be sent to the AGI's multimodal synthesis API endpoint and the response would populate this area.\n\nThe content would be formatted as an article and displayed here for easy reading.");
      }, 3000);
    }
  }, []);

  // Handle secondary AI interactions (Solara)
  const handleSecondaryAIMessage = useCallback((message: string, attachments?: File[]) => {
    console.log(`Message sent to ${solaraAGI.name}:`, message);
    
    if (attachments && attachments.length > 0) {
      console.log(`Files sent to ${solaraAGI.name}:`, attachments);
      toast({
        title: `${solaraAGI.name} processing files`,
        description: `${attachments.length} file(s) are being analyzed.`,
      });
      
      // Simulate Solara processing the files - in real implementation this would call the Solara API
      setTimeout(() => {
        // Update blog with Solara's analysis
        setBlogTitle(`${solaraAGI.name}'s Analysis`);
        setBlogContent(`${solaraAGI.name} has analyzed your files and generated this response.\n\nTarget Location: ${solaraAGI.baseDirectives.election_mission.target_location}\nGoal: ${solaraAGI.baseDirectives.election_mission.goal}\n\nThis is a placeholder for the actual content that would be generated based on your file analysis through Solara's cross-domain intelligence and ethical reasoning systems.\n\nThe content would reflect Solara's mission of identifying trustworthy candidates aligned with smart city initiatives.`);
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
      {/* Top controls - Solara AGI Interface */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 items-end">
        <CompactVoiceControls 
          aiName={solaraAGI.name}
          onUserSpeech={handleSecondaryAIMessage}
          onSpeakToggle={(isSpeaking) => console.log(`${solaraAGI.name} speaking:`, isSpeaking)}
        />
        <ChatInterface2 
          title="Secondary AI"
          aiName={solaraAGI.name}
          onSendMessage={handleSecondaryAIMessage}
        />
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 flex h-[calc(100vh-150px)]">
        {/* Left side: Web Views - Taking full height */}
        <div className="flex-1 mr-6">
          <SplitWebView 
            onVoiceInput={handleWebViewVoiceInput}
            onSpeakToggle={handleWebViewSpeakToggle}
          />
        </div>
        
        {/* Right side: Blog Article Area */}
        <div className="w-1/3">
          <BlogArticle 
            title={blogTitle}
            content={blogContent}
          />
        </div>
      </div>
      
      {/* Voice UI and Chat Interface components for Norman AGI */}
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
