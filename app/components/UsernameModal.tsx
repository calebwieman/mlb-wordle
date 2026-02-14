'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface UsernameModalProps {
  onSubmit: (username: string) => void;
}

export default function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    
    if (!trimmed) {
      setError('Please enter a username');
      return;
    }
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
      setError('Only letters, numbers, underscores, and hyphens allowed');
      return;
    }
    
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-800 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-blue-700 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to MLB Wordle!</h2>
          <p className="text-zinc-400 text-sm">Choose a username to track your stats on the leaderboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter username"
              autoFocus
              className={`
                w-full px-4 py-3 bg-zinc-800 border rounded-xl
                text-white text-center text-lg font-medium
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all
                ${error ? 'border-red-500' : 'border-zinc-700 focus:border-blue-500'}
              `}
            />
            {error && (
              <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-colors"
          >
            Start Playing
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Your username will be visible on the global leaderboard
        </p>
      </motion.div>
    </div>
  );
}
