"use client";

import { useState, useCallback } from 'react';
import { MessageWithStatus } from '@/lib/types';

export function useMessageQueue() {
  const [queue, setQueue] = useState<MessageWithStatus[]>([]);

  const addToQueue = useCallback((message: MessageWithStatus) => {
    setQueue(prev => [...prev, message]);
  }, []);

  const removeFromQueue = useCallback((messageId: string) => {
    setQueue(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return { queue, addToQueue, removeFromQueue };
}