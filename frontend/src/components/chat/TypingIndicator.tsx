import React from 'react';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[85%] md:max-w-[70%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
          </div>
        </div>
      </div>
    </div>
  );
}