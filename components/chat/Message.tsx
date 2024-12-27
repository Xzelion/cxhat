"use client";

import { MessageWithStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageProps {
  message: MessageWithStatus;
  isCurrentUser: boolean;
}

export default function Message({ message, isCurrentUser }: MessageProps) {
  return (
    <div className={`flex items-start gap-2 ${
      isCurrentUser ? 'flex-row-reverse' : ''
    }`}>
      <Avatar className="h-8 w-8">
        <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium">
          {message.chat_users?.nickname?.[0]?.toUpperCase() || '?'}
        </div>
      </Avatar>
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {message.chat_users?.nickname || 'Unknown'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
            })}
          </span>
          {message.status === 'sending' && (
            <span className="text-xs text-muted-foreground">Sending...</span>
          )}
          {message.status === 'error' && message.retry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={message.retry}
              className="h-6 px-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}
        </div>
        
        <div className={`mt-1 rounded-lg px-3 py-2 max-w-[80%] break-words ${
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}