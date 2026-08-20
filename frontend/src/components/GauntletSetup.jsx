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
        className="flex flex-col w-full max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10 px-2">
          <BackButton onClick={onBack} label="Retreat" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRules(true)}
              className="p-2.5 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-pink-400 hover:border-pink-500/50 transition-all shadow-lg cursor-pointer"
            >
              <Info className="w-5 h-5" />
            </button>
            <div className="text-right">
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm uppercase tracking-tight">
                Global Gauntlet
              </h2>
              <p className="text-cyan-400/80 text-sm font-semibold tracking-widest uppercase mt-1">
                Select Difficulty • Universal Pool
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty Cards Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {DIFFICULTIES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDifficulty(item.id)}
                className={`group relative flex items-center justify-between p-6 bg-zinc-900/80 backdrop-blur-xl border rounded-2xl cursor-pointer overflow-hidden shadow-xl transition-all ${item.color}`}
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white tracking-wide mb-1">
                      {item.name}
                    </div>
                    <p className="text-sm text-zinc-400 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-4">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-bold tracking-wider text-white">
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
                  <p><strong>3 Lives Limit:</strong> 10 questions total. Lose 3 lives and your run is terminated.</p>
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