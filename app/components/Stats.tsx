'use client';

import { useState, useEffect } from 'react';
import { getUsername } from '../ConvexClientProvider';
import ShareButton from './ShareButton';

interface LeaderboardEntry {
  rank: number;
  username: string;
  guesses: number;
}

interface StatsProps {
  gameState: {
    guesses: string[];
    gameOver: boolean;
    won: boolean;
  };
  onClose: () => void;
  targetWord: string;
  globalStats: {
    totalGames: number;
    totalWins: number;
    winRate: number;
    distribution: number[];
  };
  leaderboard: LeaderboardEntry[];
  currentUsername: string;
}

export default function Stats({
  gameState,
  onClose,
  targetWord,
  globalStats,
  leaderboard,
  currentUsername,
}: StatsProps) {
  const { won: gameStateWon, guesses: gameStateGuesses, gameOver } = gameState;
  
  // Check localStorage for guesses if not in gameState
  const [localGuesses, setLocalGuesses] = useState<string[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mlb-wordle-guesses');
      if (saved) {
        try {
          setLocalGuesses(JSON.parse(saved));
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }, []);
  
  const guesses = gameStateGuesses.length > 0 ? gameStateGuesses : localGuesses;
  const won = gameStateWon || localStorage.getItem('mlb-wordle-won') === 'true';
  
  const { totalGames, totalWins, winRate, distribution } = globalStats;
  const username = getUsername();
  const maxDist = Math.max(...distribution, 1);

  const getRankText = (rank: number) => {
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30';
    if (rank === 2) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 3) return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
    return 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-2xl p-4 sm:p-6 max-w-sm w-full border border-zinc-800 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* User greeting */}
        {username && (
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Playing as</p>
              <p className="font-semibold text-white">{username}</p>
            </div>
          </div>
        )}

        {/* Your Result */}
        {gameOver && (
          <>
            <h2 className="text-2xl font-bold text-center mb-3">
              {won ? '🎉 You Won!' : '😞 Game Over'}
            </h2>
            <p className="text-center text-zinc-400 mb-5">
              {won
                ? `You got it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`
                : `The word was ${targetWord}`}
            </p>
          </>
        )}

        {/* Leaderboard */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-emerald-400">Leaderboard</span>
          </h3>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${
                    entry.username === currentUsername
                      ? getRankColor(entry.rank)
                      : 'from-zinc-800/50 to-zinc-800/30 border border-zinc-700/30'
                  } ${entry.username === currentUsername ? 'border' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold w-10 ${
                      entry.rank === 1 ? 'text-emerald-400' :
                      entry.rank === 2 ? 'text-yellow-400' :
                      entry.rank === 3 ? 'text-amber-400' : 'text-zinc-500'
                    }`}>
                      {getRankText(entry.rank)}
                    </span>
                    <span
                      className={`font-medium ${
                        entry.username === currentUsername ? 'text-white' : 'text-zinc-300'
                      }`}
                    >
                      {entry.username}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">{entry.guesses}</span>
                    <span className="text-xs text-zinc-500 ml-1">
                      {entry.guesses === 1 ? 'try' : 'tries'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-4">No winners yet today!</p>
          )}
        </div>

        {/* Global Stats */}
        <div className="mb-6 border-t border-zinc-800 pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Global Stats
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 bg-zinc-800/50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-400">{totalGames}</div>
              <div className="text-xs text-zinc-500">Games</div>
            </div>
            <div className="text-center p-3 bg-zinc-800/50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-400">{totalWins}</div>
              <div className="text-xs text-zinc-500">Wins</div>
            </div>
            <div className="text-center p-3 bg-zinc-800/50 rounded-xl">
              <div className="text-2xl font-bold text-amber-400">{winRate}%</div>
              <div className="text-xs text-zinc-500">Win Rate</div>
            </div>
          </div>

          {/* Distribution */}
          <h4 className="text-sm font-semibold text-zinc-400 mb-3">Guess Distribution</h4>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((num, i) => (
              <div key={num} className="flex items-center gap-2">
                <div className="w-5 text-sm text-zinc-500 font-mono">{num}</div>
                <div className="flex-1 h-7 bg-zinc-800/50 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-emerald-500/80 rounded-lg transition-all duration-500"
                    style={{ width: `${(distribution[i] / maxDist) * 100}%` }}
                  />
                </div>
                <div className="w-7 text-right text-sm text-zinc-400 font-mono">
                  {distribution[i] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share button - show if there are guesses (game was played) */}
        {(gameOver || guesses.length > 0) && (
          <div className="mb-3">
            <ShareButton
              guesses={guesses}
              won={won}
              targetWord={targetWord}
              guessCount={guesses.length}
            />
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 font-semibold transition-all"
        >
          {gameOver ? 'Play Again Tomorrow' : 'Close'}
        </button>
      </div>
    </div>
  );
}
