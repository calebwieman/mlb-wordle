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
    <div className="fixed inset-0 bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-blue-700 flex items-center justify-center font-bold text-xs tracking-wider shadow-lg shadow-red-500/20">
              MLB
            </div>
            <h1 className="text-lg font-bold tracking-tight">Wordle</h1>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowHelp(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Game area - fills remaining space */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
