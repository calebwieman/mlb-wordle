'use client';

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
  
  const maxDist = Math.max(...distribution, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-xl p-6 max-w-sm w-full border border-zinc-800 max-h-[80vh] overflow-y-auto">
        
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
          <h3 className="text-lg font-semibold mb-4">Global Stats</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalGames}</div>
              <div className="text-xs text-zinc-400">Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalWins}</div>
              <div className="text-xs text-zinc-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{winRate}%</div>
              <div className="text-xs text-zinc-400">Win Rate</div>
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((num, i) => (
              <div key={num} className="flex items-center gap-2">
                <div className="w-4 text-sm text-zinc-400">{num}</div>
                <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${(distribution[i] / maxDist) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm text-zinc-400">
                  {distribution[i] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
