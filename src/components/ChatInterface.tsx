
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isComplete: boolean;
};

export interface ChatInterfaceHandle {
  handleVoiceInput: (transcript: string) => void;
  addAIMessage: (text: string) => void;
}

interface ChatInterfaceProps {
  onSendMessage?: (message: string) => void;
  onAIResponse?: (response: string) => void;
}

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>((
  { onSendMessage = () => {}, onAIResponse = () => {} },
  ref
) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello, I'm Norman AGI. How can I assist you today?",
      isUser: false,
      isComplete: true
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true,
      isComplete: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSendMessage(currentInput);
    setCurrentInput('');
    
    // Simulate AGI response streaming
    simulateResponseStreaming();
  };

  // Add a method to handle voice input
  const handleVoiceInput = (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Add user message from voice
    const userMessage: Message = {
      id: Date.now().toString(),
      text: transcript,
      isUser: true,
      isComplete: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSendMessage(transcript);
    
    // Simulate AGI response streaming
    simulateResponseStreaming();
  };

  const simulateResponseStreaming = () => {
    const responseId = (Date.now() + 1).toString();
    const fullResponse = "I'm processing your request based on my Reflective Awareness Module and Emotional Intelligence Suite. Let me think through this with my Symbolic Neural Modularity approach...";
    
    // Add initial empty response
    setMessages(prev => [
      ...prev, 
      {
        id: responseId,
        text: "",
        isUser: false,
        isComplete: false
      }
    ]);
    
    setIsStreaming(true);
    
    // Simulate streaming text
    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < fullResponse.length) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, text: fullResponse.slice(0, currentIndex + 1) } 
              : msg
          )
        );
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, isComplete: true } 
              : msg
          )
        );
        onAIResponse(fullResponse);
      }
    }, 50);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    handleVoiceInput,
    addAIMessage: (text: string) => {
      const responseId = Date.now().toString();
      setMessages(prev => [
        ...prev, 
        {
          id: responseId,
          text,
          isUser: false,
          isComplete: true
        }
      ]);
      onAIResponse(text);
    }
  }));

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-96 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="p-3 bg-primary text-primary-foreground font-semibold">
        Norman AGI Assistant
      </div>
      
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[85%] rounded-lg p-3",
                  message.isUser 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted rounded-tl-none"
                )}
              >
                <p>{message.text}</p>
                {!message.isComplete && (
                  <span className="inline-block ml-1 animate-pulse">▌</span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 rounded-md border"
            disabled={isStreaming}
          />
          <button 
            type="submit" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            disabled={isStreaming || !currentInput.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
