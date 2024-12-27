"use client";

import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { MessageSquare } from 'lucide-react';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import OnlineUsers from '@/components/chat/OnlineUsers';
import { useToast } from '@/components/ui/use-toast';

export default function ChatRoom() {
  const { user, loading: authLoading } = useAuth();
  const { 
    messages, 
    loading: messagesLoading, 
    loadingMore,
    hasMore,
    loadMoreMessages,
    sendMessage 
  } = useMessages();
  const onlineUsers = usePresence(user?.id);
  const { toast } = useToast();

  if (!user || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content, user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <OnlineUsers users={onlineUsers} />
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-card/95">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Main Chat Room</h1>
          </div>
        </div>

        <MessageList 
          messages={messages}
          currentUserId={user.id}
          loading={messagesLoading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
        />

        <div className="p-4 border-t border-border bg-card/95">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}