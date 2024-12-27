"use client";

import { Users } from 'lucide-react';
import { ChatUser } from '@/lib/types';

interface OnlineUsersProps {
  users: ChatUser[];
}

export default function OnlineUsers({ users }: OnlineUsersProps) {
  return (
    <div className="w-64 border-r border-border bg-card/95 hidden md:flex md:flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-primary" />
          Online Users ({users.length})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2 py-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-foreground">{user.nickname}</span>
          </div>
        ))}
      </div>
    </div>
  );
}