import { supabase } from './supabase';
import type { Message, ChatUser } from './types';

export async function sendMessage(content: string, userId: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ content, user_id: userId }])
    .select(`
      *,
      chat_users (
        nickname,
        avatar_url
      )
    `)
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return data;
}

export async function getMessages(limit = 50): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      chat_users (
        nickname,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data.reverse();
}

export function subscribeToMessages(callback: (message: Message) => void) {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload) => {
        // Fetch complete message data including user info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            chat_users (
              nickname,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();
          
        if (data) {
          callback(data);
        }
      }
    )
    .subscribe();
}