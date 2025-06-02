import React from "react";
import { User, Bot, Copy, Check } from "lucide-react";
import { ChatMessage } from "@/api/assistant";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`flex ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start gap-3 max-w-[85%] md:max-w-[70%]`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-foreground ${
            isUser ? "ml-2" : "mr-2"
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Bubble */}
        <div className="group relative rounded-xl px-4 py-3 text-sm bg-muted text-foreground border border-border">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown>{message.content || ""}</ReactMarkdown>
            )}
          </div>

          {/* Footer: Timestamp & Copy */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
            <p>{formatTime(message.createdAt)}</p>

            {!isUser && (
              <button
                onClick={copyToClipboard}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all duration-200 ml-2"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
