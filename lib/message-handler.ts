import { supabase } from './supabase';
import type { Message } from './types';

export class MessageHandler {
  private static retryDelays = [1000, 2000, 5000]; // Progressive retry delays
  private static maxRetries = 3;

  static async sendMessage(
    content: string, 
    userId: string, 
    retryCount = 0
  ): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ 
          content, 
          user_id: userId,
          type: 'text',
          created_at: new Date().toISOString()
        }])
        .select(`*, chat_users (nickname, avatar_url)`)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Send message attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelays[retryCount])
        );
        return this.sendMessage(content, userId, retryCount + 1);
      }
      throw error;
    }
  }

  static async fetchMessages(
    limit: number,
    beforeTimestamp?: string
  ): Promise<Message[]> {
    try {
      let query = supabase
        .from('messages')
        .select(`*, chat_users (nickname, avatar_url)`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (beforeTimestamp) {
        query = query.lt('created_at', beforeTimestamp);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.reverse();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
}