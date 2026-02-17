'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  guesses: string[];
  won: boolean;
  targetWord: string;
  guessCount: number;
}

const EMOJI = {
  correct: '🟩',
  present: '🟨',
  absent: '⬜',
};

export default function ShareButton({ guesses, won, targetWord, guessCount }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateShareText = useCallback(() => {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const grid = guesses.map((guess) => {
      const row: string[] = [];
      const targetUpper = targetWord.toUpperCase();
      const guessUpper = guess.toUpperCase();
      const targetLetterCount: Record<string, number> = {};

      for (const letter of targetUpper) {
        targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
      }

      const statuses: ('correct' | 'present' | 'absent')[] = [];

      for (let i = 0; i < 5; i++) {
        if (guessUpper[i] === targetUpper[i]) {
          statuses[i] = 'correct';
          targetLetterCount[guessUpper[i]]--;
        } else {
          statuses[i] = 'absent';
        }
      }

      for (let i = 0; i < 5; i++) {
        if (statuses[i] === 'correct') continue;
        const letter = guessUpper[i];
        if (targetLetterCount[letter] > 0) {
          statuses[i] = 'present';
          targetLetterCount[letter]--;
        }
      }

      return statuses.map((s) => EMOJI[s]).join('');
    });

    const resultLine = won
      ? `I got it in ${guessCount}/${guesses.length === 6 ? '6' : guessCount} ${guessCount === 1 ? 'try' : 'tries'}! ⚾`
      : `I didn't get it today 😞`;

    return `MLB Wordle ${date}

${resultLine}

${grid.join('\n')}

Play at: https://mlb-wordle.vercel.app`;
  }, [guesses, won, targetWord, guessCount]);

  const handleShare = useCallback(async () => {
    const text = generateShareText();
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generateShareText]);

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition-all flex items-center justify-center gap-2"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-emerald-100"
          >
            <Check size={18} />
            Copied to clipboard!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Share2 size={18} />
            Share Results
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
