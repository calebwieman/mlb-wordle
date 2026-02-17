'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Keyboard from './Keyboard';

interface GuessResult {
  letter: string;
  status: 'correct' | 'present' | 'absent';
}

interface GameBoardProps {
  targetWord: string;
  onGameEnd: (won: boolean, guesses: string[]) => void;
  savedGuesses?: string[];
  savedGameOver?: boolean;
  savedWon?: boolean;
}

export default function GameBoard({
  targetWord,
  onGameEnd,
  savedGuesses = [],
  savedGameOver = false,
  savedWon = false,
}: GameBoardProps) {
  const [guesses, setGuesses] = useState<string[]>(savedGuesses);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(savedGameOver);
  const [won, setWon] = useState(savedWon);
  const [letterStates, setLetterStates] = useState<Map<string, 'correct' | 'present' | 'absent'>>(new Map());
  const [showMessage, setShowMessage] = useState('');
  const [shake, setShake] = useState<number | null>(null);

  const checkGuess = useCallback((guess: string): GuessResult[] => {
    const result: GuessResult[] = [];
    const targetUpper = targetWord.toUpperCase();
    const guessUpper = guess.toUpperCase();
    const targetLetterCount: Record<string, number> = {};

    for (const letter of targetUpper) {
      targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      if (guessUpper[i] === targetUpper[i]) {
        result[i] = { letter: guessUpper[i], status: 'correct' };
        targetLetterCount[guessUpper[i]]--;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (result[i]) continue;
      const letter = guessUpper[i];
      if (targetLetterCount[letter] > 0) {
        result[i] = { letter, status: 'present' };
        targetLetterCount[letter]--;
      } else {
        result[i] = { letter, status: 'absent' };
      }
    }

    return result;
  }, [targetWord]);

  const updateLetterStates = useCallback((results: GuessResult[]) => {
    setLetterStates(prev => {
      const newStates = new Map(prev);
      results.forEach(({ letter, status }) => {
        const current = newStates.get(letter);
        if (status === 'correct' || (status === 'present' && current !== 'correct') || !current) {
          newStates.set(letter, status);
        }
      });
      return newStates;
    });
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver || currentGuess.length >= 5) return;
    setCurrentGuess(prev => prev + key);
  }, [gameOver, currentGuess.length]);

  const handleBackspace = useCallback(() => {
    if (gameOver) return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [gameOver]);

  const handleEnter = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length !== 5) {
      setShowMessage('Not enough letters');
      setShake(guesses.length);
      setTimeout(() => setShowMessage(''), 1500);
      return;
    }

    const guessUpper = currentGuess.toUpperCase();
    const results = checkGuess(guessUpper);
    const newGuesses = [...guesses, guessUpper];
    setGuesses(newGuesses);
    updateLetterStates(results);
    setCurrentGuess('');

    if (guessUpper === targetWord.toUpperCase()) {
      setWon(true);
      setGameOver(true);
      onGameEnd(true, newGuesses);
    } else if (newGuesses.length >= 6) {
      setGameOver(true);
      onGameEnd(false, newGuesses);
    }
  }, [currentGuess, guesses, gameOver, targetWord, checkGuess, updateLetterStates, onGameEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'Enter') {
        handleEnter();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, currentGuess, guesses, handleEnter, handleBackspace, handleKeyPress]);

  const getTileStyle = (status?: 'correct' | 'present' | 'absent', isEmpty?: boolean) => {
    if (isEmpty) return 'bg-zinc-900/50 border-zinc-800 text-zinc-600';
    if (!status) return 'bg-zinc-800 border-zinc-600 text-white animate-pulse-slow';
    if (status === 'correct') return 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30 shadow-lg scale-105';
    if (status === 'present') return 'bg-amber-500 border-amber-400 text-white shadow-amber-500/30 shadow-lg';
    return 'bg-zinc-700 border-zinc-600 text-zinc-400';
  };

  const currentRowIndex = guesses.length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toast message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white text-black rounded-full font-semibold shadow-2xl text-xs"
          >
            {showMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game grid - centered */}
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="flex flex-col" style={{ gap: '10px' }}>
          {[0, 1, 2, 3, 4, 5].map((row) => {
            const isCurrentRow = row === currentRowIndex;
            const hasResult = row < guesses.length;
            const result = hasResult ? checkGuess(guesses[row]) : null;
            const shouldShake = shake === row;

            return (
              <motion.div
                key={row}
                animate={shouldShake ? { x: [0, -12, 12, -12, 12, 0] } : {}}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                onAnimationComplete={() => setShake(null)}
                className="flex"
                style={{ gap: '10px' }}
              >
                {[0, 1, 2, 3, 4].map((col) => {
                  const letter = isCurrentRow ? currentGuess[col] || '' : (guesses[row]?.[col] || '');
                  const status = result?.[col]?.status;
                  const isEmpty = !letter;
                  const showFlip = hasResult && !isEmpty;

                  return (
                    <motion.div
                      key={col}
                      initial={false}
                      animate={showFlip ? { rotateX: [0, 90, 0], scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.4, delay: col * 0.08, ease: "easeOut" }}
                      className={`
                        w-[54px] h-[54px] sm:w-[60px] sm:h-[60px]
                        flex items-center justify-center
                        text-2xl sm:text-3xl font-bold uppercase
                        border-2 rounded-xl transition-all duration-300
                        ${getTileStyle(status, isEmpty)}
                        ${isCurrentRow && letter ? 'border-zinc-400 bg-zinc-800' : ''}
                      `}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Keyboard - fixed at bottom with extra spacing */}
      <div className="flex-shrink-0 pb-safe pt-6">
        <Keyboard
          onKeyPress={handleKeyPress}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          letterStates={letterStates}
        />
      </div>
    </div>
  );
}
