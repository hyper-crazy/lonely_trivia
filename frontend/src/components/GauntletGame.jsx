import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock as ClockIcon, Heart, ShieldAlert, Trophy, AlertTriangle, FastForward, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchGauntletQuestions } from '../services/api';
import BackButton from './BackButton';
import GameLoader from './GameLoader';

const TIMER_DURATION = 15;
const MAX_LIVES = 3;
const MAX_QUESTIONS = 10;

export default function GauntletGame({ difficulty, onExit, onPlayAgain }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0); 
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [showFleeModal, setShowFleeModal] = useState(false);
  const [countdown, setCountdown] = useState(null); 
  const [streakPopup, setStreakPopup] = useState(null);

  useEffect(() => {
    const savedBest = localStorage.getItem(`gauntletBestScore_${difficulty}`);
    if (savedBest) setBestScore(parseInt(savedBest, 10));
  }, [difficulty]);

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      fetchGauntletQuestions(difficulty),
      new Promise(resolve => setTimeout(resolve, 1111))
    ])
      .then(([data]) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load gauntlet questions:", err);
        setLoading(false);
      });
  }, [difficulty]);

  useEffect(() => {
    if ((isGameOver || isVictory) && score > bestScore) {
      setBestScore(score);
      localStorage.setItem(`gauntletBestScore_${difficulty}`, score);
    }
  }, [isGameOver, isVictory, score, bestScore, difficulty]);

  // Main Question Timer
  useEffect(() => {
    if (loading || selectedAnswer || isGameOver || isVictory || showFleeModal) return;
    
    if (timeLeft === 0) {
      handleWrongAnswer("TIMEOUT");
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, selectedAnswer, isGameOver, isVictory, showFleeModal]);

  useEffect(() => {
    if (!selectedAnswer || isGameOver || isVictory) return;

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          advanceToNextState();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAnswer, isGameOver, isVictory]);

  const handleWrongAnswer = (option) => {
    setSelectedAnswer(option || "TIMEOUT_WRONG");
    setLives(prev => prev - 1);
    setStreak(0); 
  };

  const handleAnswerClick = (option) => {
    if (selectedAnswer) return;
    
    const currentQ = questions[currentIndex];
    const diff = currentQ.difficulty.toLowerCase();

    if (option === currentQ.correct_answer) {
      setSelectedAnswer(option);
      
      let pointsEarned = diff === 'hard' ? 5 : diff === 'medium' ? 3 : 1;
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak === 5) {
        pointsEarned += 25;
        triggerStreakPopup("+25 Streak Bonus!");
      } else if (newStreak === 10) {
        pointsEarned += 50;
        triggerStreakPopup("+50 Max Streak Bonus!");
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

  const triggerStreakPopup = (text) => {
    setStreakPopup(text);
    setTimeout(() => setStreakPopup(null), 2000);
  };

  const advanceToNextState = () => {
    if (lives <= 0) {
      setIsGameOver(true);
      return;
    }
    if (currentIndex >= MAX_QUESTIONS - 1) {
      triggerVictoryConfetti();
      setIsVictory(true);
      return;
    }
    
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setCountdown(null);
    setTimeLeft(TIMER_DURATION);
  };

  const triggerVictoryConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#06b6d4', '#a855f7'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#06b6d4', '#a855f7'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  if (loading) return <GameLoader text={`Initializing ${difficulty} Questions...`} />;

  const currentQ = questions[currentIndex];
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <>
      <motion.div 
        key="gauntlet_game"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col w-full max-w-2xl mx-auto relative"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <BackButton onClick={() => setShowFleeModal(true)} label="Flee" />
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-right justify-end w-full sm:w-auto">
            <div className="flex gap-4">
              <div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Best</div>
                <div className="text-lg font-bold text-white">{bestScore}</div>
              </div>
              <div>
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Score</div>
                <div className="text-xl font-black text-white">{score}</div>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/10" />
            
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(MAX_LIVES)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-zinc-700 opacity-30'}`} 
                  />
                ))}
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Question</div>
                <div className="text-xl font-black text-white">{currentIndex + 1}<span className="text-sm text-zinc-500">/{MAX_QUESTIONS}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GAME OVER / VICTORY VIEW --- */}
        {isGameOver || isVictory ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center justify-center w-full text-center p-8 sm:p-12 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mt-4"
          >
            {isVictory ? (
              <Trophy className="w-20 h-20 text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            ) : (
              <ShieldAlert className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            )}
            
            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
              {isVictory ? "Gauntlet Cleared" : "Run Terminated"}
            </h2>
            <p className="text-zinc-400 mb-8 font-medium">
              {isVictory ? `You survived the ${difficulty} gauntlet.` : `You ran out of lives in the gauntlet.`}
            </p>

            <div className="flex gap-10 mb-10">
              <div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Final Score</div>
                <div className="text-4xl font-black text-cyan-400">{score}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Lives Left</div>
                <div className="text-4xl font-black text-red-400">{lives}</div>
              </div>
            </div>

            {/* Play Again Button with Cyan/Purple Gradient Theme */}
            <motion.div 
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: [1, 1.12, 0.95], transition: { duration: 0.2 } }}
              onClick={onPlayAgain || onExit}
              className="relative overflow-hidden w-full max-w-xs py-4 bg-zinc-900 border border-white/20 rounded-2xl font-bold text-lg text-white shadow-xl cursor-pointer"
            >
              <motion.div 
                className="absolute left-1/2 w-[800px] h-[800px] bg-purple-500/40 z-0"
                style={{ borderRadius: "40%", x: "-50%" }}
                animate={{ rotate: [0, 360] }}
                variants={{ 
                  rest: { top: "75%", transition: { duration: 0.4, ease: "easeOut" } }, 
                  hover: { top: "-700px", transition: { duration: 1.4, ease: "easeInOut" } } 
                }}
                transition={{ rotate: { duration: 6, ease: "linear", repeat: Infinity } }}
              />
              
              <motion.div 
                className="absolute left-1/2 w-[800px] h-[800px] bg-gradient-to-t from-cyan-600 to-purple-600 z-0"
                style={{ borderRadius: "43%", x: "-50%" }}
                animate={{ rotate: [360, 0] }}
                variants={{ 
                  rest: { top: "80%", transition: { duration: 0.7, ease: "easeOut" } }, 
                  hover: { top: "-680px", transition: { duration: 1, ease: "easeInOut" } } 
                }}
                transition={{ rotate: { duration: 7, ease: "linear", repeat: Infinity } }}
              />

              <span className="relative z-10 drop-shadow-md uppercase tracking-wider text-sm">Play Again</span>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* STREAK PROGRESS BAR */}
            <div className="mb-6 p-3 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-600'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Streak: <span className="text-orange-400 font-mono">{streak}x</span>
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase">
                <span className={`px-2 py-0.5 rounded-md transition-colors ${streak >= 5 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-zinc-800/40'}`}>
                  5 Streak (+25)
                </span>
                <span className={`px-2 py-0.5 rounded-md transition-colors ${streak >= 10 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800/40'}`}>
                  10 Streak (+50)
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 sm:p-8 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mb-6 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500"
                initial={{ width: "100%" }}
                animate={{ width: selectedAnswer ? "0%" : `${(timeLeft / TIMER_DURATION) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />

              <div className="flex justify-between items-center mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  {currentQ.topic || difficulty}
                </span>
                <div className={`flex items-center gap-1.5 font-mono text-sm ${timeLeft <= 5 && !selectedAnswer ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`}>
                  <ClockIcon className="w-4 h-4" /> 00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </div>
              
              <motion.h2 
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-semibold leading-relaxed text-zinc-100"
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
              className="grid grid-cols-1 gap-3 relative z-30 mb-6"
            >
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQ.correct_answer;
                const showCorrect = (selectedAnswer && isCorrect); 
                const showWrong = isSelected && !isCorrect && selectedAnswer !== "PASSED";
                const isUnselected = selectedAnswer && !isCorrect && !showWrong;

                let borderStyle = "border-white/10 text-zinc-200 bg-zinc-900/80 backdrop-blur-md";
                if (showCorrect) borderStyle = "border-emerald-500 bg-zinc-900/95 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] z-50";
                if (showWrong) borderStyle = "border-red-500 bg-zinc-900/95 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] z-50";

                return (
                  <motion.button
                    key={index}
                    variants={itemVariants}
                    whileHover={!selectedAnswer && !showFleeModal ? { scale: 1.01, x: 8, backgroundColor: "rgba(39, 39, 42, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
                    whileTap={!selectedAnswer && !showFleeModal ? { scale: 0.97 } : {}}
                    animate={
                      showWrong ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } } :
                      showCorrect ? { scale: [1, 1.03, 1], transition: { duration: 0.4, ease: "easeInOut" } } :
                      isUnselected ? { opacity: 0.3, scale: 0.96, filter: "blur(3px)" } : {}
                    }
                    onClick={() => handleAnswerClick(option)}
                    disabled={!!selectedAnswer || showFleeModal}
                    className={`group relative flex items-center justify-between p-4 rounded-2xl border text-left transition-colors duration-300 overflow-hidden ${borderStyle}`}
                  >
                    {!selectedAnswer && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-cyan-500 rounded-r-full opacity-0 group-hover:h-3/4 group-hover:opacity-100 transition-all duration-300" />
                    )}
                    <span className="font-medium pl-2">{option}</span>
                    <AnimatePresence>
                      {showCorrect && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", damping: 12 }}>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </motion.div>
                      )}
                      {showWrong && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                          <XCircle className="w-6 h-6 text-red-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Tactical Pass Button OR Countdown */}
            <div className="flex justify-center min-h-[50px] items-center">
              <AnimatePresence mode="wait">
                {!selectedAnswer ? (
                  <motion.div 
                    key="pass_btn"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <button
                      onClick={handlePass}
                      disabled={showFleeModal}
                      className="group flex items-center gap-2 px-6 py-3 bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/50 hover:bg-zinc-800 rounded-xl font-semibold tracking-wide transition-all shadow-lg cursor-pointer"
                    >
                      <FastForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Tactical Pass (-{difficulty === 'hard' ? 7 : difficulty === 'medium' ? 5 : 3} pts)
                    </button>
                  </motion.div>
                ) : countdown !== null ? (
                  <motion.div 
                    key="countdown_msg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                      {lives <= 0 ? "Run Ends In" : "Next Question In"}
                    </span>
                    <motion.span 
                      key={countdown}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] font-mono mt-1"
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
              <AlertTriangle className="w-14 h-14 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Abandon Run?</h3>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                If you flee now, your current progress will be lost and your score will not be recorded.
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowFleeModal(false)} className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold tracking-wide transition-colors cursor-pointer">
                  Stay
                </button>
                <button onClick={onExit} className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold tracking-wide transition-colors cursor-pointer">
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