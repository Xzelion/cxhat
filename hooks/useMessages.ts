import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageHandler } from '@/lib/message-handler';
import type { Message, MessageWithStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase';

const MESSAGE_LIMIT = 50;

export function useMessages() {
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastMessageRef = useRef<string | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initial messages load
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        const initialMessages = await MessageHandler.fetchMessages(MESSAGE_LIMIT);
        setMessages(initialMessages.map(msg => ({ ...msg, status: 'sent' })));
        if (initialMessages.length > 0) {
          lastMessageRef.current = initialMessages[0].created_at;
        }
        setHasMore(initialMessages.length === MESSAGE_LIMIT);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();

    // Set up real-time subscription
    subscriptionRef.current = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          try {
            const { data } = await supabase
              .from('messages')
              .select(`*, chat_users (nickname, avatar_url)`)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setMessages(prev => [...prev, { ...data, status: 'sent' }]);
            }
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore || !lastMessageRef.current) return;

    setLoadingMore(true);
    try {
      const olderMessages = await MessageHandler.fetchMessages(
        MESSAGE_LIMIT,
        lastMessageRef.current
      );

      if (olderMessages.length < MESSAGE_LIMIT) {
        setHasMore(false);
      }

      if (olderMessages.length > 0) {
        lastMessageRef.current = olderMessages[0].created_at;
        setMessages(prev => [
          ...olderMessages.map(msg => ({ ...msg, status: 'sent' })),
          ...prev
        ]);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  const sendMessage = useCallback(async (content: string, userId: string) => {
    const optimisticId = crypto.randomUUID();
    const optimisticMessage: MessageWithStatus = {
      id: optimisticId,
      content,
      user_id: userId,
      type: 'text',
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const sentMessage = await MessageHandler.sendMessage(content, userId);
      if (sentMessage) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === optimisticId
              ? { ...sentMessage, status: 'sent' }
              : msg
          )
        );
      }
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticId
            ? {
                ...msg,
                status: 'error',
                retry: async () => {
                  await sendMessage(content, userId);
                }
              }
            : msg
        )
      );
      throw error;
    }
  }, []);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMoreMessages,
    sendMessage
  };
}