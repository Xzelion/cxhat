"use client";

import { useState, useCallback, useRef } from 'react';
import { Message } from '@/lib/types';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 50;

export function useMessagePagination() {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastMessageRef = useRef<string | null>(null);

  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const query = supabase
        .from('messages')
        .select(`*, chat_users (nickname, avatar_url)`)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (lastMessageRef.current) {
        query.lt('created_at', lastMessageRef.current);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
      
      if (data.length > 0) {
        lastMessageRef.current = data[data.length - 1].created_at;
      }

      return data.reverse();
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { loading, hasMore, loadMoreMessages };
}