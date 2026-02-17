'use client';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-xl p-5 max-w-xs w-full border border-zinc-800 max-h-[80vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        <p className="text-zinc-400 mb-4">Guess the 5-letter word in 6 tries.</p>
        
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            {['W', 'O', 'R', 'D', 'S'].map((l, i) => (
              <div key={i} className={`w-10 h-10 flex items-center justify-center font-bold rounded ${
                i === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {l}
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-400">W is in the correct spot</p>

          <div className="flex gap-2">
            {['P', 'I', 'Z', 'Z', 'A'].map((l, i) => (
              <div key={i} className={`w-10 h-10 flex items-center justify-center font-bold rounded ${
                i === 2 ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {l}
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-400">O is in the word but wrong spot</p>

          <div className="flex gap-2">
            {['S', 'M', 'I', 'T', 'H'].map((l, i) => (
              <div key={i} className={`w-10 h-10 flex items-center justify-center font-bold rounded ${
                i === 0 ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {l}
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-400">S is not in the word</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
