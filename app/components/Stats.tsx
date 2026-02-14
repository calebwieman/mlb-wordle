'use client';

import { getUsername } from '../ConvexClientProvider';

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
}

export default function Stats({ gameState, onClose, targetWord, globalStats }: StatsProps) {
  const { won, guesses, gameOver } = gameState;
  const { totalGames, totalWins, winRate, distribution } = globalStats;
  const username = getUsername();
  
  const maxDist = Math.max(...distribution, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-800 max-h-[85vh] overflow-y-auto">
        
        {/* User greeting */}
        {username && (
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Playing as</p>
              <p className="font-semibold">{username}</p>
            </div>
          </div>
        )}

        {/* Your Result */}
        {gameOver && (
          <>
            <h2 className="text-2xl font-bold text-center mb-4">
              {won ? '🎉 Home Run!' : '😞 Strike Out'}
            </h2>
            <p className="text-center text-zinc-400 mb-4">
              {won 
                ? `You got it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`
                : `The player was ${targetWord}`
              }
            </p>
          </>
        )}

        {/* Global Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Today's Stats</h3>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 bg-zinc-800/50 rounded-xl">
              <div className="text-2xl font-bold text-blue-400">{totalGames}</div>
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

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-colors"
        >
          {gameOver ? 'Play Again Tomorrow' : 'Close'}
        </button>
      </div>
    </div>
  );
}
