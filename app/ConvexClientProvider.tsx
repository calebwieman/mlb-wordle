'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

// Generate unique user ID
export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('mlb-wordle-user-id');
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mlb-wordle-user-id', userId);
  }
  return userId;
}
