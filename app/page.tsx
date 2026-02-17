'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import GameBoard from './components/GameBoard';
import Stats from './components/Stats';
import HelpModal from './components/HelpModal';
import UsernameModal from './components/UsernameModal';
import Leaderboard from './components/Leaderboard';
import MLBLogo from './components/MLBLogo';
import { getUserId, hasUsername, setUsername, getUsername } from './ConvexClientProvider';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

const THEMES = [
  { id: 'mlb', name: 'MLB' },
  { id: 'sports', name: 'Sports' },
  { id: 'foods', name: 'Foods' },
  { id: 'animals', name: 'Animals' },
];

export default function Home() {
  const today = getToday();
  const userId = typeof window !== 'undefined' ? getUserId() : '';
  const username = typeof window !== 'undefined' ? getUsername() : '';

  // Get theme from localStorage or default to 'mlb'
  const [currentTheme, setCurrentTheme] = useState('mlb');
  
  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mlb-wordle-theme');
      if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  const dailyPlayer = useQuery(api.games.getDailyPlayer, { date: today, theme: currentTheme });
  const priorGame = useQuery(api.games.checkIfPlayed, { date: today, userId, theme: currentTheme });
  const stats = useQuery(api.games.getStats, { date: today, theme: currentTheme });
  const leaderboard = useQuery(api.games.getLeaderboard, { date: today, theme: currentTheme });

  // Check if queries are still loading
  // Loading is true while dailyPlayer OR leaderboard is loading
  const isLoading = dailyPlayer === undefined || leaderboard === undefined;

  // Reset game when theme changes
  useEffect(() => {
    setGameState({ guesses: [], gameOver: false, won: false });
  }, [currentTheme, dailyPlayer]);

  const submitGame = useMutation(api.games.submitGame);
  const ensureDaily = useMutation(api.games.ensureDailyPlayer);

  // Track if we've initialized today's game to prevent duplicate calls
  const todayRef = useRef<string>('');

  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameState, setGameState] = useState({
    guesses: [] as string[],
    gameOver: false,
    won: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!hasUsername()) {
        setShowUsernameModal(true);
      }
    }
  }, []);

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
    // Only call ensureDaily once per day+theme combination
    const key = `${today}-${currentTheme}`;
    if (todayRef.current !== key) {
      todayRef.current = key;
      ensureDaily({ date: today, theme: currentTheme });
    }
  }, [ensureDaily, today, currentTheme]);

  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername);
    setShowUsernameModal(false);
    window.location.reload();
  };

  const handleGameEnd = useCallback(async (won: boolean, guesses: string[]) => {
    setGameState({ guesses, gameOver: true, won });
    localStorage.setItem('mlb-wordle-last-played', today);
    localStorage.setItem('mlb-wordle-guesses', JSON.stringify(guesses));
    localStorage.setItem('mlb-wordle-won', String(won));
    await submitGame({
      date: today,
      userId: getUserId(),
      username: getUsername(),
      guesses,
      won,
      theme: currentTheme,
    });
    setTimeout(() => setShowStats(true), 1500);
  }, [submitGame, today]);

  const toggleLeaderboard = () => {
    setShowLeaderboard(prev => !prev);
  };

  // Cycle to next theme
  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const newTheme = THEMES[nextIndex].id;
    setCurrentTheme(newTheme);
    localStorage.setItem('mlb-wordle-theme', newTheme);
    // Reset game state when theme changes
    setGameState({ guesses: [], gameOver: false, won: false });
  };

  const leaderboardVisible = gameState.gameOver && leaderboard && leaderboard.length > 0;

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white flex flex-col overflow-hidden">
      {showUsernameModal && <UsernameModal onSubmit={handleUsernameSubmit} />}

      <header className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between md:justify-between relative">
          {/* Theme cycle button - absolute left on mobile, left on desktop */}
          <button
            onClick={cycleTheme}
            className="absolute left-0 md:relative px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition-all"
            style={{ minWidth: '90px' }}
          >
            {THEMES.find(t => t.id === currentTheme)?.name || 'MLB'}
          </button>

          {/* Wordle title - centered */}
          <h1 className="text-2xl font-bold tracking-tight">Wordle</h1>

          {/* Buttons - absolute right on mobile, right on desktop */}
          <div className="absolute right-0 md:relative flex gap-1">
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

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 pt-4">
          {/* Leaderboard - Only shows after game is over */}
          {leaderboardVisible && showLeaderboard && (
            <div className="w-full max-w-md px-4 mb-4 flex-shrink-0">
              <Leaderboard
                entries={leaderboard}
                currentUsername={username}
                title="🏆 Leaderboard"
                onClose={() => setShowLeaderboard(false)}
              />
            </div>
          )}

          {/* Toggle leaderboard button */}
          {leaderboardVisible && (
            <div className="w-full max-w-md px-4 mb-4 flex-shrink-0">
              <button
                onClick={toggleLeaderboard}
                className="w-full py-3 px-4 bg-zinc-900/80 rounded-xl border border-zinc-800 backdrop-blur-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  {showLeaderboard ? '🏆 Hide Leaderboard' : '🏆 Show Leaderboard'}
                </span>
              </button>
            </div>
          )}

          {/* "Be first" message if leaderboard is empty and game not over */}
          {!isLoading && !gameState.gameOver && leaderboard !== undefined && leaderboard.length === 0 && (
            <div className="w-full max-w-md px-4 mb-4 flex-shrink-0">
              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 text-center">
                <p className="text-zinc-500 text-sm">
                  🏆 Be the first to make today's leaderboard!
                </p>
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-zinc-500 text-sm">Loading game...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && !dailyPlayer && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-zinc-400 text-center mb-4">Unable to load today's game</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Game board */}
          {!isLoading && dailyPlayer && (
            <GameBoard
              targetWord={dailyPlayer.playerName}
              onGameEnd={handleGameEnd}
              savedGuesses={gameState.guesses}
              savedGameOver={gameState.gameOver}
              savedWon={gameState.won}
            />
          )}
        </div>
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showStats && stats && (
        <Stats
          gameState={gameState}
          onClose={() => setShowStats(false)}
          targetWord={dailyPlayer?.playerName || ''}
          globalStats={stats}
          leaderboard={leaderboard || []}
          currentUsername={username}
        />
      )}
    </div>
  );
}
