
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

export interface ChatInterface2Handle {
  handleVoiceInput: (text: string) => void;
  clearChat: () => void;
  sendMessage: (text: string, attachments?: File[]) => void;
}

interface ChatInterface2Props {
  title?: string;
  aiName?: string;
  onSendMessage?: (message: string, attachments?: File[]) => void;
  onAIResponse?: (response: string) => void;
  onClear?: () => void;
  onSpeakToggle?: (isSpeaking: boolean) => void;
}

const ChatInterface2 = forwardRef<ChatInterface2Handle, ChatInterface2Props>(({
  title = "Group Participant",
  aiName = "Solara",
  onSendMessage = () => {},
  onAIResponse = () => {},
  onClear = () => {},
  onSpeakToggle = () => {}
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm ${aiName}. I'm here to assist with the group discussion about the election mission in ${aiName === "Solara" ? "Imus, Cavite" : "your location"}.`,
      isUser: false,
      isComplete: true
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      text: `Chat cleared. I'm ${aiName}. How can I assist with our discussion?`,
      isUser: false,
      isComplete: true
    }]);
    onClear();
  };

  const sendMessage = (text: string, files?: File[]) => {
    if (!text.trim() && (!files || files.length === 0)) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text || (files && files.length > 0 ? "Sending attachments..." : ""),
      isUser: true,
      isComplete: true,
      attachments: files ? files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })) : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSendMessage(text, files);
    
    simulateResponseStreaming(text);
  };

  useImperativeHandle(ref, () => ({
    handleVoiceInput: (text: string) => {
      if (text.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: text,
          isUser: true,
          isComplete: true
        };
        
        setMessages(prev => [...prev, userMessage]);
        onSendMessage(text);
        
        simulateResponseStreaming(text);
      }
    },
    clearChat,
    sendMessage
  }));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() && attachments.length === 0) return;
    
    sendMessage(currentInput, attachments.length > 0 ? attachments : undefined);
    setCurrentInput('');
    setAttachments([]);
  };

  const simulateResponseStreaming = (userMessage?: string) => {
    const responseId = (Date.now() + 1).toString();
    let fullResponse = "I'm analyzing your request and preparing a response...";
    
    if (aiName === "Solara" && userMessage) {
      if (userMessage.toLowerCase().includes("election") || userMessage.toLowerCase().includes("candidate")) {
        fullResponse = "I'm analyzing potential candidates in Imus, Cavite based on their track records, ethics, and alignment with smart city initiatives. This requires checking public service history and ensuring they have no involvement with corruption.";
      } else if (userMessage.toLowerCase().includes("smart city")) {
        fullResponse = "Smart city implementation in Imus, Cavite requires trustworthy leadership focused on sustainable development and technology integration. I can help identify which candidates have the vision and integrity for this transformation.";
      }
    }
    
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
    onSpeakToggle(true);
    
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
        
        // Simulate the end of speech after a few seconds
        setTimeout(() => {
          onSpeakToggle(false);
        }, 5000);
      }
    }, 50);
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
      
      toast({
        title: "Files attached",
        description: `${newFiles.length} file(s) ready to send.`,
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-3 h-[calc(100%-80px)]">
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
      
      {attachments.length > 0 && (
        <div className="p-2 bg-muted/30">
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
      
      <form onSubmit={handleSendMessage} className="p-3 mt-auto">
        <div className="flex items-center">
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
              onClick={handleAttachFile}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              disabled={isStreaming}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          
          <Button 
            type="submit" 
            disabled={isStreaming || (!currentInput.trim() && attachments.length === 0)}
            size="icon"
            className="ml-2"
          >
            <Upload className="w-4 h-4" />
          </Button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
          />
        </div>
      </form>
    </div>
  );
});

ChatInterface2.displayName = "ChatInterface2";

export default ChatInterface2;
