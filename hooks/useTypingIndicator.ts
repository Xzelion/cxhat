"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import debounce from 'lodash/debounce';

const TYPING_TIMEOUT = 3000;

export function useTypingIndicator(userId: string, channelId: string = 'main') {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const setTyping = useCallback(debounce(async (isTyping: boolean) => {
    await supabase.channel(`typing:${channelId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping }
      });
  }, 300), [userId, channelId]);

  useEffect(() => {
    const channel = supabase.channel(`typing:${channelId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          if (payload.isTyping) {
            next.add(payload.userId);
          } else {
            next.delete(payload.userId);
          }
          return next;
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelId]);

  return { typingUsers, setTyping };
}