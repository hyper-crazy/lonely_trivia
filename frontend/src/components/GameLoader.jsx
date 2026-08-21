import { motion } from 'framer-motion';

const THEMES = {
  purple: {
    text: "from-purple-400 via-fuchsia-400 to-indigo-400",
    colors: ["#c084fc", "#e879f9", "#818cf8", "#f43f5e", "#c084fc"],
    shadow: "rgba(192, 132, 252, 0.6)"
  },
  pink: {
    text: "from-pink-400 via-rose-400 to-purple-400",
    colors: ["#f43f5e", "#ec4899", "#fb7185", "#d946ef", "#f43f5e"],
    shadow: "rgba(244, 63, 94, 0.6)"
  },
  cyan: {
    text: "from-cyan-400 via-teal-400 to-purple-400",
    colors: ["#22d3ee", "#2dd4bf", "#38bdf8", "#818cf8", "#22d3ee"],
    shadow: "rgba(34, 211, 238, 0.6)"
  }
};

export default function GameLoader({ text = "Loading Arena...", theme = "purple" }) {
  const currentTheme = THEMES[theme] || THEMES.purple;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center relative select-none py-10">
      {/* iOS Dock-Style Wave Dots with Hyper-Vibrant Color Shifting */}
      <div className="flex items-center gap-2.5 mb-5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{ boxShadow: `0 0 12px ${currentTheme.shadow}` }}
            animate={{
              y: [0, -6, 0],
              scale: [1, 1.3, 1],
              backgroundColor: currentTheme.colors,
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              y: { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 },
              scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 },
              backgroundColor: { duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.3 },
              opacity: { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }
            }}
          />
        ))}
      </div>

      {/* High-Contrast Vibrant Theme Text */}
      <div className={`text-xs font-bold tracking-widest uppercase bg-gradient-to-r ${currentTheme.text} bg-clip-text text-transparent drop-shadow-sm`}>
        {text}
      </div>
    </div>
  );
}