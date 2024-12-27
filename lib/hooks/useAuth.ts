"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChatUser } from '@/lib/types';

const USER_STORAGE_KEY = 'chatUser';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export function useAuth() {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateStoredUser = async () => {
      try {
        const storedUserData = localStorage.getItem(USER_STORAGE_KEY);
        if (!storedUserData) {
          router.push('/');
          return;
        }

        const storedUser = JSON.parse(storedUserData);
        const storedTime = new Date(storedUser.created_at).getTime();
        
        if (Date.now() - storedTime > SESSION_TIMEOUT) {
          localStorage.removeItem(USER_STORAGE_KEY);
          router.push('/');
          return;
        }

        const { data, error } = await supabase
          .from('chat_users')
          .select()
          .eq('id', storedUser.id)
          .single();

        if (error || !data) {
          localStorage.removeItem(USER_STORAGE_KEY);
          router.push('/');
          return;
        }

        setUser(data);
      } catch (error) {
        console.error('Auth initialization error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    validateStoredUser();
  }, [router]);

  return { user, loading };
}