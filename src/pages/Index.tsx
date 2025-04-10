import React, { useRef, useCallback, useState } from 'react';
import VoiceUI, { VoiceUIHandle } from '@/components/VoiceUI';
import ChatInterface, { ChatInterfaceHandle } from '@/components/ChatInterface';
import SplitWebView from '@/components/SplitWebView';
import { toast } from '@/components/ui/use-toast';
import ChatInterface2, { ChatInterface2Handle } from '@/components/ChatInterface2';
import { Users, Mic, MicOff, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState("current");

  const handleUserSpeech = useCallback((transcript: string) => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleVoiceInput(transcript);
    }
  }, []);

  const handleNormanResponse = useCallback((response: string) => {
    if (voiceUIRef.current) {
      voiceUIRef.current.speak(response);
      setNormanTalking(true);
    }
    
    if (turnBasedMode) {
      setCurrentSpeaker("Solara");
    }
  }, [turnBasedMode]);
  
  const handleNormanSpeakToggle = useCallback((isSpeaking: boolean) => {
    setNormanTalking(isSpeaking);
    
    if (!isSpeaking && turnBasedMode) {
      setCurrentSpeaker("Solara");
    }
  }, [turnBasedMode]);

  const handleNormanSendMessage = useCallback((message: string, attachments?: any[]) => {
    console.log(`Sending message to ${normanAGI.name}:`, message);
    
    if (attachments && attachments.length > 0) {
      console.log('With attachments:', attachments);
      toast({
        title: "Files attached",
        description: `${attachments.length} file(s) will be processed by ${normanAGI.name}.`,
      });
    }
    
    if (turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
  }, [turnBasedMode]);

  const handleSolaraMessage = useCallback((message: string, attachments?: File[]) => {
    console.log(`Message sent to ${solaraAGI.name}:`, message);
    
    if (attachments && attachments.length > 0) {
      console.log(`Files sent to ${solaraAGI.name}:`, attachments);
      toast({
        title: `${solaraAGI.name} processing files`,
        description: `${attachments.length} file(s) are being analyzed.`,
      });
    }
    
    if (turnBasedMode) {
      setCurrentSpeaker("Solara");
    }
  }, [turnBasedMode]);

  const handleSolaraResponse = useCallback((response: string) => {
    if (turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
    
    setSolaraTalking(true);
  }, [turnBasedMode]);

  const handleSolaraSpeakToggle = useCallback((isSpeaking: boolean) => {
    setSolaraTalking(isSpeaking);
    
    if (!isSpeaking && turnBasedMode) {
      setCurrentSpeaker("Norman AGI");
    }
  }, [turnBasedMode]);

  const handleWebViewVoiceInput = useCallback((text: string, viewIndex: number) => {
    console.log(`Voice input from web view ${viewIndex}: ${text}`);
    
    if (voiceTarget === "norman" || (voiceTarget === "current" && currentSpeaker === "Norman AGI")) {
      if (chatInterfaceRef.current) {
        chatInterfaceRef.current.handleVoiceInput(text);
      }
    } else if (voiceTarget === "solara" || (voiceTarget === "current" && currentSpeaker === "Solara")) {
      if (chatInterface2Ref.current) {
        chatInterface2Ref.current.handleVoiceInput(text);
      }
    }
  }, [currentSpeaker, voiceTarget]);

  const toggleTurnBasedMode = () => {
    setTurnBasedMode(!turnBasedMode);
    toast({
      title: turnBasedMode ? "Free Discussion Mode" : "Turn-Based Discussion Mode",
      description: turnBasedMode ? 
        "AIs can speak at any time." : 
        `Sequential turns: ${currentSpeaker} → Next AGI`,
    });
  };

  const toggleJoinDiscussion = () => {
    setIsJoined(!isJoined);
    toast({
      title: isJoined ? "Left Discussion" : "Joined Discussion",
      description: isJoined ? 
        "You have left the AI discussion." : 
        "You have joined the AI discussion. You can now participate.",
    });
  };

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

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      if (voiceUIRef.current) {
        voiceUIRef.current.startListening();
      }
    } else {
      if (voiceUIRef.current) {
        voiceUIRef.current.stopListening();
      }
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      if (voiceUIRef.current) {
        voiceUIRef.current.stopSpeaking();
      }
    }
  };

  const handleVoiceTargetChange = (value: string) => {
    setVoiceTarget(value);
    toast({
      title: "Voice Target Changed",
      description: value === "current" 
        ? "Voice commands will go to the current speaker" 
        : `Voice commands will go to ${value === "norman" ? "Norman AGI" : "Solara"}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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

            <Select
              value={voiceTarget}
              onValueChange={handleVoiceTargetChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Voice Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Speaker</SelectItem>
                <SelectItem value="norman">Norman AGI</SelectItem>
                <SelectItem value="solara">Solara</SelectItem>
              </SelectContent>
            </Select>

            <button 
              onClick={toggleSpeaking}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
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
                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
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
        </div>
      </div>
      
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
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 flex flex-col border-r overflow-hidden">
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
        
        <div className="w-2/3 p-4 overflow-hidden">
          <SplitWebView 
            onVoiceInput={handleWebViewVoiceInput}
            onSpeakToggle={(isSpeaking, viewIndex) => {
              console.log(`Web view ${viewIndex} speaking state: ${isSpeaking}`);
            }}
          />
        </div>
      </div>
      
      <VoiceUI 
        ref={voiceUIRef}
        onUserSpeech={handleUserSpeech}
        onSpeakToggle={(isSpeaking) => console.log('Voice UI speaking:', isSpeaking)}
      />
    </div>
  );
};

export default Index;
