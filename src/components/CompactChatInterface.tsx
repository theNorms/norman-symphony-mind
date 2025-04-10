
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
  aiName?: string;
  onSendMessage?: (message: string, attachments?: File[]) => void;
  onClear?: () => void;
}

const CompactChatInterface: React.FC<CompactChatInterfaceProps> = ({
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
      isComplete: true
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
    <div className="relative w-full border rounded-lg shadow-lg overflow-hidden">
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
        
        {attachments.length > 0 && (
          <div className="px-2 py-1 border-t">
            <div className="flex flex-wrap gap-1">
              {attachments.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-muted rounded-md px-2 py-1 text-xs"
                >
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button 
                    onClick={() => removeAttachment(index)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="p-2 border-t">
          <div className="flex gap-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your message..."
              className="text-sm"
              disabled={isStreaming}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              className="hidden" 
            />
            <Button 
              type="button" 
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleAttachFile}
              disabled={isStreaming}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              type="submit" 
              disabled={isStreaming || (!currentInput.trim() && attachments.length === 0)}
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
