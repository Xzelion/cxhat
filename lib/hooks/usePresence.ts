"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatUser } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

const PRESENCE_INTERVAL = 30000; // 30 seconds
const RETRY_DELAYS = [1000, 2000, 5000]; // Retry delays in milliseconds

export function usePresence(userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const { toast } = useToast();
  
  const updatePresence = useCallback(async (retryCount = 0) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('presence')
        .upsert({
          user_id: userId,
          last_ping: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
      
      // Retry with exponential backoff
      if (retryCount < RETRY_DELAYS.length) {
        setTimeout(() => {
          updatePresence(retryCount + 1);
        }, RETRY_DELAYS[retryCount]);
      } else {
        toast({
          title: "Connection Issue",
          description: "Having trouble staying connected. Please check your internet connection.",
          variant: "destructive",
        });
      }
    }
  }, [userId, toast]);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const { data: presenceData } = await supabase
        .from('presence')
        .select('user_id')
        .gte('last_ping', new Date(Date.now() - PRESENCE_INTERVAL).toISOString());

      if (presenceData && presenceData.length > 0) {
        const userIds = presenceData.map(p => p.user_id);
        const { data: userData } = await supabase
          .from('chat_users')
          .select('*')
          .in('id', userIds);

        if (userData) {
          setOnlineUsers(userData);
        }
      } else {
        setOnlineUsers([]);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Initial presence update and user fetch
    updatePresence();
    fetchOnlineUsers();

    // Set up intervals
    const presenceInterval = setInterval(() => updatePresence(), PRESENCE_INTERVAL);
    const fetchInterval = setInterval(fetchOnlineUsers, PRESENCE_INTERVAL);

    // Set up real-time subscription
    const channel = supabase
      .channel('presence_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'presence' },
        fetchOnlineUsers
      )
      .subscribe();

    return () => {
      clearInterval(presenceInterval);
      clearInterval(fetchInterval);
      channel.unsubscribe();
    };
  }, [userId, updatePresence, fetchOnlineUsers]);

  return onlineUsers;
}