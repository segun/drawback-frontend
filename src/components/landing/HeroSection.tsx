import { motion } from "framer-motion";
import { Users, Pencil } from "lucide-react";
import { DownloadCards } from "./StoreButtons";
import DrawingDemo from "./DrawingDemo";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-16">
      {/* Decorative sketchy elements */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="sketch" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="1.5" fill="hsl(350 65% 45%)" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#sketch)" />
      </svg>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Now available on iOS & Android
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] mb-6"
          >
            Draw together.
            <br />
            <span className="text-primary">Chat different.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-body text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
          >
            A real-time collaborative drawing chat where every message is a sketch. 
            Connect, draw, and express yourself — no words needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <DownloadCards />
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              <Users className="w-4 h-4" />
              See How It Works
            </a>
          </motion.div>
        </div>

        {/* Floating canvas mockup */}
        <motion.div
          id="how-it-works"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl bg-card border border-canvas-border shadow-hero overflow-hidden p-4">
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-3 h-3 rounded-full bg-primary/30" />
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="ml-3 text-xs font-body text-muted-foreground">Drawing with @friend</span>
            </div>
            {/* Animated drawing demo */}
            <DrawingDemo />
            {/* Toolbar */}
            <div className="flex items-center gap-2 mt-3 px-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-primary" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <div className="w-3 h-0.5 bg-muted-foreground rounded" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
