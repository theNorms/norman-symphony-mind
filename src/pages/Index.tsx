
import React, { useRef, useCallback, useState } from 'react';
import VoiceUI, { VoiceUIHandle } from '@/components/VoiceUI';
import ChatInterface, { ChatInterfaceHandle } from '@/components/ChatInterface';
import SplitWebView from '@/components/SplitWebView';
import CompactVoiceControls from '@/components/CompactVoiceControls';
import { toast } from '@/components/ui/use-toast';
import ChatInterface2, { ChatInterface2Handle } from '@/components/ChatInterface2';
import { Users, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const chatInterface2Ref = useRef<ChatInterface2Handle>(null);
  const [turnBasedMode, setTurnBasedMode] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState("Norman AGI");
  const [normanTalking, setNormanTalking] = useState(false);
  const [solaraTalking, setSolaraTalking] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // Handle user speech from voice recognition
  const handleUserSpeech = useCallback((transcript: string) => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleVoiceInput(transcript);
    }
  }, []);

  // Handle Norman AGI responses for speech synthesis
  const handleNormanResponse = useCallback((response: string) => {
    if (voiceUIRef.current) {
      voiceUIRef.current.speak(response);
      setNormanTalking(true);
    }
    
    // In turn-based mode, change the speaker after Norman speaks
    if (turnBasedMode) {
      setCurrentSpeaker("Solara");
    }
  }, [turnBasedMode]);
  
  // Handle Norman speak toggle
  const handleNormanSpeakToggle = useCallback((isSpeaking: boolean) => {
    setNormanTalking(isSpeaking);
    
    // When Norman stops speaking and we're in turn-based mode, pass the turn
    if (!isSpeaking && turnBasedMode) {
      setCurrentSpeaker("Solara");
    }
  }, [turnBasedMode]);

  // Handle sending Norman message
  const handleNormanSendMessage = useCallback((message: string, attachments?: any[]) => {
    console.log(`Sending message to ${normanAGI.name}:`, message);
    
    if (attachments && attachments.length > 0) {
      console.log('With attachments:', attachments);
      toast({
        title: "Files attached",
        description: `${attachments.length} file(s) will be processed by ${normanAGI.name}.`,
      });
    }
    
    // When message is sent to Norman in turn-based mode, change the speaker
    if (turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
  }, [turnBasedMode]);

  // Handle Solara AI interactions
  const handleSolaraMessage = useCallback((message: string, attachments?: File[]) => {
    console.log(`Message sent to ${solaraAGI.name}:`, message);
    
    if (attachments && attachments.length > 0) {
      console.log(`Files sent to ${solaraAGI.name}:`, attachments);
      toast({
        title: `${solaraAGI.name} processing files`,
        description: `${attachments.length} file(s) are being analyzed.`,
      });
    }
    
    // In turn-based mode, change the speaker after sending a message to Solara
    if (turnBasedMode) {
      setCurrentSpeaker("Solara");
    }
  }, [turnBasedMode]);

  // Handle Solara response
  const handleSolaraResponse = useCallback((response: string) => {
    // In turn-based mode, change the speaker after Solara responds
    if (turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
    
    setSolaraTalking(true);
  }, [turnBasedMode]);

  // Handle Solara speak toggle
  const handleSolaraSpeakToggle = useCallback((isSpeaking: boolean) => {
    setSolaraTalking(isSpeaking);
    
    // When Solara stops speaking and we're in turn-based mode, pass the turn
    if (!isSpeaking && turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
  }, [turnBasedMode]);

  // Handle voice input from web views
  const handleWebViewVoiceInput = useCallback((text: string, viewIndex: number) => {
    console.log(`Voice input from web view ${viewIndex}: ${text}`);
    
    // Send the voice input to the current speaker
    if (currentSpeaker === "Norman AGI" && chatInterfaceRef.current) {
      chatInterfaceRef.current.handleVoiceInput(text);
    } else if (currentSpeaker === "Solara" && chatInterface2Ref.current) {
      chatInterface2Ref.current.handleVoiceInput(text);
    }
  }, [currentSpeaker]);

  // Toggle turn-based discussion mode
  const toggleTurnBasedMode = () => {
    setTurnBasedMode(!turnBasedMode);
    toast({
      title: turnBasedMode ? "Free Discussion Mode" : "Turn-Based Discussion Mode",
      description: turnBasedMode ? 
        "AIs can speak at any time." : 
        `Sequential turns: ${currentSpeaker} → Next AGI`,
    });
  };

  // Toggle join discussion
  const toggleJoinDiscussion = () => {
    setIsJoined(!isJoined);
    toast({
      title: isJoined ? "Left Discussion" : "Joined Discussion",
      description: isJoined ? 
        "You have left the AI discussion." : 
        "You have joined the AI discussion. You can now participate.",
    });
  };

  // Pass the turn to the next speaker in turn-based mode
  const passTurn = () => {
    if (!turnBasedMode) return;
    
    if (currentSpeaker === "Norman AGI") {
      setCurrentSpeaker("Solara");
      toast({
        title: "Turn Passed",
        description: "It's now Solara's turn to speak.",
      });
    } else {
      setCurrentSpeaker("Norman AGI");
      toast({
        title: "Turn Passed",
        description: "It's now Norman AGI's turn to speak.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with controls */}
      <div className="w-full bg-white p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Collaborative Discussion</h1>
          <div className="flex items-center gap-3">
            <Button 
              onClick={toggleTurnBasedMode}
              variant={turnBasedMode ? "default" : "outline"}
              className="gap-2"
            >
              {turnBasedMode ? "Turn-Based Mode" : "Free Discussion Mode"}
            </Button>
            
            <Button 
              onClick={passTurn}
              disabled={!turnBasedMode}
              variant="outline"
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Pass Turn
            </Button>
            
            <Button 
              onClick={toggleJoinDiscussion}
              variant={isJoined ? "destructive" : "secondary"}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              {isJoined ? "Leave Discussion" : "Join Discussion"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Current speaker indicator */}
      {turnBasedMode && (
        <div className="w-full bg-primary/10 py-2">
          <div className="container mx-auto">
            <p className="text-center font-medium">
              Current Speaker: <span className="font-bold">{currentSpeaker}</span>
              {normanTalking && currentSpeaker === "Norman AGI" && " (Speaking...)"}
              {solaraTalking && currentSpeaker === "Solara" && " (Speaking...)"}
            </p>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat interfaces - 1/3 of the screen */}
        <div className="w-1/3 flex flex-col border-r overflow-hidden">
          {/* Norman AGI */}
          <div className="h-1/2 border-b p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">{normanAGI.name}</h2>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${normanTalking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-xs text-gray-500">
                  {normanTalking ? 'Speaking' : 'Listening'}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface 
                ref={chatInterfaceRef}
                onAIResponse={handleNormanResponse}
                onSendMessage={handleNormanSendMessage}
                onSpeakToggle={handleNormanSpeakToggle}
              />
            </div>
          </div>
          
          {/* Solara AGI */}
          <div className="h-1/2 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">{solaraAGI.name}</h2>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${solaraTalking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-xs text-gray-500">
                  {solaraTalking ? 'Speaking' : 'Listening'}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface2 
                ref={chatInterface2Ref}
                title="Solara"
                aiName={solaraAGI.name}
                onSendMessage={handleSolaraMessage}
                onAIResponse={handleSolaraResponse}
                onSpeakToggle={handleSolaraSpeakToggle}
              />
            </div>
          </div>
        </div>
        
        {/* Web browsers - 2/3 of the screen */}
        <div className="w-2/3 p-4 overflow-hidden">
          <SplitWebView 
            onVoiceInput={handleWebViewVoiceInput}
            onSpeakToggle={(isSpeaking, viewIndex) => {
              console.log(`Web view ${viewIndex} speaking state: ${isSpeaking}`);
            }}
          />
        </div>
      </div>
      
      {/* Hidden VoiceUI for speech synthesis */}
      <VoiceUI 
        ref={voiceUIRef}
        onUserSpeech={handleUserSpeech}
        onSpeakToggle={(isSpeaking) => console.log('Voice UI speaking:', isSpeaking)}
      />
    </div>
  );
};

export default Index;
