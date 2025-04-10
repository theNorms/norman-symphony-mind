
import React, { useState, useRef, useEffect } from 'react';
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

interface ChatInterface2Props {
  title?: string;
  aiName?: string;
  onSendMessage?: (message: string, attachments?: File[]) => void;
  onClear?: () => void;
}

const ChatInterface2: React.FC<ChatInterface2Props> = ({
  title = "Secondary AI",
  aiName = "Solara",
  onSendMessage = () => {},
  onClear = () => {}
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm ${aiName}. How can I assist you today?`,
      isUser: false,
      isComplete: true
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() && attachments.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput || (attachments.length > 0 ? "Sending attachments..." : ""),
      isUser: true,
      isComplete: true,
      attachments: attachments.length > 0 ? attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })) : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSendMessage(currentInput, attachments.length > 0 ? attachments : undefined);
    setCurrentInput('');
    setAttachments([]);
    
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

  // Handle file attachment
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

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExpanded]);

  return (
    <div className="relative w-96 border rounded-lg shadow-lg overflow-hidden">
      <div 
        className="flex justify-between items-center p-2 bg-primary text-primary-foreground cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold">{title} ({aiName})</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-foreground hover:text-primary-foreground/80 h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
            setMessages([{
              id: Date.now().toString(),
              text: `Chat cleared. I'm ${aiName}. How can I assist you?`,
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
          isExpanded ? "max-h-96" : "max-h-0"
        )}
      >
        <ScrollArea className="p-3 h-64">
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
                onClick={handleAttachFile}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                disabled={isStreaming}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
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
    </div>
  );
};

export default ChatInterface2;
