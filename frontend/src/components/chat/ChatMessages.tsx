// components/chat/ChatMessages.tsx
import React from 'react';
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isLoading ? (
        <div className="text-center text-gray-500 mt-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-500">Type a message below to begin chatting with the AI assistant.</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))
      )}
      
      {isLoading && <TypingIndicator />}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium mb-1">Failed to send message</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center space-x-2 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
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