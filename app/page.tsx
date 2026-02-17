'use client';

import { useState, useCallback, useEffect } from 'react';
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

  // Reset game when theme changes
  useEffect(() => {
    setGameState({ guesses: [], gameOver: false, won: false });
  }, [currentTheme]);

  const dailyPlayer = useQuery(api.games.getDailyPlayer, { date: today, theme: currentTheme });
  const priorGame = useQuery(api.games.checkIfPlayed, { date: today, userId, theme: currentTheme });
  const stats = useQuery(api.games.getStats, { date: today, theme: currentTheme });
  const leaderboard = useQuery(api.games.getLeaderboard, { date: today, theme: currentTheme });

  const submitGame = useMutation(api.games.submitGame);
  const ensureDaily = useMutation(api.games.ensureDailyPlayer);

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
    ensureDaily({ date: today, theme: currentTheme });
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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight ml-2">Wordle</h1>
          <button
            onClick={cycleTheme}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-all"
          >
            {THEMES.find(t => t.id === currentTheme)?.name || 'MLB'}
          </button>
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

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
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
          {!gameState.gameOver && leaderboard && leaderboard.length === 0 && (
            <div className="w-full max-w-md px-4 mb-4 flex-shrink-0">
              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 text-center">
                <p className="text-zinc-500 text-sm">
                  🏆 Be the first to make today's leaderboard!
                </p>
              </div>
            </div>
          )}

          {dailyPlayer && (
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
