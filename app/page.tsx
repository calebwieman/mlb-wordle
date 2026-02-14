'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import GameBoard from './components/GameBoard';
import Stats from './components/Stats';
import HelpModal from './components/HelpModal';
import { getUserId } from './ConvexClientProvider';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function Home() {
  const today = getToday();
  const userId = typeof window !== 'undefined' ? getUserId() : '';
  
  const dailyPlayer = useQuery(api.games.getDailyPlayer, { date: today });
  const priorGame = useQuery(api.games.checkIfPlayed, { date: today, userId });
  const stats = useQuery(api.games.getStats, { date: today });
  
  const submitGame = useMutation(api.games.submitGame);
  const ensureDaily = useMutation(api.games.ensureDailyPlayer);
  
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gameState, setGameState] = useState({
    guesses: [] as string[],
    gameOver: false,
    won: false,
  });

  useEffect(() => {
    if (priorGame && priorGame.played && priorGame.guesses) {
      setGameState({
        guesses: priorGame.guesses,
        gameOver: true,
        won: priorGame.won,
      });
    }
  }, [priorGame]);

  useEffect(() => {
    ensureDaily({ date: today });
  }, [ensureDaily, today]);

  const handleGameEnd = useCallback(async (won: boolean, guesses: string[]) => {
    setGameState({ guesses, gameOver: true, won });
    
    localStorage.setItem('mlb-wordle-last-played', today);
    localStorage.setItem('mlb-wordle-guesses', JSON.stringify(guesses));
    localStorage.setItem('mlb-wordle-won', String(won));
    
    await submitGame({ date: today, userId: getUserId(), guesses, won });
    setTimeout(() => setShowStats(true), 1500);
  }, [submitGame, today]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
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

      <main className="px-4 py-6">
        {dailyPlayer && (
          <GameBoard
            targetWord={dailyPlayer.playerName}
            onGameEnd={handleGameEnd}
            savedGuesses={gameState.guesses}
            savedGameOver={gameState.gameOver}
            savedWon={gameState.won}
          />
        )}
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {showStats && stats && (
        <Stats
          gameState={gameState}
          onClose={() => setShowStats(false)}
          targetWord={dailyPlayer?.playerName || ''}
          globalStats={stats}
        />
      )}
    </div>
  );
}
