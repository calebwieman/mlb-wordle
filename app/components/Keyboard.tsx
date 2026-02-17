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
  ['BACKSPACE', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER'],
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
    const base = 'bg-zinc-700 text-white border-zinc-600 hover:bg-zinc-600 active:scale-95';
    if (state === 'correct') return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20 shadow-lg';
    if (state === 'present') return 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20 shadow-lg';
    if (state === 'absent') return 'bg-zinc-800 text-zinc-500 border-zinc-800';
    return base;
  };

  return (
    <div className="w-full max-w-screen-md mx-auto px-1 sm:px-2 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-2">
      {KEYS.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-center"
          style={{ marginBottom: rowIndex < KEYS.length - 1 ? '6px' : '0' }}
        >
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            const keyLabel = key === 'BACKSPACE' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H20a2 2 0 002-2V6a2 2 0 00-2-2h-9.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            ) : key === 'ENTER' ? (
              <span className="text-[10px] sm:text-xs font-bold">ENTER</span>
            ) : key;

            return (
              <motion.button
                key={key}
                onClick={() => handleKeyClick(key)}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.05 }}
                className={`
                  ${isWide ? 'flex-[1.5] min-w-[42px] max-w-[65px]' : 'w-[28px] flex-1 max-w-[40px]'}
                  h-11 sm:h-12 sm:w-10 sm:max-w-none
                  mx-[3px] first:ml-0 last:mr-0
                  rounded-lg sm:rounded-xl 
                  font-semibold text-[13px] sm:text-[15px]
                  border transition-all duration-150
                  flex items-center justify-center
                  touch-manipulation
                  ${getKeyStyle(key)}
                  ${key === 'ENTER' || key === 'BACKSPACE' ? 'bg-zinc-700 border-zinc-600' : ''}
                `}
              >
                {keyLabel}
              </motion.button>
            );n          })}
        </div>
      ))}
    </div>
  );
}
