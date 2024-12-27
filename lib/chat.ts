import { supabase } from './supabase';
import type { ChatUser } from './types';

export async function createGuestUser(nickname: string): Promise<ChatUser | null> {
  const { data, error } = await supabase
    .from('chat_users')
    .insert([
      {
        nickname,
        is_guest: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating guest user:', error);
    return null;
  }

  return data;
}