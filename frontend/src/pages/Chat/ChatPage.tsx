// pages/ChatPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { getChatSession, getChatMessages, ChatSession, ChatMessage } from '@/api/assistant';

export function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMessagesUpdate = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  };

  useEffect(() => {
    const loadChatData = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load session details
        const sessionResponse = await getChatSession(sessionId);
        if (sessionResponse.data.success) {
          setSession(sessionResponse.data.data);
        } else {
          throw new Error(sessionResponse.data.error || 'Failed to load session');
        }
        
        // Load messages for this session
        const messagesResponse = await getChatMessages(sessionId);
        if (messagesResponse.data.success) {
          setMessages(messagesResponse.data.data || []);
        } else {
          console.warn('No messages found or failed to load messages');
          setMessages([]);
        }
        
      } catch (err: any) {
        console.error('Failed to load chat data:', err);
        setError(err?.response?.data?.error || err?.message || 'Failed to load chat session');
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [sessionId]);

  const handleBackToSidebar = () => {
    navigate('/'); // or wherever your main app is
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error || 'Session not found'}</p>
          </div>
          <button 
            onClick={handleBackToSidebar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ChatInterface 
        session={session}
        initialMessages={messages}
        onMessagesUpdate={handleMessagesUpdate}
      />
    </div>
  );
}