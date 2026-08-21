import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, RefreshCcw, Lock, Info, X, Heart, Trophy, Zap, Flame } from 'lucide-react'; 
import BackButton from './BackButton';
import SprintGame from './SprintGame';

const MAX_LIVES = 5;

export default function SprintSetup({ topics, onBack }) {
  const [activeTopic, setActiveTopic] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0); 
  const [currentLives, setCurrentLives] = useState(MAX_LIVES); 
  const [streakStats, setStreakStats] = useState({ streak5: 0, streak10: 0 });
  const [runEnded, setRunEnded] = useState(false);
  const [lastRunStats, setLastRunStats] = useState(null);
  const [floatingHeartPopup, setFloatingHeartPopup] = useState(false);

  const [draftedTopics, setDraftedTopics] = useState([]);
  const [isRerolling, setIsRerolling] = useState(false);
  const [hasRerolled, setHasRerolled] = useState(false); 
  const [showRules, setShowRules] = useState(false); 

  const availableTopics = topics ? topics.filter(t => !completedTopics.includes(t.topic)) : [];
  const currentRound = completedTopics.length + 1;

  const dealTopics = () => {
    if (!availableTopics || availableTopics.length === 0) return;
    const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
    setDraftedTopics(shuffled.slice(0, 4));
  };

  useEffect(() => {
    dealTopics();
  }, [completedTopics, topics]);

  const handleReroll = () => {
    if (hasRerolled) return; 
    setIsRerolling(true);
    setHasRerolled(true); 
    
    setTimeout(() => {
      dealTopics();
      setIsRerolling(false);
    }, 350); 
  };

  const handleStageComplete = (stageScore, topicName, roundStreaks, endingStreak, survivingLives, clearedCleanly) => {
    const newTotalScore = accumulatedScore + stageScore;
    const newCompleted = [...completedTopics, topicName];
    const newStreakStats = {
      streak5: streakStats.streak5 + (roundStreaks?.streak5 || 0),
      streak10: streakStats.streak10 + (roundStreaks?.streak10 || 0)
    };

    const restoredLives = clearedCleanly ? Math.min(MAX_LIVES, survivingLives + 1) : survivingLives;

    setAccumulatedScore(newTotalScore);
    setCompletedTopics(newCompleted);
    setStreakStats(newStreakStats);
    setCurrentStreak(endingStreak); 
    setCurrentLives(restoredLives);
    setActiveTopic(null);
    setHasRerolled(false);

    if (newCompleted.length >= (topics?.length || 15) || availableTopics.length <= 1) {
      setLastRunStats({
        score: newTotalScore,
        roundsPlayed: newCompleted.length,
        ...newStreakStats,
        cleared: true
      });
      setRunEnded(true);
    } else if (clearedCleanly && restoredLives > survivingLives) {
      setFloatingHeartPopup(true);
      setTimeout(() => {
        setFloatingHeartPopup(false);
      }, 1400);
    }
  };

  const handleGameOver = (finalScore, roundStreaks) => {
    const finalTotalScore = accumulatedScore + finalScore;
    const finalStreakStats = {
      streak5: streakStats.streak5 + (roundStreaks?.streak5 || 0),
      streak10: streakStats.streak10 + (roundStreaks?.streak10 || 0)
    };

    setLastRunStats({
      score: finalTotalScore,
      roundsPlayed: completedTopics.length + 1,
      ...finalStreakStats,
      cleared: false
    });
    setRunEnded(true);
    setActiveTopic(null);
  };

  if (!topics || topics.length === 0) {
    return <p className="text-zinc-500 animate-pulse mt-20 text-center">Loading arena data...</p>;
  }

  // --- RUN ENDED / SUMMARY SCREEN ---
  if (runEnded && lastRunStats) {
    const bestKey = 'sprintRunBestScore';
    const savedBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
    const isNewBest = lastRunStats.score > savedBest;
    if (isNewBest) {
      localStorage.setItem(bestKey, lastRunStats.score.toString());
    }
    const bestScore = Math.max(lastRunStats.score, savedBest);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center w-full max-w-lg mx-auto text-center p-6 sm:p-8 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl my-auto"
      >
        <Trophy className="w-16 h-16 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 uppercase tracking-tight">
          {lastRunStats.cleared ? "Grandmaster Sweep!" : "Run Terminated"}
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6 font-medium">
          {lastRunStats.cleared ? "You successfully conquered all rounds!" : "Your run came to an end."}
        </p>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 text-left bg-zinc-950/60 p-4 rounded-xl border border-white/5 font-mono text-xs">
          <div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Total Score</div>
            <div className="text-xl font-black text-purple-400">{lastRunStats.score}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Best Score</div>
            <div className="text-xl font-black text-white">{bestScore}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Rounds Played</div>
            <div className="text-base font-bold text-zinc-200">{lastRunStats.roundsPlayed} / {topics.length}</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Streaks (5x/10x)</div>
            <div className="text-base font-bold text-orange-400">{lastRunStats.streak5} / {lastRunStats.streak10}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          {/* Restored Double-Wave Fluid Play Again Button */}
          <motion.div 
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: [1, 1.12, 0.95], transition: { duration: 0.2 } }}
            onClick={() => {
              setCompletedTopics([]);
              setAccumulatedScore(0);
              setCurrentStreak(0);
              setCurrentLives(MAX_LIVES);
              setStreakStats({ streak5: 0, streak10: 0 });
              setRunEnded(false);
              setLastRunStats(null);
            }}
            className="relative overflow-hidden flex-1 py-3 bg-zinc-900 border border-white/20 rounded-xl font-bold text-sm text-white shadow-xl cursor-pointer text-center"
          >
            <motion.div 
              className="absolute left-1/2 w-[600px] h-[600px] bg-purple-600/40 z-0"
              style={{ borderRadius: "40%", x: "-50%" }}
              animate={{ rotate: [0, 360] }}
              variants={{ 
                rest: { top: "75%", transition: { duration: 0.4, ease: "easeOut" } }, 
                hover: { top: "-700px", transition: { duration: 1.4, ease: "easeInOut" } } 
              }}
              transition={{ rotate: { duration: 6, ease: "linear", repeat: Infinity } }}
            />
            <motion.div 
              className="absolute left-1/2 w-[600px] h-[600px] bg-gradient-to-t from-purple-700 to-indigo-600 z-0"
              style={{ borderRadius: "43%", x: "-50%" }}
              animate={{ rotate: [360, 0] }}
              variants={{ 
                rest: { top: "80%", transition: { duration: 0.7, ease: "easeOut" } }, 
                hover: { top: "-680px", transition: { duration: 1, ease: "easeInOut" } } 
              }}
              transition={{ rotate: { duration: 7, ease: "linear", repeat: Infinity } }}
            />
            <span className="relative z-10 drop-shadow-md uppercase tracking-wider text-xs">Play Again</span>
          </motion.div>

          <button 
            onClick={onBack} 
            className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs tracking-wide transition-colors cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </motion.div>
    );
  }

  // Active Game View
  if (activeTopic) {
    return (
      <SprintGame 
        topic={activeTopic} 
        roundNumber={currentRound}
        totalRounds={topics.length}
        currentAccumulatedScore={accumulatedScore}
        initialStreak={currentStreak}
        initialLives={currentLives}
        onExit={onBack} 
        onPlayAgain={(stageScore, streaks, finalRoundStreak, remainingLives, clearedCleanly) => handleStageComplete(stageScore, activeTopic, streaks, finalRoundStreak, remainingLives, clearedCleanly)} 
        onGameOver={(finalScore, streaks) => handleGameOver(finalScore, streaks)}
      />
    );
  }

  return (
    <>
      <motion.div 
        key="sprint_setup"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col w-full max-w-xl mx-auto h-full justify-center px-2 py-2 overflow-hidden relative"
      >
        {/* Persistent Heart Refill Visual Notification */}
        <AnimatePresence>
          {floatingHeartPopup && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: -35, scale: 0.9 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] pointer-events-none"
            >
              +1 ❤️ Heart Restored!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Aligned Buttons */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <BackButton onClick={onBack} label="Retreat" />
            <button 
              onClick={() => setShowRules(true)}
              className="p-2 rounded-xl bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-pink-400 hover:border-pink-500/50 transition-all shadow-lg cursor-pointer flex items-center justify-center"
              title="Topic Sprint Rules"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-xs font-bold flex items-center gap-2">
              <span>Score: <strong className="text-white">{accumulatedScore}</strong></span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-pink-400">R{currentRound}/{topics.length}</span>
            </div>
          </div>
        </div>

        {/* The 4-Card Draft Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4">
          {draftedTopics.map((item, index) => (
            <motion.button
              key={index} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: isRerolling ? 0 : 1, 
                y: isRerolling ? 10 : 0, 
                scale: isRerolling ? 0.95 : 1,
                filter: isRerolling ? "blur(4px)" : "blur(0px)"
              }}
              transition={{ duration: 0.3, delay: isRerolling ? 0 : index * 0.06, ease: "easeOut" }}
              whileHover={!isRerolling ? { scale: 1.02, borderColor: "rgba(236, 72, 153, 0.6)" } : {}}
              whileTap={!isRerolling ? { scale: 0.98 } : {}}
              onClick={() => !isRerolling && setActiveTopic(item.topic)}
              className="group relative flex flex-col items-start justify-center p-3.5 sm:p-4 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl cursor-pointer overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
              
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white tracking-wide truncate">
                  {item.topic}
                </div>
                <Crosshair className="w-4 h-4 text-zinc-600 group-hover:text-pink-400 transition-colors shrink-0" />
              </div>
              <div className="relative z-10 text-[10px] sm:text-xs text-zinc-500 font-mono mt-1 group-hover:text-pink-300/70 transition-colors">
                Available Intel: {item.count} Questions
              </div>
            </motion.button>
          ))}
        </div>

        {/* Limited Reroll Action */}
        <div className="flex justify-center">
          <motion.button
            whileHover={!hasRerolled ? { scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.1)" } : {}}
            whileTap={!hasRerolled ? { scale: 0.95 } : {}}
            onClick={handleReroll}
            disabled={isRerolling || hasRerolled}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border bg-zinc-900/50 backdrop-blur-md transition-all font-semibold uppercase tracking-wider text-xs shadow-lg ${
              hasRerolled 
                ? "border-zinc-800 text-zinc-600 cursor-not-allowed opacity-70" 
                : "border-white/20 text-zinc-300 hover:text-white hover:border-white/40 cursor-pointer"
            }`}
          >
            <motion.div animate={isRerolling ? { rotate: 360 } : {}} transition={{ duration: 0.4, ease: "easeInOut" }}>
              {hasRerolled ? <Lock className="w-3.5 h-3.5" /> : <RefreshCcw className="w-3.5 h-3.5" />}
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
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6 uppercase tracking-tight">
                Sprint Rules
              </h3>
              
              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <Crosshair className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <p><strong>Draft Arenas:</strong> Choose a topic category for each round and complete 10 rapid questions.</p>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 shrink-0 mt-0.5" />
                  <p><strong>Heart Regeneration:</strong> Clear a round cleanly without failing or passing your final question to restore +1 ❤️ Heart.</p>
                </li>
                <li className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <p><strong>Streak Bonuses:</strong> Build streaks for bonus points (+25 at 5x, +50 at 10x).</p>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}