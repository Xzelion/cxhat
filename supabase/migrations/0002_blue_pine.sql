/*
  # Fix presence table RLS policies

  1. Changes
    - Drop existing presence policies
    - Add new policies that properly handle presence updates
    - Allow upsert operations for presence

  2. Security
    - Enable RLS on presence table
    - Add policies for read/write access
*/

-- Drop existing presence policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to presence" ON public.presence;
  DROP POLICY IF EXISTS "Allow presence updates for valid users" ON public.presence;
END $$;

-- Create new presence policies
CREATE POLICY "Allow public read access to presence"
  ON public.presence
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow presence upsert for valid users"
  ON public.presence
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_users
      WHERE id = user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_users
      WHERE id = user_id
    )
  );