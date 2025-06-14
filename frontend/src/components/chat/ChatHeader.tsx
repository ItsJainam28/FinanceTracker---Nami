import { ArrowLeft } from 'lucide-react';
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
        year: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="bg-background border-b border-border px-4 py-3 flex items-center space-x-3">
      <button
        onClick={() => navigate('/dashboard')}
        className="p-2 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
        title="Back to dashboard"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="font-semibold text-foreground truncate">{session.title}</h1>
        <p className="text-sm text-muted-foreground">
          Created {formatDate(session.createdAt)}
        </p>
      </div>
    </div>
  );
}
