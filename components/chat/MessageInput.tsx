"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="bg-muted border-border focus:ring-primary"
      />
      <Button 
        type="submit" 
        disabled={disabled || !message.trim()}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Send
      </Button>
    </form>
  );
}