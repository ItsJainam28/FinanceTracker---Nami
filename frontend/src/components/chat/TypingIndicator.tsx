import React from 'react';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[85%] md:max-w-[70%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>

        {/* Typing bubble */}
        <div className="bg-muted border border-border rounded-lg px-4 py-3 shadow-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <span className="text-xs">AI is typing...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
