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
    const base = 'bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 active:scale-95';
    
    if (state === 'correct') return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20 shadow-lg';
    if (state === 'present') return 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20 shadow-lg';
    if (state === 'absent') return 'bg-zinc-800 text-zinc-500 border-zinc-800';
    return base;
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 pt-4 pb-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
      {KEYS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2" style={{ marginBottom: '16px' }}>
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            const keyLabel = key === 'BACKSPACE' ? (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H20a2 2 0 002-2V6a2 2 0 00-2-2h-9.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              </div>
            ) : key === 'ENTER' ? (
              <span className="text-[10px] sm:text-xs font-bold">ENTER</span>
            ) : key;
            
            return (
              <motion.button
                key={key}
                onClick={() => handleKeyClick(key)}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.05 }}
                className={`
                  ${isWide ? 'flex-[1.5] min-w-[60px]' : 'w-[32px] sm:w-11'}
                  h-12 sm:h-14
                  rounded-xl
                  font-semibold
                  text-sm sm:text-base
                  border
                  transition-all duration-150
                  ${getKeyStyle(key)}
                  ${key === 'ENTER' ? 'text-xs sm:text-sm bg-zinc-700 border-zinc-600' : ''}
                  ${key === 'BACKSPACE' ? 'bg-zinc-700 border-zinc-600' : ''}
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
