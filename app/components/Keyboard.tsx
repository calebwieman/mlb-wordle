'use client';

import { motion } from 'framer-motion';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStates: Map<string, 'correct' | 'present' | 'absent'>;
}

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export default function Keyboard({ onKeyPress, onEnter, onBackspace, letterStates }: KeyboardProps) {
  const handleKeyClick = (key: string) => {
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  const getKeyStyle = (key: string) => {
    const state = letterStates.get(key);
    if (state === 'correct') return 'bg-emerald-600 text-white border-emerald-600';
    if (state === 'present') return 'bg-amber-500 text-white border-amber-500';
    if (state === 'absent') return 'bg-zinc-700 text-white border-zinc-700';
    return 'bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 px-2">
      {KEYS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            const keyLabel = key === 'BACKSPACE' ? '←' : key;
            
            return (
              <motion.button
                key={key}
                onClick={() => handleKeyClick(key)}
                whileTap={{ scale: 0.95 }}
                className={`
                  ${isWide ? 'flex-1 px-2 sm:px-4' : 'w-8 sm:w-10'}
                  h-12 sm:h-14
                  rounded-md
                  font-semibold
                  text-sm sm:text-base
                  border-2
                  transition-all duration-150
                  ${getKeyStyle(key === 'BACKSPACE' ? 'BACKSPACE' : key)}
                  ${key === 'ENTER' ? 'text-xs sm:text-sm' : ''}
                `}
              >
                {keyLabel}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
