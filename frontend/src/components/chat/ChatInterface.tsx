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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      setMessages(initialMessages);
      setIsInitialized(true);
    }
  }, [initialMessages, isInitialized]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
    return () => clearTimeout(timeout);
  }, [messages]);

  const updateParentMessages = useCallback(() => {
    onMessagesUpdate(messages);
  }, [messages, onMessagesUpdate]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      _id: `user-${Date.now()}`,
      content: content.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
      sessionId: session._id
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    
    abortControllerRef.current = new AbortController();
    let assistantMessage: ChatMessage | null = null;
    try {
      const response = await streamAssistantReply(session._id, content);
      if (!response.data) throw new Error('No response data received');

      const reader = response.data;
      const decoder = new TextDecoder();
      let buffer = '';
      let streamingContent = '';
      let firstTokenReceived = false; // Track if we've received the first token


      while (true) {
        if (abortControllerRef.current?.signal.aborted) break;
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              setMessages(prev =>
                prev.map(msg =>
                  msg._id === assistantMessage!._id
                    ? { ...msg, content: streamingContent.trim() }
                    : msg
                )
              );
              return;
            }
             // Hide typing indicator on first token
             if (!firstTokenReceived) {
              assistantMessage = {
                _id: `assistant-${Date.now()}`,
                content: '',
                role: 'assistant',
                createdAt: new Date().toISOString(),
                sessionId: session._id
              };
              setIsLoading(false);
              firstTokenReceived = true;
            }
            streamingContent += data;

            if (assistantMessage) {
              setMessages(prev => {
                const existingIndex = prev.findIndex(msg => msg._id === assistantMessage!._id);
                if (existingIndex >= 0) {
                  return prev.map(msg =>
                    msg._id === assistantMessage!._id
                      ? { ...msg, content: streamingContent }
                      : msg
                  );
                } else {
                  return [...prev, { ...assistantMessage!, content: streamingContent }];
                }
              });
            }

          } else if (line.startsWith('event: error')) {
            const nextLine = lines[lines.indexOf(line) + 1];
            const errorData = nextLine?.startsWith('data: ') ? nextLine.slice(6) : 'An error occurred';
            throw new Error(errorData);
          }
        }
      }

    } catch (err: any) {
      console.error('Streaming error:', err);
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        setError('Request was cancelled');
      } else {
        setError(err?.response?.data?.error || err?.message || 'Failed to get response. Please try again.');
      }
      setMessages(prev => prev.filter(msg => msg._id !== assistantMessage!._id));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      updateParentMessages();
      setMessages(prev => [...prev]);
    }
  };

  const handleRetry = () => {
    setError(null);
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <ChatHeader session={session} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 scrollbar-hide">
        <div className="flex flex-col gap-4">
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? "AI is responding..." : "Type your message..."}
      />
    </div>
  );
}
