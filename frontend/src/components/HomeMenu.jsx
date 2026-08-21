import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, BookOpen, Compass, Clock } from 'lucide-react';

// Generates 8 asymmetric micro-boxes with tight, completely independent random looping paths
function ScatterSparkCluster({ hovered }) {
  const particles = [
    { id: 1, top: '-4px', left: '10%', size: 'w-2 h-2', loopX: [0, -12, 8, -5, 3, 0], loopY: [0, -14, -6, -18, -3, 0], scatterX: -45, scatterY: -35, duration: 4.2, delay: 0 },
    { id: 2, top: '20%', right: '-5px', size: 'w-2.5 h-1.5', loopX: [0, 14, -9, 11, -4, 0], loopY: [0, 9, 16, 4, 11, 0], scatterX: 50, scatterY: -25, duration: 3.5, delay: 0.3 },
    { id: 3, bottom: '-5px', left: '25%', size: 'w-1.5 h-2', loopX: [0, 7, 15, -7, 9, 0], loopY: [0, 11, 7, 19, 5, 0], scatterX: -30, scatterY: 45, duration: 4.8, delay: 0.6 },
    { id: 4, top: '70%', left: '-6px', size: 'w-2.5 h-2.5', loopX: [0, -15, -7, -19, -3, 0], loopY: [0, 7, 13, -3, 9, 0], scatterX: -55, scatterY: 20, duration: 3.9, delay: 0.2 },
    { id: 5, bottom: '-3px', right: '20%', size: 'w-3 h-1', loopX: [0, 9, -11, 13, -6, 0], loopY: [0, 8, 13, 5, 10, 0], scatterX: 40, scatterY: 35, duration: 4.4, delay: 0.7 },
    { id: 6, top: '-5px', right: '40%', size: 'w-1.5 h-2.5', loopX: [0, -9, 11, -13, 5, 0], loopY: [0, -15, -9, -19, -5, 0], scatterX: 25, scatterY: -50, duration: 3.6, delay: 0.4 },
    { id: 7, top: '40%', left: '-5px', size: 'w-2 h-1.5', loopX: [0, -11, -4, -15, -7, 0], loopY: [0, -9, -15, -6, -11, 0], scatterX: -45, scatterY: -10, duration: 4.1, delay: 0.5 },
    { id: 8, bottom: '20%', right: '-6px', size: 'w-2 h-2', loopX: [0, 13, 6, 11, -3, 0], loopY: [0, -11, -17, -5, -9, 0], scatterX: 60, scatterY: 12, duration: 4.6, delay: 0.3 },
  ];

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-visible z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-[3px] bg-gradient-to-br from-pink-400 via-fuchsia-500 to-pink-600 shadow-[0_0_8px_2px_rgba(236,72,153,0.55)] ${p.size}`}
          style={{ top: p.top, left: p.left, right: p.right, bottom: p.bottom }}
          animate={
            hovered
              ? {
                  x: p.scatterX,
                  y: p.scatterY,
                  scale: 0.2,
                  opacity: 0,
                  transition: { duration: 0.35, ease: 'easeOut' },
                }
              : {
                  x: p.loopX,
                  y: p.loopY,
                  scale: [0.6, 1.2, 0.8, 1.1, 0.6],
                  opacity: [0.2, 0.9, 0.4, 0.8, 0.2],
                  transition: {
                    duration: p.duration,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay: p.delay,
                  },
                }
          }
        />
      ))}
    </div>
  );
}

export default function HomeMenu({ onSelectMode }) {
  const [hoveredMode, setHoveredMode] = useState(null);

  return (
    <motion.div
      key="home_menu"
      initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto text-center px-4 py-2 h-[100dvh] overflow-hidden"
    >
      {/* Title & Subtitle */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-5 sm:mb-8"
      >
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-md">
            Lonely
          </span>
          <span className="text-white">Trivia</span>
        </h1>
        <p className="text-zinc-400 text-xs sm:text-base font-medium tracking-wide px-2">
          Hardcore multiplayer & endless trivia experience.
        </p>
      </motion.div>

      {/* Mode Buttons Container */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="flex flex-col gap-2.5 sm:gap-3.5 w-full"
      >
        {/* 1. Topic Sprint Mode */}
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onHoverStart={() => setHoveredMode('sprint')}
          onHoverEnd={() => setHoveredMode(null)}
          onClick={() => onSelectMode('sprint_setup')}
          className="group relative flex items-center justify-between p-3.5 sm:p-4.5 bg-zinc-900/80 hover:bg-gradient-to-r hover:from-purple-600/80 hover:via-fuchsia-600/80 hover:to-pink-600/80 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] cursor-pointer text-left overflow-visible transition-all duration-300"
        >
          <ScatterSparkCluster hovered={hoveredMode === 'sprint'} />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          
          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-zinc-800 group-hover:bg-white/20 rounded-xl text-purple-400 group-hover:text-white transition-colors shadow-md shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-white tracking-wide">Topic Sprint</div>
              <div className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-purple-200 transition-colors font-medium">10 Questions • 3 Lives • Leaderboard</div>
            </div>
          </div>

          <div className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 group-hover:bg-black/20 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </motion.button>

        {/* 2. Global Gauntlet Mode */}
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onHoverStart={() => setHoveredMode('gauntlet')}
          onHoverEnd={() => setHoveredMode(null)}
          onClick={() => onSelectMode('gauntlet_setup')}
          className="group relative flex items-center justify-between p-3.5 sm:p-4.5 bg-zinc-900/80 hover:bg-gradient-to-r hover:from-purple-600/80 hover:via-fuchsia-600/80 hover:to-pink-600/80 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] cursor-pointer text-left overflow-visible transition-all duration-300"
        >
          <ScatterSparkCluster hovered={hoveredMode === 'gauntlet'} />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          
          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-zinc-800 group-hover:bg-white/20 rounded-xl text-cyan-400 group-hover:text-white transition-colors shadow-md shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-white tracking-wide">Global Gauntlet</div>
              <div className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-purple-200 transition-colors font-medium">Universal Pool • Difficulty Tiered • 3 Lives</div>
            </div>
          </div>

          <div className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 group-hover:bg-black/20 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </motion.button>

        {/* 3. Practice Mode */}
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onHoverStart={() => setHoveredMode('practice')}
          onHoverEnd={() => setHoveredMode(null)}
          onClick={() => onSelectMode('practice_setup')}
          className="group relative flex items-center justify-between p-3.5 sm:p-4.5 bg-zinc-900/80 hover:bg-gradient-to-r hover:from-purple-600/80 hover:via-fuchsia-600/80 hover:to-pink-600/80 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] cursor-pointer text-left overflow-visible transition-all duration-300"
        >
          <ScatterSparkCluster hovered={hoveredMode === 'practice'} />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-zinc-800 group-hover:bg-white/20 rounded-xl text-pink-400 group-hover:text-white transition-colors shadow-md shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-white tracking-wide">Practice Mode</div>
              <div className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-purple-200 transition-colors font-medium">Endless questions • No leaderboard</div>
            </div>
          </div>

          <div className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 group-hover:bg-black/20 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </motion.button>

        {/* 4. New Mode (Coming Soon Placeholder) */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
          }}
          className="relative flex items-center justify-between p-3.5 sm:p-4.5 bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-2xl text-left opacity-60 cursor-not-allowed shadow-[0_0_15px_rgba(236,72,153,0.05)]"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-zinc-900 rounded-xl text-zinc-600 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-zinc-400 tracking-wide">New Mode</div>
              <div className="text-[11px] sm:text-xs text-zinc-600 font-medium">Coming Soon...</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}