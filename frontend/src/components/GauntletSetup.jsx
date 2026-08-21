import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldAlert, Flame, Info, X, Heart } from 'lucide-react';
import BackButton from './BackButton';

const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Easy Gauntlet',
    desc: 'For casual warm-ups. Standard trivia across all global domains.',
    points: '+1 Pt / Correct',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500 text-emerald-400',
    icon: Zap
  },
  {
    id: 'medium',
    name: 'Medium Gauntlet',
    desc: 'The balanced challenge. Deeper questions requiring solid general knowledge.',
    points: '+3 Pts / Correct',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 hover:border-purple-500 text-purple-400',
    icon: Flame
  },
  {
    id: 'hard',
    name: 'Hard Gauntlet',
    desc: 'Brutal tier. Obscure, highly specialized questions for elite trivia runners.',
    points: '+5 Pts / Correct',
    color: 'from-red-500/20 to-pink-500/20 border-red-500/30 hover:border-red-500 text-red-400',
    icon: ShieldAlert
  }
];

export default function GauntletSetup({ onBack, onSelectDifficulty }) {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <motion.div 
        key="gauntlet_setup"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col w-full max-w-xl mx-auto h-full justify-center px-2 py-2 overflow-hidden"
      >
        {/* Header with cleaner alignment */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <BackButton onClick={onBack} label="Retreat" />
            <button 
              onClick={() => setShowRules(true)}
              className="p-2 rounded-xl bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-pink-400 hover:border-pink-500/50 transition-all shadow-lg cursor-pointer flex items-center justify-center"
              title="Gauntlet Rules"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm uppercase tracking-tight">
              Global Gauntlet
            </h2>
            <p className="text-cyan-400/80 text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-0.5">
              Select Difficulty • Endless Survival
            </p>
          </div>
        </div>

        {/* Difficulty Cards Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {DIFFICULTIES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDifficulty(item.id)}
                className={`group relative flex items-center justify-between p-3.5 sm:p-4 bg-zinc-900/80 backdrop-blur-xl border rounded-xl cursor-pointer overflow-hidden shadow-xl transition-all ${item.color}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight mb-0.5">
                      {item.name}
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400 font-medium leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <span className="px-2.5 py-1 bg-white/10 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider text-white">
                    {item.points}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full"
            >
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6 uppercase tracking-tight">
                Gauntlet Rules
              </h3>
              
              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <p><strong>Universal Pool:</strong> Questions span across all available topics based entirely on your chosen tier.</p>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 shrink-0 mt-0.5" />
                  <p><strong>Endless Survival:</strong> Starts with 5 lives. Run continues until you lose all lives. No heart regeneration.</p>
                </li>
                <li className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <p><strong>Streaks & Passes:</strong> 5-streak (+25 pts) & 10-streak (+50 pts). Tactical passes incur point penalties (-3, -5, -7).</p>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}