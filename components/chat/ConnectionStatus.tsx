"use client";

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connected",
        description: "You're back online",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Disconnected",
        description: "Check your internet connection",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>Connection lost. Reconnecting...</span>
    </div>
  );
}