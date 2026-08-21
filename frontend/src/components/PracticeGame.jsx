import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock as ClockIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchPracticeQuestions } from '../services/api';
import BackButton from './BackButton';
import GameLoader from './GameLoader';

const TIMER_DURATION = 15;

export default function PracticeGame({ topic, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Gameplay State
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  useEffect(() => {
    const savedBest = localStorage.getItem(`bestScore_${topic}`);
    if (savedBest) setBestScore(parseInt(savedBest, 10));
    loadQuestions();
  }, [topic]);

  useEffect(() => {
    if (loading || selectedAnswer) return;
    
    if (timeLeft === 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, selectedAnswer]);

  const loadQuestions = () => {
    setLoading(true);
    
    Promise.all([
      fetchPracticeQuestions(topic),
      new Promise(resolve => setTimeout(resolve, 1111))
    ])
      .then(([data]) => {
        setQuestions(data);
        setCurrentIndex(0);
        resetTurn();
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load questions:", err);
        setLoading(false);
      });
  };

  const resetTurn = () => {
    setSelectedAnswer(null);
    setTimeLeft(TIMER_DURATION);
  };

  const updateBestScore = (newScore) => {
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem(`bestScore_${topic}`, newScore);
    }
  };

  const handleTimeOut = () => {
    setSelectedAnswer("TIMEOUT_WRONG");
    setWrongCount(prev => prev + 1);
  };

  const handleAnswerClick = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    
    if (option === questions[currentIndex].correct_answer) {
      const newScore = score + 1;
      setScore(newScore);
      updateBestScore(newScore);
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  const handleNextWithPop = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = (rect.left + (rect.width / 2)) / window.innerWidth;
    const y = (rect.top + (rect.height / 2)) / window.innerHeight;
    
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { x, y },
      colors: ['#ec4899', '#f472b6', '#fbcfe8', '#ffffff'],
      disableForReducedMotion: true,
      zIndex: 100
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetTurn();
    } else {
      loadQuestions();
    }
  };

  if (loading) {
    return <GameLoader text={`Initializing ${topic} Questions...`} />;
  }

  const currentQ = questions[currentIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      key="practice_game"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col w-full max-w-xl mx-auto h-full justify-center px-2 py-2 overflow-hidden"
    >
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <BackButton onClick={onExit} label="Exit" />
        
        <div className="flex items-center gap-3 sm:gap-4 text-right justify-end">
          <div>
            <div className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Wrong</div>
            <div className="text-sm sm:text-base font-bold text-white">{wrongCount}</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <div className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">Best</div>
            <div className="text-sm sm:text-base font-bold text-white">{bestScore}</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <div className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Score</div>
            <div className="text-base sm:text-lg font-black text-white">{score}</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl mb-3 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500"
          initial={{ width: "100%" }}
          animate={{ width: selectedAnswer ? "0%" : `${(timeLeft / TIMER_DURATION) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />

        <div className="flex justify-between items-center mb-3">
          <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
            {currentQ.difficulty}
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

      {/* Options Grid with Staggered Animations */}
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
          const showCorrect = selectedAnswer && isCorrect;
          const showWrong = isSelected && !isCorrect;
          const isUnselected = selectedAnswer && !isSelected;

          let borderStyle = "border-white/10 text-zinc-200 bg-zinc-900/80 backdrop-blur-md";
          if (showCorrect) borderStyle = "border-emerald-500 bg-zinc-900/95 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] z-50";
          if (showWrong) borderStyle = "border-red-500 bg-zinc-900/95 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)] z-50";

          return (
            <motion.button
              key={index}
              variants={itemVariants}
              whileHover={!selectedAnswer ? { scale: 1.01, x: 4, backgroundColor: "rgba(39, 39, 42, 0.8)", borderColor: "rgba(236, 72, 153, 0.5)" } : {}}
              whileTap={!selectedAnswer ? { scale: 0.97 } : {}}
              animate={
                showWrong ? { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } } :
                showCorrect ? { scale: [1, 1.02, 1], transition: { duration: 0.4, ease: "easeInOut" } } :
                isUnselected ? { opacity: 0.3, scale: 0.96, filter: "blur(3px)" } :
                {}
              }
              onClick={() => handleAnswerClick(option)}
              disabled={!!selectedAnswer}
              className={`group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-colors duration-300 overflow-hidden ${borderStyle}`}
            >
              {!selectedAnswer && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-pink-500 rounded-r-full opacity-0 group-hover:h-3/4 group-hover:opacity-100 transition-all duration-300" />
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

      {/* Next Question Button with Double-Wave Fluid Animation */}
      <AnimatePresence>
        {selectedAnswer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            className="flex justify-center z-20"
          >
            <motion.button
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: [1, 1.12, 0.95], transition: { duration: 0.2 } }}
              onClick={handleNextWithPop}
              className="relative overflow-hidden w-full max-w-xs py-3.5 bg-zinc-900 border border-white/20 rounded-2xl font-bold text-base text-white shadow-xl cursor-pointer text-center"
            >
              <motion.div 
                className="absolute left-1/2 w-[600px] h-[600px] bg-pink-500/40 z-0"
                style={{ borderRadius: "40%", x: "-50%" }}
                animate={{ rotate: [0, 360] }}
                variants={{ 
                  rest: { top: "75%", transition: { duration: 0.4, ease: "easeOut" } }, 
                  hover: { top: "-700px", transition: { duration: 1.4, ease: "easeInOut" } } 
                }}
                transition={{ rotate: { duration: 6, ease: "linear", repeat: Infinity } }}
              />
              <motion.div 
                className="absolute left-1/2 w-[600px] h-[600px] bg-gradient-to-t from-pink-600 to-rose-600 z-0"
                style={{ borderRadius: "43%", x: "-50%" }}
                animate={{ rotate: [360, 0] }}
                variants={{ 
                  rest: { top: "80%", transition: { duration: 0.7, ease: "easeOut" } }, 
                  hover: { top: "-680px", transition: { duration: 1, ease: "easeInOut" } } 
                }}
                transition={{ rotate: { duration: 7, ease: "linear", repeat: Infinity } }}
              />
              <span className="relative z-10 drop-shadow-md text-xs uppercase tracking-wider">Next Question</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}