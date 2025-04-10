
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
  const [blogTitle, setBlogTitle] = useState<string | undefined>("Group Discussion Summary");
  const [blogContent, setBlogContent] = useState<string | undefined>(
    "This area will display the summary of our collaborative discussion between Norman AGI, Solara, and human participants. As the discussion progresses, key points and insights will be captured here for reference."
  );
  const [turnBasedMode, setTurnBasedMode] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState("User");

  // Handle user speech from voice recognition
  const handleUserSpeech = useCallback((transcript: string) => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleVoiceInput(transcript);
    }
    
    // In turn-based mode, change the speaker after user speaks
    if (turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
  }, [turnBasedMode]);

  // Handle AI responses for speech synthesis and potential blog content
  const handleAIResponse = useCallback((response: string) => {
    if (voiceUIRef.current) {
      voiceUIRef.current.speak(response);
    }
    
    // Update the discussion summary with Norman's contributions
    updateDiscussionSummary(`Norman AGI: ${response.slice(0, 150)}...`);
    
    // In turn-based mode, change the speaker after Norman speaks
    if (turnBasedMode) {
      setCurrentSpeaker("Solara");
    }
  }, [turnBasedMode]);
  
  // Handle speak toggle to coordinate UI states
  const handleSpeakToggle = useCallback((isSpeaking: boolean) => {
    console.log('Norman speaking state:', isSpeaking);
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
      
      // Simulating a response after file processing
      setTimeout(() => {
        const newContent = `${normanAGI.name} has analyzed your files and is joining the discussion with insights.\n\n${blogContent}`;
        setBlogContent(newContent);
      }, 3000);
    }
    
    // In turn-based mode, change the speaker after sending a message to Norman
    if (turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
  }, [blogContent, turnBasedMode]);

  // Handle secondary AI interactions (Solara)
  const handleSecondaryAIMessage = useCallback((message: string, attachments?: File[]) => {
    console.log(`Message sent to ${solaraAGI.name}:`, message);
    
    if (attachments && attachments.length > 0) {
      console.log(`Files sent to ${solaraAGI.name}:`, attachments);
      toast({
        title: `${solaraAGI.name} processing files`,
        description: `${attachments.length} file(s) are being analyzed.`,
      });
      
      // Simulate Solara processing the files
      setTimeout(() => {
        // Update discussion summary with Solara's contributions
        updateDiscussionSummary(`${solaraAGI.name}: Analyzed files related to ${solaraAGI.baseDirectives.election_mission.target_location} smart city initiative. Checking candidate trustworthiness...`);
      }, 3000);
    } else {
      // Update discussion summary with Solara's regular contributions
      updateDiscussionSummary(`${solaraAGI.name}: ${message.slice(0, 100)}...`);
    }
    
    // In turn-based mode, change the speaker after Solara speaks
    if (turnBasedMode) {
      setCurrentSpeaker("User");
    }
  }, [turnBasedMode]);

  // Handle voice input from web views
  const handleWebViewVoiceInput = useCallback((text: string, viewIndex: number) => {
    console.log(`Voice input from web view ${viewIndex}: ${text}`);
    // Update discussion summary with research findings
    updateDiscussionSummary(`Research Browser ${viewIndex + 1}: Found information related to "${text.slice(0, 50)}..."`);
  }, []);

  // Handle speak toggle from web views
  const handleWebViewSpeakToggle = useCallback((isSpeaking: boolean, viewIndex: number) => {
    console.log(`Web view ${viewIndex} speaking state: ${isSpeaking}`);
  }, []);
  
  // Helper function to update the discussion summary
  const updateDiscussionSummary = (newEntry: string) => {
    setBlogContent(prevContent => {
      const timestamp = new Date().toLocaleTimeString();
      return `[${timestamp}] ${newEntry}\n\n${prevContent}`;
    });
  };

  // Toggle turn-based discussion mode
  const toggleTurnBasedMode = () => {
    setTurnBasedMode(!turnBasedMode);
    toast({
      title: turnBasedMode ? "Free Discussion Mode" : "Turn-Based Discussion Mode",
      description: turnBasedMode ? 
        "Anyone can speak at any time." : 
        `Sequential turns: ${currentSpeaker} → Norman AGI → Solara → User`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Discussion mode toggle */}
      <div className="fixed top-4 left-4 z-50">
        <button 
          onClick={toggleTurnBasedMode}
          className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
            turnBasedMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {turnBasedMode ? "Turn-Based Mode" : "Free Discussion Mode"}
        </button>
        {turnBasedMode && (
          <div className="mt-2 bg-white p-2 rounded-lg shadow">
            <p className="text-sm font-medium">Current Speaker: {currentSpeaker}</p>
          </div>
        )}
      </div>
      
      {/* Solara AGI Interface */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 items-end">
        <CompactVoiceControls 
          aiName={solaraAGI.name}
          onUserSpeech={handleSecondaryAIMessage}
          onSpeakToggle={(isSpeaking) => console.log(`${solaraAGI.name} speaking:`, isSpeaking)}
        />
        <ChatInterface2 
          title="Group Participant"
          aiName={solaraAGI.name}
          onSendMessage={handleSecondaryAIMessage}
        />
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-150px)] pt-20">
        <div className="flex flex-1 gap-6">
          {/* Left side: Web Views */}
          <div className="flex-1">
            <SplitWebView 
              onVoiceInput={handleWebViewVoiceInput}
              onSpeakToggle={handleWebViewSpeakToggle}
            />
          </div>
          
          {/* Right side: Group Discussion Summary */}
          <div className="w-1/3">
            <BlogArticle 
              title={blogTitle}
              content={blogContent}
            />
          </div>
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
