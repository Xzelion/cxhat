import { supabase } from './supabase';
import type { ChatUser } from './types';

const PRESENCE_TIMEOUT = 30; // seconds
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 5000];

async function retryOperation<T>(
  operation: () => Promise<T>,
  retryCount = 0
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => 
        setTimeout(resolve, RETRY_DELAYS[retryCount])
      );
      return retryOperation(operation, retryCount + 1);
    }
    throw error;
  }
}

export async function updatePresence(userId: string) {
  const updateOperation = async () => {
    const { error } = await supabase
      .from('presence')
      .upsert(
        { 
          user_id: userId, 
          last_ping: new Date().toISOString() 
        },
        { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        }
      );

    if (error) throw error;
  };

  try {
    await retryOperation(updateOperation);
  } catch (error) {
    console.error('Error updating presence:', error);
  }
}

export function subscribeToPresence(callback: (users: ChatUser[]) => void) {
  // Initial fetch of online users
  fetchOnlineUsers().then(callback);

  // Subscribe to presence changes
  return supabase
    .channel('presence_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'presence',
        filter: `last_ping.gte.${new Date(Date.now() - PRESENCE_TIMEOUT * 1000).toISOString()}`
      },
      () => {
        fetchOnlineUsers().then(callback);
      }
    )
    .subscribe();
}

async function fetchOnlineUsers(): Promise<ChatUser[]> {
  try {
    const { data, error } = await supabase
      .from('chat_users')
      .select('*, presence!inner(*)')
      .gte(
        'presence.last_ping',
        new Date(Date.now() - PRESENCE_TIMEOUT * 1000).toISOString()
      );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching online users:', error);
    return [];
  }
}