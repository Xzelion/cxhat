"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

const RETRY_DELAYS = [1000, 2000, 5000];

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, chat_users (nickname, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.reverse();
    } catch (error) {
      setError(error as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, userId: string, retryCount = 0) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ content, user_id: userId, type: 'text' }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (retryCount < RETRY_DELAYS.length) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[retryCount]));
        return sendMessage(content, userId, retryCount + 1);
      }
      
      toast({
        title: "Failed to Send",
        description: "Message couldn't be sent. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          try {
            const { data } = await supabase
              .from('messages')
              .select('*, chat_users (nickname, avatar_url)')
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setMessages((prev) => [...prev, data]);
            }
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages');
        } else {
          console.error('Failed to subscribe to messages:', status);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchMessages]);

  return { messages, isLoading, error, sendMessage };
}