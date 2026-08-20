import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Added 'Heart' to the imports here!
import { Crosshair, RefreshCcw, Lock, Info, X, Heart } from 'lucide-react'; 
import BackButton from './BackButton';

export default function SprintSetup({ topics, onBack, onSelectTopic }) {
  const [draftedTopics, setDraftedTopics] = useState([]);
  const [isRerolling, setIsRerolling] = useState(false);
  const [hasRerolled, setHasRerolled] = useState(false); 
  const [showRules, setShowRules] = useState(false); 

  const dealTopics = () => {
    if (!topics || topics.length === 0) return;
    const shuffled = [...topics].sort(() => 0.5 - Math.random());
    setDraftedTopics(shuffled.slice(0, 4));
  };

  useEffect(() => {
    dealTopics();
  }, [topics]);

  const handleReroll = () => {
    if (hasRerolled) return; 
    
    setIsRerolling(true);
    setHasRerolled(true); 
    
    setTimeout(() => {
      dealTopics();
      setIsRerolling(false);
    }, 350); 
  };

  if (!topics || topics.length === 0) {
    return <p className="text-zinc-500 animate-pulse mt-20 text-center">Loading arena data...</p>;
  }

  return (
    <>
      <motion.div 
        key="sprint_setup"
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
              className="p-2.5 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-pink-400 hover:border-pink-500/50 transition-all shadow-lg"
            >
              <Info className="w-5 h-5" />
            </button>
            <div className="text-right">
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm uppercase tracking-tight">
                Draft Your Arena
              </h2>
              <p className="text-pink-400/80 text-sm font-semibold tracking-widest uppercase mt-1">
                10 Questions • 3 Lives • No Mercy
              </p>
            </div>
          </div>
        </div>

        {/* The 4-Card Draft Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {draftedTopics.map((item, index) => (
            <motion.button
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isRerolling ? 0 : 1, 
                y: isRerolling ? 10 : 0, 
                scale: isRerolling ? 0.95 : 1,
                filter: isRerolling ? "blur(4px)" : "blur(0px)"
              }}
              transition={{ duration: 0.3, delay: isRerolling ? 0 : index * 0.1, ease: "easeOut" }}
              whileHover={!isRerolling ? { scale: 1.03, borderColor: "rgba(236, 72, 153, 0.6)" } : {}}
              whileTap={!isRerolling ? { scale: 0.97 } : {}}
              onClick={() => !isRerolling && onSelectTopic(item.topic)}
              className="group relative flex flex-col items-start justify-center p-6 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl cursor-pointer overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
              
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="text-xl font-bold text-zinc-100 group-hover:text-white tracking-wide">
                  {item.topic}
                </div>
                <Crosshair className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 transition-colors" />
              </div>
              <div className="relative z-10 text-xs text-zinc-500 font-mono mt-2 group-hover:text-pink-300/70 transition-colors">
                Available Intel: {item.count} Questions
              </div>
            </motion.button>
          ))}
        </div>

        {/* Limited Reroll Action */}
        <div className="flex justify-center">
          <motion.button
            whileHover={!hasRerolled ? { scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" } : {}}
            whileTap={!hasRerolled ? { scale: 0.95 } : {}}
            onClick={handleReroll}
            disabled={isRerolling || hasRerolled}
            className={`flex items-center gap-3 px-6 py-3 rounded-full border bg-zinc-900/50 backdrop-blur-md transition-all font-semibold uppercase tracking-wider text-sm shadow-lg ${
              hasRerolled 
                ? "border-zinc-800 text-zinc-600 cursor-not-allowed opacity-70" 
                : "border-white/20 text-zinc-300 hover:text-white hover:border-white/40 cursor-pointer"
            }`}
          >
            <motion.div animate={isRerolling ? { rotate: 360 } : {}} transition={{ duration: 0.4, ease: "easeInOut" }}>
              {hasRerolled ? <Lock className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
            </motion.div>
            {hasRerolled ? "Reroll Exhausted" : "Reroll Options (1 Left)"}
          </motion.button>
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
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-6 uppercase tracking-tight">
                Sprint Mode Rules
              </h3>
              
              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <Crosshair className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <p><strong>The Objective:</strong> Survive exactly 10 questions.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </div>
                  <p><strong>3 Strikes:</strong> A wrong answer or a timeout costs 1 life. Lose 3 lives, and your run is terminated immediately.</p>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCcw className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p><strong>Tactical Pass:</strong> Don't know the answer? You can safely <em>Pass</em> to save your life, but it costs points: <br/> <span className="text-zinc-400 mt-1 inline-block">Easy: -3 pts | Medium: -5 pts | Hard: -7 pts</span></p>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}