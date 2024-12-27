/*
  # Initial Schema Setup for Minnit Chat Clone

  1. New Tables
    - chat_users: Stores user information for both guests and registered users
    - messages: Stores chat messages with support for text, GIFs, and system messages
    - presence: Tracks online users and their last activity

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and public access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chat_users table
CREATE TABLE IF NOT EXISTS public.chat_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname text NOT NULL,
  avatar_url text,
  is_guest boolean DEFAULT true,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  user_id uuid REFERENCES public.chat_users(id),
  type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- Create presence table
CREATE TABLE IF NOT EXISTS public.presence (
  user_id uuid REFERENCES public.chat_users(id),
  last_ping timestamptz DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

-- Policies for chat_users
CREATE POLICY "Allow public read access to chat_users"
  ON public.chat_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert for guests"
  ON public.chat_users
  FOR INSERT
  TO public
  WITH CHECK (is_guest = true);

-- Policies for messages
CREATE POLICY "Allow public read access to messages"
  ON public.messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert for valid users"
  ON public.messages
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_users
      WHERE id = user_id
    )
  );

-- Policies for presence
CREATE POLICY "Allow public read access to presence"
  ON public.presence
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow presence updates for valid users"
  ON public.presence
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_users
      WHERE id = user_id
    )
  );