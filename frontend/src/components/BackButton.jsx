import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick, label = "Back" }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-xl cursor-pointer shadow-lg overflow-hidden shrink-0"
    >
      <motion.div 
        className="text-zinc-400 group-hover:text-pink-400 transition-colors"
        whileHover={{ x: -3 }}
        transition={{ duration: 0.2 }}
      >
        <ArrowLeft className="w-4 h-4" />
      </motion.div>
      <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
        {label}
      </span>
    </motion.button>
  );
}