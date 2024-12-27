"use client";

import { useEffect, useRef, useCallback } from 'react';
import { Message as MessageType } from '@/lib/types';
import Message from './Message';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  currentUserId: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function MessageList({
  messages,
  currentUserId,
  loading,
  loadingMore,
  hasMore,
  onLoadMore
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || loadingMore || !hasMore) return;

    if (container.scrollTop <= 100) {
      onLoadMore();
    }
  }, [loadingMore, hasMore, onLoadMore]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {hasMore && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Load more messages'
            )}
          </Button>
        </div>
      )}
      
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isCurrentUser={message.user_id === currentUserId}
        />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
}