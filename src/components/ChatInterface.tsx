
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, Paperclip } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isComplete: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    content?: string | ArrayBuffer | null;
  }>;
};

export interface ChatInterfaceHandle {
  handleVoiceInput: (transcript: string) => void;
  addAIMessage: (text: string) => void;
}

interface ChatInterfaceProps {
  onSendMessage?: (message: string, attachments?: any[]) => void;
  onAIResponse?: (response: string) => void;
}

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>((
  { onSendMessage = () => {}, onAIResponse = () => {} },
  ref
) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello, I'm Norman AGI. How can I assist you today? You can also attach files for analysis.",
      isUser: false,
      isComplete: true
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    name: string;
    type: string;
    size: number;
    content?: string | ArrayBuffer | null;
  }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() && attachments.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true,
      isComplete: true,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSendMessage(currentInput, attachments);
    setCurrentInput('');
    setAttachments([]);
    
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

  // Handle file attachment
  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    // Check file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File size exceeded",
        description: `Files must be smaller than 10MB.`,
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    // Process each file
    fileArray.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              size: file.size,
              content: event.target.result
            }
          ]);
        }
      };
      
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
                
                {/* Display attachments if any */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold">Attachments:</p>
                    {message.attachments.map((file, index) => (
                      <div key={index} className="text-xs bg-black/10 p-1 rounded flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      
      {/* Attachment display */}
      {attachments.length > 0 && (
        <div className="p-2 border-t bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="bg-primary/10 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Input form with file upload */}
      <form onSubmit={handleSendMessage} className="p-3 border-t">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your message..."
              className="pr-10"
              disabled={isStreaming}
            />
            <button 
              type="button" 
              onClick={triggerFileInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              disabled={isStreaming}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileAttachment} 
              className="hidden" 
              multiple 
            />
          </div>
          <Button 
            type="submit" 
            disabled={isStreaming || (!currentInput.trim() && attachments.length === 0)}
            size="icon"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
