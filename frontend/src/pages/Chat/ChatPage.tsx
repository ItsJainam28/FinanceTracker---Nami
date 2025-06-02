// pages/ChatPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { getChatSession, getChatMessages, ChatSession, ChatMessage } from '@/api/assistant';
import { Button } from "@/components/ui/button";
import { NavigationBar } from '@/components/common/Navigationbar';

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
const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: session?.title || 'Chat Session', isCurrentPage: true }
  ];

  useEffect(() => {
    const loadChatData = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const sessionResponse = await getChatSession(sessionId);
        if (sessionResponse.data.success) {
          setSession(sessionResponse.data.data);
        } else {
          throw new Error(sessionResponse.data.error || 'Failed to load session');
        }

        const messagesResponse = await getChatMessages(sessionId);
        if (messagesResponse.data.success) {
          setMessages(messagesResponse.data.data || []);
        } else {
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
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        <NavigationBar items={breadcrumbItems} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
            <NavigationBar items={breadcrumbItems} />
        <div className="text-center max-w-md mx-auto p-6 border border-border rounded-lg bg-muted">
          <div className="text-destructive mb-4 text-sm font-medium">{error || 'Session not found'}</div>
          <Button onClick={handleBackToSidebar} variant="default">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
          <NavigationBar items={breadcrumbItems} />
      <ChatInterface
        session={session}
        initialMessages={messages}
        onMessagesUpdate={handleMessagesUpdate}
      />
    </div>
  );
}
