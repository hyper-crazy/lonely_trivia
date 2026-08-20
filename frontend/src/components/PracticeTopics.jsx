import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import BackButton from './BackButton';

export default function PracticeTopics({ topics, loading, onBack, onSelectTopic }) {
  return (
    <motion.div 
      key="practice_topics"
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col w-full"
    >
      <div className="flex items-center justify-between mb-8 px-1">
        <BackButton onClick={onBack} label="Back to Menu" />
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Select Practice Topic
        </h2>
      </div>

      {loading ? (
        <p className="text-center text-zinc-500 py-12">Loading topics from database...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto p-2">
          {topics.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectTopic(item.topic)}
              className="group relative p-5 bg-zinc-900/90 border border-white/10 rounded-2xl text-left font-medium transition-all duration-300 cursor-pointer shadow-xl overflow-hidden hover:border-pink-500/50 hover:shadow-pink-500/10"
            >
              {/* Anime-Style Glass Reflection Sweep Layer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="text-base text-zinc-100 font-bold tracking-wide group-hover:text-pink-300 transition-colors">
                  {item.topic}
                </div>
                <div className="text-xs text-zinc-400 font-medium mt-1">
                  {item.count} verified questions
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}