// components/chat/MessageBubble.tsx
import React from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import { ChatMessage } from '@/api/assistant';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';
  
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-[85%] md:max-w-[70%]`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 text-white ml-3' : 'bg-gray-200 text-gray-600 mr-3'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        
        {/* Message bubble */}
        <div className={`group relative rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
        }`}>
          {/* Message content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm whitespace-pre-wrap leading-relaxed m-0">{message.content}</p>
          </div>
          
          {/* Timestamp and actions */}
          <div className={`flex items-center justify-between mt-2 pt-1 ${
            isUser ? 'border-t border-blue-500' : 'border-t border-gray-100'
          }`}>
            <p className={`text-xs ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(message.createdAt)}
            </p>
            
            {/* Copy button for assistant messages */}
            {!isUser && (
              <button
                onClick={copyToClipboard}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all duration-200 ml-2"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}