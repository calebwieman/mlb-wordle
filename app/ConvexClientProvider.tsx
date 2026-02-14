'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

// Check if user has a username
export function hasUsername(): boolean {
  if (typeof window === 'undefined') return false;
  const username = localStorage.getItem('mlb-wordle-username');
  return !!username;
}

// Get username - returns empty string if none set
export function getUsername(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('mlb-wordle-username') || '';
}

// Set username for new user
export function setUsername(username: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mlb-wordle-username', username);
  // Also generate a unique userId based on username for backend
  const userId = btoa(username).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  localStorage.setItem('mlb-wordle-user-id', userId);
}

// Legacy: Get or create unique user ID (for backwards compatibility)
export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  // Try to get existing userId from username
  const username = localStorage.getItem('mlb-wordle-username');
  if (username) {
    return btoa(username).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }
  // Fallback to random ID
  let userId = localStorage.getItem('mlb-wordle-user-id');
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mlb-wordle-user-id', userId);
  }
  return userId;
}
