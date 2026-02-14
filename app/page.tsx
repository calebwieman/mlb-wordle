'use client';

import { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import Stats from './components/Stats';
import HelpModal from './components/HelpModal';

// Daily player using date seed
function getDailyPlayer(): string {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const players = [
    "JUDGE", "BETTS", "TROUT", "SOTO", "ALTUV",
    "FREEM", "MACHA", "BELLI", "NOLAN", "ACUNA",
    "TATIS", "ALVAE", "PAULS", "GORDO", "WRIGH",
    "MARIS", "SMITH", "YOUNG", "WALKR", "LEWIS"
  ];
  
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  return players[Math.abs(hash) % players.length];
}

export default function Home() {
  const [targetWord, setTargetWord] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gameState, setGameState] = useState({
    guesses: [] as string[],
    gameOver: false,
    won: false,
  });

  useEffect(() => {
    setTargetWord(getDailyPlayer());
  }, []);

  const handleGameEnd = useCallback((won: boolean, guesses: string[]) => {
    setGameState({ guesses, gameOver: true, won });
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('mlb-wordle-last-played', today);
    localStorage.setItem('mlb-wordle-guesses', JSON.stringify(guesses));
    localStorage.setItem('mlb-wordle-won', String(won));
    setTimeout(() => setShowStats(true), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-blue-700 flex items-center justify-center font-bold text-sm">
              MLB
            </div>
            <h1 className="text-xl font-bold tracking-tight">Wordle</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              ?
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              📊
            </button>
          </div>
        </div>
      </header>

      {/* Main game */}
      <main className="px-4 py-6">
        {targetWord && (
          <GameBoard
            targetWord={targetWord}
            onGameEnd={handleGameEnd}
            savedGuesses={gameState.guesses}
            savedGameOver={gameState.gameOver}
            savedWon={gameState.won}
          />
        )}
      </main>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Stats Modal */}
      {showStats && (
        <Stats
          gameState={gameState}
          onClose={() => setShowStats(false)}
          targetWord={targetWord}
        />
      )}
    </div>
  );
}
