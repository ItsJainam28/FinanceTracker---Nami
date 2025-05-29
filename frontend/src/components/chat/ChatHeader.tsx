// components/chat/ChatHeader.tsx
import React from 'react';
import { ArrowLeft, Settings, Share, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatSession } from '@/api/assistant';

interface ChatHeaderProps {
  session: ChatSession;
}

export function ChatHeader({ session }: ChatHeaderProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-gray-900 truncate">{session.title}</h1>
          <p className="text-sm text-gray-500">
            Created {formatDate(session.createdAt)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 flex-shrink-0">
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share chat"
        >
          <Share className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Chat settings"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="More options"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}