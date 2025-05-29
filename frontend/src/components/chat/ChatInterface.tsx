// components/chat/ChatInterface.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { streamAssistantReply, ChatSession, ChatMessage } from '@/api/assistant';

interface ChatInterfaceProps {
  session: ChatSession;
  initialMessages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
}

export function ChatInterface({ 
  session, 
  initialMessages, 
  onMessagesUpdate 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingContentRef = useRef<string>('');
  const streamingMessageIdRef = useRef<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update messages when initialMessages change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Throttled update function to prevent excessive re-renders
  const updateStreamingMessage = useCallback((messageId: string, content: string) => {
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Throttle updates to every 100ms
    updateTimeoutRef.current = setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, content }
            : msg
        )
      );
    }, 100);
  }, []);

  // Immediate update function for final content
  const finalizeStreamingMessage = useCallback((messageId: string, content: string) => {
    // Clear any pending throttled updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    // Immediately update with final content
    setMessages(prev => 
      prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, content: content.trim() }
          : msg
      )
    );
  }, []);

  // Auto-scroll to bottom when new messages arrive (with debouncing)
  useEffect(() => {
    // Clear existing scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce scroll updates to prevent excessive scrolling during streaming
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'  // Less aggressive scrolling
      });
    }, 150);
    
    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]);

  // Update parent component when messages change
  useEffect(() => {
    onMessagesUpdate(messages);
  }, [messages, onMessagesUpdate]);

  // Cleanup function to abort streaming if component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message immediately with temporary ID
    const tempUserMessage: ChatMessage = {
      _id: `temp-user-${Date.now()}`,
      content: content.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
      sessionId: session._id
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);
    setError(null);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Create temporary assistant message for streaming
    const tempAssistantMessage: ChatMessage = {
      _id: `temp-assistant-${Date.now()}`,
      content: '',
      role: 'assistant',
      createdAt: new Date().toISOString(),
      sessionId: session._id
    };

    try {
      const response = await streamAssistantReply(session._id, content);
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      const reader = response.data;
      const decoder = new TextDecoder();
      let buffer = '';

      // Reset streaming refs
      streamingContentRef.current = '';
      streamingMessageIdRef.current = tempAssistantMessage._id;

      // Add the empty assistant message to show it's starting to respond
      setMessages(prev => [...prev, tempAssistantMessage]);

      while (true) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              // Stream completed - finalize with accumulated content
              finalizeStreamingMessage(tempAssistantMessage._id, streamingContentRef.current);
              streamingContentRef.current = '';
              streamingMessageIdRef.current = null;
              return;
            }
            
            // Accumulate the streaming content
            streamingContentRef.current += data;
            
            // Throttled update to prevent excessive re-renders
            updateStreamingMessage(tempAssistantMessage._id, streamingContentRef.current);
            
          } else if (line.startsWith('event: error')) {
            // Handle error events
            const nextLine = lines[lines.indexOf(line) + 1];
            const errorData = nextLine?.startsWith('data: ') ? nextLine.slice(6) : 'An error occurred';
            throw new Error(errorData);
          }
        }
      }

    } catch (err: any) {
      console.error('Streaming error:', err);
      
      // Check if it was aborted
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        setError('Request was cancelled');
      } else {
        setError(
          err?.response?.data?.error || 
          err?.message || 
          'Failed to get response. Please try again.'
        );
      }
      
      // Remove temporary messages on error
      setMessages(prev => prev.filter(msg => 
        !msg._id.startsWith('temp-user-') && !msg._id.startsWith('temp-assistant-')
      ));
      
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      streamingContentRef.current = '';
      streamingMessageIdRef.current = null;
      
      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    // Get the last user message and resend it
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  // Combine regular messages with streaming message for display
  const displayMessages = [...messages];
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <ChatHeader session={session} />
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatMessages 
          messages={displayMessages}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? "AI is responding..." : "Type your message..."}
      />
    </div>
  );
}