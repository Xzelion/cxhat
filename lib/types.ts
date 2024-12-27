export interface ChatUser {
  id: string;
  nickname: string;
  avatar_url?: string;
  is_guest: boolean;
  last_seen: string;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  user_id: string;
  type: string;
  created_at: string;
  chat_users?: ChatUser;
}

export interface MessageWithStatus extends Message {
  status: 'sending' | 'sent' | 'error';
  retry?: () => Promise<void>;
}

export interface TypingIndicator {
  userId: string;
  nickname: string;
}