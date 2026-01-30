/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Map as MapIcon, 
  Zap, 
  Settings,
  LogOut
} from 'lucide-react';
// Reverting to relative paths to ensure correct resolution in the build environment
import { supabase } from '../../lib/supabase';
import VideoPlayer from '../../components/features/VideoPlayer';
import Crossroads from '../../components/features/Crossroads';
import TranscriptReader from '../../components/features/TranscriptReader';
import Logbook from '../../components/features/Logbook';

/**
 * The Main Dashboard is the "Adventure Room."
 * This is the final integration point where the video, AI recommendations,
 * and trail map come together to create the non-linear learning experience.
 */
export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [showCrossroads, setShowCrossroads] = useState(false);
  const [view, setView] = useState<'adventure' | 'logbook'>('adventure');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    async function initDashboard() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Fetch the first available "Opener" video as a starting point if none is active
      if (currentUser && !activeVideoId) {
        const { data: firstVideo } = await supabase
          .from('videos')
          .select('id')
          .eq('is_opener', true)
          .order('order_index')
          .limit(1)
          .single();
        
        if (firstVideo) setActiveVideoId(firstVideo.id);
      }
    }
    initDashboard();
  }, [activeVideoId]);

  const handleVideoEnd = () => {
    setShowCrossroads(true);
    // Log the completion for telemetry
    if (user && activeVideoId) {
      supabase.from('watch_history').insert({
        user_id: user.id,
        video_id: activeVideoId,
        completed: true
      });
    }
  };

  const navigateToVideo = (id: string) => {
    setActiveVideoId(id);
    setShowCrossroads(false);
    setView('adventure');
  };

  if (!user || !activeVideoId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Zap className="text-emerald-500 animate-pulse mb-4" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-[0.5em]">Synchronizing Academy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-20 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black">C</div>
            <span className="font-black tracking-tighter text-xl italic uppercase">Academy</span>
          </div>
          
          <nav className="hidden md:flex items-center bg-slate-900 rounded-full p-1 border border-slate-800">
            <button 
              onClick={() => setView('adventure')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'adventure' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
            >
              <Compass size={14} />
              <span>Adventure</span>
            </button>
            <button 
              onClick={() => setView('logbook')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'logbook' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
            >
              <MapIcon size={14} />
              <span>Logbook</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:block text-right mr-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Athlete Rank</p>
            <p className="text-xs font-bold text-emerald-500">Centenarian Prospect</p>
          </div>
          <button className="p-2 text-slate-500 hover:text-white transition-colors"><Settings size={20}/></button>
          <button className="p-2 text-slate-500 hover:text-red-400 transition-colors"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="grow relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'adventure' ? (
            <motion.div 
              key="adventure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              {/* Left Column: The Interactive Arena */}
              <div className="lg:col-span-8 p-6 lg:p-10 flex flex-col space-y-8 overflow-y-auto">
                <div className="relative group">
                  <VideoPlayer 
                    videoId={activeVideoId} 
                    onEnded={handleVideoEnd}
                    onProgress={(p) => setCurrentTime(p)} 
                  />
                  {showCrossroads && (
                    <Crossroads 
                      currentVideoId={activeVideoId} 
                      onNavigate={navigateToVideo}
                      onOpenMap={() => setView('logbook')}
                    />
                  )}
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Module Active</span>
                      <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">Current Curriculum Node</h2>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                      <Zap size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold">AI Recommendation Engine Online</span>
                    </div>
                  </div>
                  <p className="text-slate-400 leading-relaxed max-w-3xl">
                    Master the foundational movements required for the NASM CPT. This node focuses on the integration of neural drive and muscular performance.
                  </p>
                </div>
              </div>

              {/* Right Column: The Study Console */}
              <div className="lg:col-span-4 border-l border-slate-900 bg-slate-950 p-6 lg:p-8 overflow-hidden">
                <TranscriptReader videoId={activeVideoId} currentTime={currentTime} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="logbook"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full overflow-y-auto"
            >
              <Logbook userId={user.id} onNavigate={navigateToVideo} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}