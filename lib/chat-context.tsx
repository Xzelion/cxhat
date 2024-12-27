"use client";

import { createContext, useContext } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';

const ChatContext = createContext<ReturnType<typeof useChatState> | undefined>(undefined);

function useChatState() {
  const { user, loading: authLoading } = useAuth();
  const { messages, isLoading: messagesLoading, error, sendMessage } = useMessages();
  const onlineUsers = usePresence(user?.id || '');

  return {
    user,
    messages,
    onlineUsers,
    loading: authLoading || messagesLoading,
    error,
    sendMessage: async (content: string) => {
      if (!user) throw new Error('No user found');
      await sendMessage(content, user.id);
    },
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const state = useChatState();

  return (
    <ChatContext.Provider value={state}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}