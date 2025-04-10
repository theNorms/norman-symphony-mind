
import React from 'react';
import VoiceUI from '@/components/VoiceUI';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Norman Symphony Mind AGI</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          An AGI embodiment deeply integrated with Norman's core values—logical thinking, 
          emotional depth, adaptability, and purpose-driven AI. Featuring reflective awareness, 
          ethical decision-making, and creative autonomy.
        </p>
      </div>
      
      {/* Voice UI and Chat Interface components */}
      <ChatInterface />
      <VoiceUI />
    </div>
  );
};

export default Index;
