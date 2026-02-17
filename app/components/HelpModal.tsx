'use client';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-700 max-h-[80vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
        <p className="text-zinc-400 mb-6 text-center">Guess the 5-letter word in 6 tries.</p>
        
        <div className="space-y-6 mb-6">
          <div className="text-center">
            <div className="flex gap-2 justify-center mb-2">
              {['W', 'O', 'R', 'D', 'S'].map((l, i) => (
                <div key={i} className={`w-12 h-12 flex items-center justify-center font-bold rounded-lg text-lg ${
                  i === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-400">W is in the correct spot</p>
          </div>

          <div className="text-center">
            <div className="flex gap-2 justify-center mb-2">
              {['P', 'I', 'Z', 'Z', 'A'].map((l, i) => (
                <div key={i} className={`w-12 h-12 flex items-center justify-center font-bold rounded-lg text-lg ${
                  i === 2 ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-400">Z is in the word but wrong spot</p>
          </div>

          <div className="text-center">
            <div className="flex gap-2 justify-center mb-2">
              {['S', 'M', 'I', 'T', 'H'].map((l, i) => (
                <div key={i} className={`w-12 h-12 flex items-center justify-center font-bold rounded-lg text-lg ${
                  i === 4 ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-400">H is not in the word</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition-all"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
