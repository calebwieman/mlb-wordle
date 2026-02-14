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

export default function GameBoard({ targetWord, onGameEnd, savedGuesses = [], savedGameOver = false, savedWon = false }: GameBoardProps) {
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
    const used: boolean[] = new Array(5).fill(false);

    for (const letter of targetUpper) {
      targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      if (guessUpper[i] === targetUpper[i]) {
        result[i] = { letter: guessUpper[i], status: 'correct' };
        targetLetterCount[guessUpper[i]]--;
        used[i] = true;
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
    if (isEmpty) return 'bg-zinc-900 border-zinc-700 text-zinc-500';
    if (!status) return 'bg-zinc-900 border-zinc-600 text-white';
    if (status === 'correct') return 'bg-emerald-600 border-emerald-600 text-white';
    if (status === 'present') return 'bg-amber-500 border-amber-500 text-white';
    return 'bg-zinc-700 border-zinc-700 text-white';
  };

  const currentRowIndex = guesses.length;

  return (
    <div className="flex flex-col items-center space-y-6 pb-56">
      {/* Toast message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white text-black rounded font-semibold shadow-lg"
          >
            {showMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game grid */}
      <div className="space-y-1">
        {[0, 1, 2, 3, 4, 5].map((row) => {
          const isCurrentRow = row === currentRowIndex;
          const hasResult = row < guesses.length;
          const result = hasResult ? checkGuess(guesses[row]) : null;
          const shouldShake = shake === row;

          return (
            <motion.div
              key={row}
              animate={shouldShake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              onAnimationComplete={() => setShake(null)}
              className="flex gap-1"
            >
              {[0, 1, 2, 3, 4].map((col) => {
                const letter = isCurrentRow 
                  ? currentGuess[col] || '' 
                  : (guesses[row]?.[col] || '');
                const status = result?.[col]?.status;
                const isEmpty = !letter;
                const showFlip = hasResult && !isEmpty;

                return (
                  <motion.div
                    key={col}
                    initial={false}
                    animate={showFlip ? { rotateX: [0, 90, 0] } : {}}
                    transition={{ duration: 0.3, delay: col * 0.1 }}
                    className={`
                      w-14 h-14 sm:w-16 sm:h-16
                      flex items-center justify-center
                      text-2xl sm:text-3xl font-bold uppercase
                      border-2 rounded-sm
                      transition-colors duration-300
                      ${getTileStyle(status, isEmpty)}
                      ${isEmpty ? 'border-zinc-800' : ''}
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

      {/* Keyboard */}
      <Keyboard
        onKeyPress={handleKeyPress}
        onEnter={handleEnter}
        onBackspace={handleBackspace}
        letterStates={letterStates}
      />
    </div>
  );
}
