import { motion } from 'framer-motion';
import BackButton from './BackButton';

export default function PracticeTopics({ topics, loading, onBack, onSelectTopic }) {
  return (
    <motion.div 
      key="practice_topics"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col w-full max-w-3xl mx-auto h-full justify-center px-2 py-2 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <BackButton onClick={onBack} label="Back to Menu" />
        <h2 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-tight text-right">
          Select Practice Topic
        </h2>
      </div>

      {loading ? (
        <p className="text-center text-zinc-500 py-12 text-sm">Loading topics from database...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {topics.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTopic(item.topic)}
              className="group relative p-3 sm:p-4 bg-zinc-900/90 border border-white/10 rounded-xl text-left font-medium transition-all duration-300 cursor-pointer shadow-xl overflow-hidden hover:border-pink-500/50 hover:shadow-pink-500/10"
            >
              {/* Anime-Style Glass Reflection Sweep Layer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="text-xs sm:text-base text-zinc-100 font-bold tracking-wide group-hover:text-pink-300 transition-colors leading-snug truncate">
                  {item.topic}
                </div>
                <div className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">
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