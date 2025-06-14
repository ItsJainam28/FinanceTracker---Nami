import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '@/api/assistant';
import { RefreshCw } from 'lucide-react';
interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ChatMessages({ messages, isLoading, error, onRetry }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.length === 0 && !isLoading ? (
        <div className="text-center text-muted-foreground mt-12">
          <div className="bg-muted rounded-xl border border-border p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Start a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Type a message below to begin chatting with the AI assistant.
            </p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))
      )}

      {isLoading && <TypingIndicator />}

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Failed to send message</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-2 text-sm text-destructive hover:underline transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
