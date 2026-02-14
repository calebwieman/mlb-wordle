'use client';

interface StatsProps {
  gameState: {
    guesses: string[];
    gameOver: boolean;
    won: boolean;
  };
  onClose: () => void;
  targetWord: string;
}

export default function Stats({ gameState, onClose, targetWord }: StatsProps) {
  const { won, guesses, gameOver } = gameState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-xl p-6 max-w-sm w-full border border-zinc-800">
        {gameOver ? (
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
            <div className="text-center text-4xl mb-6">
              {won ? '⚾🏆' : '⚾💔'}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-4">Stats</h2>
            <p className="text-center text-zinc-400">Play today's game to see your streak!</p>
          </>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition-colors"
        >
          {gameOver ? 'Play Again Tomorrow' : 'Close'}
        </button>
      </div>
    </div>
  );
}
