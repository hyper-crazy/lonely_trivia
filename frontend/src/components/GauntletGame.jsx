import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock as ClockIcon, Heart, ShieldAlert, Trophy, AlertTriangle, FastForward, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchGauntletQuestions } from '../services/api';
import BackButton from './BackButton';
import GameLoader from './GameLoader';

const TIMER_DURATION = 15;
const MAX_LIVES = 5;

export default function GauntletGame({ difficulty, onExit, onPlayAgain }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalAnsweredCount, setTotalAnsweredCount] = useState(0); 
  const [loading, setLoading] = useState(true);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0); 
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFleeModal, setShowFleeModal] = useState(false);
  const [countdown, setCountdown] = useState(null); 
  const [floatingText, setFloatingText] = useState(null); 

  const streakCountersRef = useRef({ streak5: 0, streak10: 0 });
  const isAdvancingRef = useRef(false);

  useEffect(() => {
    const savedBest = localStorage.getItem(`gauntletBestScore_${difficulty}`);
    if (savedBest) setBestScore(parseInt(savedBest, 10));
  }, [difficulty]);

  useEffect(() => {
    loadQuestions(true); 
  }, [difficulty]);

  useEffect(() => {
    if (isGameOver && score > bestScore) {
      setBestScore(score);
      localStorage.setItem(`gauntletBestScore_${difficulty}`, score);
    }
  }, [isGameOver, score, bestScore, difficulty]);

  const loadQuestions = (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    Promise.all([
      fetchGauntletQuestions(difficulty),
      new Promise(resolve => setTimeout(resolve, isInitial ? 1111 : 300))
    ])
      .then(([data]) => {
        setQuestions(data);
        setCurrentIndex(0);
        if (isInitial) setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load gauntlet questions:", err);
        if (isInitial) setLoading(false);
      });
  };

  // Main Question Timer
  useEffect(() => {
    if (loading || selectedAnswer || isGameOver || showFleeModal) return;
    
    if (timeLeft === 0) {
      handleWrongAnswer("TIMEOUT");
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, selectedAnswer, isGameOver, showFleeModal]);

  // Auto-Advance Countdown Trigger
  useEffect(() => {
    if (!selectedAnswer || isGameOver) return;

    isAdvancingRef.current = false;
    setCountdown(3);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!isAdvancingRef.current) {
            isAdvancingRef.current = true;
            advanceToNextState();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAnswer, isGameOver]);

  const handleWrongAnswer = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option || "TIMEOUT_WRONG");
    setLives(prev => Math.max(0, prev - 1));
    setStreak(0); 
  };

  const handleAnswerClick = (option) => {
    if (selectedAnswer) return;
    
    const currentQ = questions[currentIndex];
    const diff = currentQ.difficulty.toLowerCase();

    if (option === currentQ.correct_answer) {
      setSelectedAnswer(option);
      
      let pointsEarned = diff === 'hard' ? 5 : diff === 'medium' ? 3 : 1;
      const newStreak = streak >= 10 ? 1 : streak + 1;
      setStreak(newStreak);

      if (newStreak === 5) {
        pointsEarned += 25;
        streakCountersRef.current.streak5 += 1;
        triggerFloatingText("+25 pts", 'streak');
      } else if (newStreak === 10) {
        pointsEarned += 50;
        streakCountersRef.current.streak10 += 1;
        triggerFloatingText("+50 pts", 'streak');
      }

      setScore(prev => prev + pointsEarned);
    } else {
      handleWrongAnswer(option);
    }
  };

  const handlePass = () => {
    if (selectedAnswer) return;
    
    const currentQ = questions[currentIndex];
    const diff = currentQ.difficulty.toLowerCase();
    const penalty = diff === 'hard' ? 7 : diff === 'medium' ? 5 : 3;
    
    setScore(prev => prev - penalty);
    setStreak(0); 
    setSelectedAnswer("PASSED");
  };

  const triggerFloatingText = (text, type) => {
    const id = Date.now();
    setFloatingText({ id, text, type });
    setTimeout(() => {
      setFloatingText(prev => prev?.id === id ? null : prev);
    }, 1000);
  };

  const advanceToNextState = () => {
    if (lives <= 0) {
      setIsGameOver(true);
      return;
    }

    const nextAnsweredCount = totalAnsweredCount + 1;
    setTotalAnsweredCount(nextAnsweredCount);

    if (currentIndex >= questions.length - 1) {
      loadQuestions(false);
      setSelectedAnswer(null);
      setCountdown(null);
      setTimeLeft(TIMER_DURATION);
      return;
    }
    
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setCountdown(null);
    setTimeLeft(TIMER_DURATION);
  };

  if (loading) return <GameLoader text={`Initializing ${difficulty} Gauntlet...`} />;

  const currentQ = questions[currentIndex];
  if (!currentQ && !isGameOver) return null;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <>
      <motion.div 
        key="gauntlet_game"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col w-full max-w-xl mx-auto relative h-full justify-center px-2 py-2 overflow-hidden"
      >
        {/* Simple Fade-In / Fade-Out Floating Text */}
        <AnimatePresence>
          {floatingText && (
            <motion.div
              key={floatingText.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: -25 }}
              exit={{ opacity: 0, y: -45 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl font-bold text-sm tracking-wide pointer-events-none shadow-md bg-cyan-500/90 text-white"
            >
              {floatingText.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header - Hidden when Game Over */}
        {!isGameOver && (
          <div className="flex flex-row items-center justify-between mb-4 gap-2">
            <BackButton onClick={() => setShowFleeModal(true)} label="Flee" />
            
            <div className="flex items-center gap-3 sm:gap-4 text-right justify-end">
              <div className="flex gap-3">
                <div>
                  <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">Best</div>
                  <div className="text-sm sm:text-base font-bold text-white">{bestScore}</div>
                </div>
                <div>
                  <div className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Score</div>
                  <div className="text-base sm:text-lg font-black text-white">{score}</div>
                </div>
              </div>

              <div className="w-px h-6 bg-white/10" />
              
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(MAX_LIVES)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-500 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]' : 'text-zinc-700 opacity-30'}`} 
                    />
                  ))}
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Ques</div>
                  <div className="text-base sm:text-lg font-black text-white">{totalAnsweredCount + 1}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- GAME OVER VIEW --- */}
        {isGameOver ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center justify-center w-full text-center p-6 sm:p-8 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl my-auto"
          >
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 uppercase tracking-tight">Run Terminated</h2>
            <p className="text-zinc-400 text-xs sm:text-sm mb-6 font-medium">You ran out of lives in the gauntlet.</p>

            {/* Detailed Stats Grid with Streaks instead of Lives Left */}
            <div className="grid grid-cols-2 gap-3 w-full mb-6 text-left bg-zinc-950/60 p-4 rounded-xl border border-white/5 font-mono text-xs">
              <div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Final Score</div>
                <div className="text-xl font-black text-cyan-400">{score}</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Best Score</div>
                <div className="text-xl font-black text-white">{bestScore}</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Questions Survived</div>
                <div className="text-base font-bold text-zinc-200">{totalAnsweredCount}</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Streaks (5x / 10x)</div>
                <div className="text-base font-bold text-orange-400">{streakCountersRef.current.streak5} / {streakCountersRef.current.streak10}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              {/* Double-Wave Fluid Play Again Button */}
              <motion.div 
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: [1, 1.12, 0.95], transition: { duration: 0.2 } }}
                onClick={onPlayAgain || onExit}
                className="relative overflow-hidden flex-1 py-3 bg-zinc-900 border border-white/20 rounded-xl font-bold text-sm text-white shadow-xl cursor-pointer text-center"
              >
                <motion.div 
                  className="absolute left-1/2 w-[600px] h-[600px] bg-cyan-500/40 z-0"
                  style={{ borderRadius: "40%", x: "-50%" }}
                  animate={{ rotate: [0, 360] }}
                  variants={{ 
                    rest: { top: "75%", transition: { duration: 0.4, ease: "easeOut" } }, 
                    hover: { top: "-700px", transition: { duration: 1.4, ease: "easeInOut" } } 
                  }}
                  transition={{ rotate: { duration: 6, ease: "linear", repeat: Infinity } }}
                />
                <motion.div 
                  className="absolute left-1/2 w-[600px] h-[600px] bg-gradient-to-t from-cyan-600 to-purple-600 z-0"
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
                onClick={onExit} 
                className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs tracking-wide transition-colors cursor-pointer"
              >
                Main Menu
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* STREAK PROGRESS BAR */}
            <div className="mb-3 p-2.5 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-600'}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Streak: <span className="text-orange-400 font-mono">{streak}x</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase">
                <span className={`px-1.5 py-0.5 rounded-md transition-colors ${streak >= 5 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-zinc-800/40'}`}>
                  5x (+25)
                </span>
                <span className={`px-1.5 py-0.5 rounded-md transition-colors ${streak >= 10 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800/40'}`}>
                  10x (+50)
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl mb-3 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500"
                initial={{ width: "100%" }}
                animate={{ width: selectedAnswer ? "0%" : `${(timeLeft / TIMER_DURATION) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />

              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                  {currentQ.topic || difficulty}
                </span>
                <div className={`flex items-center gap-1 font-mono text-xs ${timeLeft <= 5 && !selectedAnswer ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`}>
                  <ClockIcon className="w-3.5 h-3.5" /> 00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </div>
              
              <motion.h2 
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base sm:text-lg font-semibold leading-snug text-zinc-100"
              >
                {currentQ.question}
              </motion.h2>
            </div>

            {/* Options Grid */}
            <motion.div 
              key={`options-${currentIndex}`} 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-2 sm:gap-2.5 relative z-30 mb-3"
            >
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQ.correct_answer;
                const showCorrect = (selectedAnswer && isCorrect); 
                const showWrong = isSelected && !isCorrect && selectedAnswer !== "PASSED";
                const isUnselected = selectedAnswer && !isCorrect && !showWrong;

                let borderStyle = "border-white/10 text-zinc-200 bg-zinc-900/80 backdrop-blur-md";
                if (showCorrect) borderStyle = "border-emerald-500 bg-zinc-900/95 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] z-50";
                if (showWrong) borderStyle = "border-red-500 bg-zinc-900/95 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)] z-50";

                return (
                  <motion.button
                    key={index}
                    variants={itemVariants}
                    whileHover={!selectedAnswer && !showFleeModal ? { scale: 1.01, x: 4, backgroundColor: "rgba(39, 39, 42, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
                    whileTap={!selectedAnswer && !showFleeModal ? { scale: 0.97 } : {}}
                    animate={
                      showWrong ? { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } } :
                      showCorrect ? { scale: [1, 1.02, 1], transition: { duration: 0.4, ease: "easeInOut" } } :
                      isUnselected ? { opacity: 0.3, scale: 0.96, filter: "blur(3px)" } : {}
                    }
                    onClick={() => handleAnswerClick(option)}
                    disabled={!!selectedAnswer || showFleeModal}
                    className={`group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-colors duration-300 overflow-hidden ${borderStyle}`}
                  >
                    {!selectedAnswer && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-cyan-500 rounded-r-full opacity-0 group-hover:h-3/4 group-hover:opacity-100 transition-all duration-300" />
                    )}
                    <span className="font-medium pl-1.5">{option}</span>
                    <AnimatePresence>
                      {showCorrect && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", damping: 12 }}>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        </motion.div>
                      )}
                      {showWrong && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Tactical Pass Button OR Countdown */}
            <div className="flex justify-center min-h-[40px] items-center">
              <AnimatePresence mode="wait">
                {!selectedAnswer ? (
                  <motion.div 
                    key="pass_btn"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <button
                      onClick={handlePass}
                      disabled={showFleeModal}
                      className="group flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/50 hover:bg-zinc-800 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer"
                    >
                      <FastForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      Tactical Pass (-{currentQ.difficulty.toLowerCase() === 'hard' ? 7 : currentQ.difficulty.toLowerCase() === 'medium' ? 5 : 3} pts)
                    </button>
                  </motion.div>
                ) : countdown !== null ? (
                  <motion.div 
                    key="countdown_msg"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      {lives <= 0 ? "Run Ends In" : "Next Question In"}
                    </span>
                    <motion.span 
                      key={countdown}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] font-mono leading-tight"
                    >
                      {countdown}
                    </motion.span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>

      {/* Flee Modal */}
      <AnimatePresence>
        {showFleeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <AlertTriangle className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Abandon Run?</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mb-6 leading-relaxed">
                If you flee now, your current progress will be lost and your score will not be recorded.
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowFleeModal(false)} className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer">
                  Stay
                </button>
                <button onClick={onExit} className="flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer">
                  Flee
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}