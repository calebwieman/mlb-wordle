'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  guesses: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUsername: string;
  title?: string;
  showEmptyState?: boolean;
  collapsible?: boolean;
  onClose?: () => void;
}

export default function Leaderboard({ 
  entries, 
  currentUsername, 
  title = "🏆 Leaderboard",
  showEmptyState = true,
  collapsible = false,
  onClose
}: LeaderboardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-amber-600/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-400/20 to-orange-600/20 border-orange-500/30';
    return 'from-blue-600/20 to-blue-700/20 border-blue-500/30';
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsCollapsed(true);
    }
  };

  if (isCollapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsCollapsed(false)}
        className="w-full py-3 px-4 bg-zinc-900/80 rounded-xl border border-zinc-800 backdrop-blur-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all"
      >
        <span className="flex items-center justify-center gap-2">
          🏆 Show {title.replace('🏆 ', '')}
        </span>
      </motion.button>
    );
  }

  if (entries.length === 0 && showEmptyState) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800 backdrop-blur-xl"
      >
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          {title}
        </h3>
        <p className="text-center text-zinc-500 py-6">
          No winners yet today! Be the first to make the leaderboard.
        </p>
      </motion.div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>{title}</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-full">
            {entries.length} player{entries.length !== 1 ? 's' : ''}
          </span>
          {collapsible && (
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Collapse leaderboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <motion.div
            key={`${entry.username}-${entry.rank}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${
              entry.username === currentUsername 
                ? getRankColor(entry.rank)
                : 'from-zinc-800/50 to-zinc-800/30 border border-zinc-700/30'
            } ${entry.username === currentUsername ? 'border' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold w-10 ${
                entry.rank <= 3 ? 'text-white' : 'text-zinc-400'
              }`}>
                {getRankEmoji(entry.rank)}
              </span>
              <span className={`font-medium ${
                entry.username === currentUsername ? 'text-white' : 'text-zinc-300'
              }`}>
                {entry.username}
                {entry.username === currentUsername && (
                  <span className="ml-2 text-xs text-blue-400 font-normal">(You)</span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className={`font-bold ${
                entry.guesses <= 2 ? 'text-emerald-400' :
                entry.guesses <= 4 ? 'text-yellow-400' : 'text-orange-400'
              }`}>
                {entry.guesses}
              </span>
              <span className="text-xs text-zinc-500 ml-2">
                {entry.guesses === 1 ? 'try' : 'tries'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {currentUsername && !entries.some(e => e.username === currentUsername) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-3 bg-zinc-800/30 rounded-xl text-center"
        >
          <span className="text-sm text-zinc-500">
            Play today to join the leaderboard!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
