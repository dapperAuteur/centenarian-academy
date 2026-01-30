/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/components/features/Crossroads.tsx */
'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  Map as MapIcon, 
  Zap,
  Loader2
} from 'lucide-react';
import { getSemanticRecommendations, getRandomPath } from '../../app/actions/recommendations';

interface CrossroadsProps {
  currentVideoId: string;
  onNavigate: (videoId: string) => void;
  onOpenMap: () => void;
}

/**
 * The Crossroads UI presents the 5 core choices to the athlete after completing a video node.
 * It uses the Gemini-powered semantic engine to fetch related paths.
 */
export default function Crossroads({ currentVideoId, onNavigate, onOpenMap }: CrossroadsProps) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [randomId, setRandomId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdventurePaths() {
      setLoading(true);
      try {
        const [semanticRes, randomRes] = await Promise.all([
          getSemanticRecommendations(currentVideoId, 2),
          getRandomPath(currentVideoId)
        ]);

        if (semanticRes.success) {
          setRecommendations(semanticRes.recommendations);
        }
        if (randomRes) {
          setRandomId(randomRes.id);
        }
      } catch (err) {
        console.error("Failed to fetch crossroads paths", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdventurePaths();
  }, [currentVideoId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl z-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Calculating Next Paths...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 rounded-3xl z-50 overflow-y-auto"
    >
      <motion.div variants={itemVariants} className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 italic">THE CROSSROADS</h2>
        <p className="text-slate-400 font-medium">Your journey is non-linear. Choose your next move.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        
        {/* 1. THE NEXT STEP (Linear/Next in Series - Assuming ID is handled by parent for now) */}
        <motion.button
          variants={itemVariants}
          onClick={() => {/* Parent handles next logic */}}
          className="group relative bg-emerald-500 p-6 rounded-2xl flex flex-col justify-between items-start text-left h-48 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <div className="bg-slate-900/20 p-2 rounded-lg">
            <ArrowRight className="text-slate-900 w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest block mb-1">Prescribed Path</span>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Follow the Standard Curriculum</h3>
          </div>
        </motion.button>

        {/* 2 & 3. SEMANTIC PATHS (Related Content) */}
        {recommendations.map((rec, index) => (
          <motion.button
            key={rec.id}
            variants={itemVariants}
            onClick={() => onNavigate(rec.id)}
            className="group bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between items-start text-left h-48 transition-all hover:border-emerald-500/50 hover:bg-slate-800/80"
          >
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Sparkles className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest block mb-1">Semantic Bridge</span>
              <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">{rec.title}</h3>
            </div>
          </motion.button>
        ))}

        {/* 4. THE UNKNOWN PATH (Random) */}
        {randomId && (
          <motion.button
            variants={itemVariants}
            onClick={() => onNavigate(randomId)}
            className="group bg-slate-900 border-2 border-dashed border-slate-700 p-6 rounded-2xl flex flex-col justify-between items-start text-left h-48 transition-all hover:border-amber-400/50 hover:bg-amber-400/5"
          >
            <div className="bg-amber-400/10 p-2 rounded-lg animate-pulse">
              <HelpCircle className="text-amber-400 w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest block mb-1">The Unknown</span>
              <h3 className="text-xl font-bold text-white leading-tight">Explore a Random Chapter</h3>
            </div>
          </motion.button>
        )}

        {/* 5. THE MAP (Full Menu) */}
        <motion.button
          variants={itemVariants}
          onClick={onOpenMap}
          className="group bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-between items-start text-left h-48 transition-all hover:bg-slate-800"
        >
          <div className="bg-slate-700/50 p-2 rounded-lg">
            <MapIcon className="text-slate-300 w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Navigation</span>
            <h3 className="text-xl font-bold text-slate-300 leading-tight">View Full Curriculum Map</h3>
          </div>
        </motion.button>

      </div>

      <motion.div variants={itemVariants} className="mt-10">
         <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-tighter">
            <Zap size={14} className="text-emerald-500" />
            <span>AI ENGINE ACTIVE: CALCULATING ADAPTIVE LEARNING PATHS</span>
         </div>
      </motion.div>
    </motion.div>
  );
}