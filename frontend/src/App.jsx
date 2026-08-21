import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { fetchTopics } from './services/api';
import HomeMenu from './components/HomeMenu';
import PracticeTopics from './components/PracticeTopics';
import PracticeGame from './components/PracticeGame';
import SprintSetup from './components/SprintSetup';
import SprintGame from './components/SprintGame';
import GauntletSetup from './components/GauntletSetup';
import GauntletGame from './components/GauntletGame';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'practice_topics' | 'sprint_setup' | etc.
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeGauntletDiff, setActiveGauntletDiff] = useState(null);

  useEffect(() => {
    // Load topics via service
    fetchTopics()
      .then(data => {
        setTopics(data);
        setLoading(false);
      })
      .catch(err => console.error("Could not load topics:", err));

    // Mouse tracker event listener
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-[100dvh] w-screen bg-[#09090b] text-white flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden relative">
      
      {/* Interactive Mouse Tracker Glow (Desktop Only) */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.22), rgba(236, 72, 153, 0.12), transparent 80%)`
        }}
      />

      {/* Static ambient background orbs */}
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none -bottom-32 -right-32" />

      {/* Main Responsive Container */}
      <div className="w-full max-w-4xl h-full mx-auto flex flex-col items-center justify-center z-10 px-2 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <HomeMenu 
              key="home" 
              onSelectMode={(mode) => {
                if (mode === 'sprint_setup') setCurrentScreen('sprint_setup');
                else if (mode === 'gauntlet_setup') setCurrentScreen('gauntlet_setup');
                else if (mode === 'practice_setup' || mode === 'practice_topics') setCurrentScreen('practice_topics');
              }} 
            />
          )}

          {/* SPRINT MODE ROUTES */}
          {currentScreen === 'sprint_setup' && (
            <SprintSetup 
              key="sprint_setup" 
              topics={topics} 
              onBack={() => setCurrentScreen('home')}
              onSelectTopic={(topicName) => {
                setActiveTopic(topicName);
                setCurrentScreen('sprint_game');
              }}
            />
          )}

          {currentScreen === 'sprint_game' && (
            <SprintGame 
              key="sprint_game"
              topic={activeTopic}
              onExit={() => setCurrentScreen('home')}
              onPlayAgain={() => setCurrentScreen('sprint_setup')}
            />
          )}

          {/* GLOBAL GAUNTLET MODE ROUTES */}
          {currentScreen === 'gauntlet_setup' && (
            <GauntletSetup 
              key="gauntlet_setup"
              onBack={() => setCurrentScreen('home')}
              onSelectDifficulty={(diff) => {
                setActiveGauntletDiff(diff);
                setCurrentScreen('gauntlet_game');
              }}
            />
          )}

          {currentScreen === 'gauntlet_game' && (
            <GauntletGame 
              key="gauntlet_game"
              difficulty={activeGauntletDiff}
              onExit={() => setCurrentScreen('home')}
              onPlayAgain={() => setCurrentScreen('gauntlet_setup')}
            />
          )}

          {/* PRACTICE MODE ROUTES */}
          {currentScreen === 'practice_topics' && (
            <PracticeTopics 
              key="practice_topics" 
              topics={topics} 
              loading={loading} 
              onBack={() => setCurrentScreen('home')}
              onSelectTopic={(topicName) => {
                setActiveTopic(topicName);
                setCurrentScreen('practice_game');
              }}
            />
          )}

          {currentScreen === 'practice_game' && (
            <PracticeGame 
              key="practice_game"
              topic={activeTopic}
              onExit={() => setCurrentScreen('practice_topics')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}