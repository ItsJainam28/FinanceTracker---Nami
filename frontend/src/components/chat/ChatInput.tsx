import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-4xl px-4 py-4"
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-14 text-sm resize-none max-h-[160px] overflow-y-auto"
        />

        {/* Button inside the textarea wrapper */}
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled}
          className="absolute bottom-2.5 right-2.5 h-8 w-8 p-2 rounded-full shadow bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          title="Send"
        >
          {disabled ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3">
        Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for newline
      </p>
    </form>
  );
}
