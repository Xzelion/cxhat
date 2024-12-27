"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { createGuestUser } from '@/lib/chat';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleJoinAsGuest = async () => {
    if (!nickname.trim()) return;
    
    setIsLoading(true);
    try {
      const user = await createGuestUser(nickname);
      if (user) {
        // Store user info in localStorage for persistence
        localStorage.setItem('chatUser', JSON.stringify(user));
        router.push('/chat');
      } else {
        toast({
          title: "Error",
          description: "Failed to create guest user. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 text-3xl font-bold">Welcome to Minnit Chat</h1>
          <p className="mt-2 text-muted-foreground">
            Join instantly as a guest or sign in to access more features
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full"
            maxLength={30}
          />
          <Button
            onClick={handleJoinAsGuest}
            className="w-full"
            disabled={!nickname.trim() || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join as Guest'}
          </Button>
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Want more features?{' '}
              <a href="/auth" className="text-primary hover:underline">
                Sign up here
              </a>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}