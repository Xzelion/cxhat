import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChatUser } from '@/lib/types';
import { supabase } from '@/lib/supabase';

const USER_STORAGE_KEY = 'chatUser';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export function useAuth() {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const validateStoredUser = useCallback(async (storedUser: ChatUser) => {
    try {
      const { data, error } = await supabase
        .from('chat_users')
        .select()
        .eq('id', storedUser.id)
        .single();

      if (error || !data) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }

      const storedTime = new Date(storedUser.created_at).getTime();
      if (Date.now() - storedTime > SESSION_TIMEOUT) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUserData = localStorage.getItem(USER_STORAGE_KEY);
        if (!storedUserData) {
          router.push('/');
          return;
        }

        const storedUser = JSON.parse(storedUserData);
        const validUser = await validateStoredUser(storedUser);

        if (!validUser) {
          router.push('/');
          return;
        }

        setUser(validUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [router, validateStoredUser]);

  return { user, loading };
}