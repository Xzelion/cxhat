"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useConnection() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const subscription = supabase.channel('system')
      .subscribe((status) => {
        setIsOnline(status === 'SUBSCRIBED');
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      subscription.unsubscribe();
    };
  }, []);

  return isOnline;
}