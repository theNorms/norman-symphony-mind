
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isComplete: boolean;
};

interface CompactChatInterfaceProps {
  title?: string;
  onSendMessage?: (message: string) => void;
  onClear?: () => void;
}

const CompactChatInterface: React.FC<CompactChatInterfaceProps> = ({
  title = "Secondary AI",
  onSendMessage = () => {},
  onClear = () => {}
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! How can I assist you today?",
      isUser: false,
      isComplete: true
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    
    // Simulate AI response
    simulateResponseStreaming();
  };

  const simulateResponseStreaming = () => {
    const responseId = (Date.now() + 1).toString();
    const fullResponse = "I'm analyzing your request and preparing a response...";
    
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
      }
    }, 50);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExpanded]);

  return (
    <div className="relative w-full border rounded-lg shadow-lg overflow-hidden">
      <div 
        className="flex justify-between items-center p-2 bg-primary text-primary-foreground cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-foreground hover:text-primary-foreground/80 h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
            setMessages([{
              id: Date.now().toString(),
              text: "Chat cleared. How can I assist you?",
              isUser: false,
              isComplete: true
            }]);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-64" : "max-h-0"
        )}
      >
        <div className="p-3 max-h-64 overflow-y-auto">
          <div className="space-y-3">
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
                    "max-w-[85%] rounded-lg p-2 text-sm",
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
        </div>
        
        <form onSubmit={handleSendMessage} className="p-2 border-t">
          <div className="flex gap-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your message..."
              className="text-sm"
              disabled={isStreaming}
            />
            <Button 
              type="submit" 
              disabled={isStreaming || !currentInput.trim()}
              size="icon"
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompactChatInterface;
