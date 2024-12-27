import { useState, useEffect } from 'react';
import { updatePresence, subscribeToPresence } from '@/lib/presence';
import type { ChatUser } from '@/lib/types';

const PRESENCE_INTERVAL = 15000; // 15 seconds

export function usePresence(userId: string | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Update presence immediately
    updatePresence(userId);

    // Set up periodic presence updates
    const interval = setInterval(() => {
      updatePresence(userId);
    }, PRESENCE_INTERVAL);

    // Subscribe to presence changes
    const subscription = subscribeToPresence(setOnlineUsers);

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [userId]);

  return onlineUsers;
}