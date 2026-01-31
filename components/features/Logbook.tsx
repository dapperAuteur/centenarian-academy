/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Map as MapIcon, 
  CheckCircle2, 
  Lock, 
  PlayCircle,
  Clock,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LogbookProps {
  userId: string;
  onNavigate: (videoId: string) => void;
}

/**
 * The Logbook is the visual "Trail Map" for the athlete.
 * It visualizes curriculum progress, highlights completed paths,
 * and shows locked content based on the user's hierarchical permissions.
 */
export default function Logbook({ userId, onNavigate }: LogbookProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      try {
        // 1. Fetch full curriculum structure
        const { data: sectionData } = await supabase
          .from('sections')
          .select(`
            id, title, order_index,
            chapters (
              id, title, order_index,
              videos (
                id, title, order_index, is_opener
              )
            )
          `)
          .order('order_index');

        // 2. Fetch user's completion history
        const { data: historyData } = await supabase
          .from('watch_history')
          .select('video_id')
          .eq('user_id', userId)
          .eq('completed', true);

        if (sectionData) setSections(sectionData);
        if (historyData) setWatchHistory(new Set(historyData.map(h => h.video_id)));
      } catch (err) {
        console.error("Failed to load logbook data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-100 flex flex-col items-center justify-center p-12">
        <Zap className="text-emerald-500 animate-pulse mb-4" size={32} />
        <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Mapping Your Trail...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-500 font-black text-xs tracking-widest uppercase mb-2">
            <Trophy size={14} />
            <span>Athlete Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight">THE LOGBOOK</h1>
          <p className="text-slate-400 mt-2 text-lg">Your progress through the Centenarian curriculum.</p>
        </div>
        
        <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl flex items-center space-x-6">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nodes Mastered</p>
            <p className="text-2xl font-black text-white tabular-nums">{watchHistory.size}</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Study Hours</p>
            <p className="text-2xl font-black text-white tabular-nums">--</p>
          </div>
        </div>
      </header>

      <div className="space-y-16 relative">
        {/* The Vertical Trail Line (Visual Only) */}
        <div className="absolute left-6 top-8 bottom-0 w-px bg-slate-800 hidden md:block" />

        {sections.map((section, sIdx) => (
          <motion.section 
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-slate-500 z-10">
                <MapIcon size={20} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Section {sIdx + 1}: {section.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-0 md:ml-16">
              {section.chapters.map((chapter: any) => (
                <div key={chapter.id} className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    {chapter.title}
                  </h3>
                  
                  <div className="space-y-3">
                    {chapter.videos.map((video: any) => {
                      const isCompleted = watchHistory.has(video.id);
                      
                      return (
                        <button
                          key={video.id}
                          onClick={() => onNavigate(video.id)}
                          className={`w-full group text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                            isCompleted 
                              ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' 
                              : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {isCompleted ? (
                              <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
                            ) : (
                              <PlayCircle className="text-slate-600 group-hover:text-emerald-500 w-5 h-5 shrink-0 transition-colors" />
                            )}
                            <span className={`text-sm font-bold truncate ${isCompleted ? 'text-emerald-100' : 'text-slate-300'}`}>
                              {video.title}
                            </span>
                          </div>

                          {!video.is_opener && !isCompleted && (
                            <Lock className="text-slate-700 w-3 h-3 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <footer className="mt-20 p-8 border-t border-slate-800 text-center">
        <div className="inline-flex items-center space-x-2 text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase">
          <Clock size={12} />
          <span>Trail Data updated in Real-Time</span>
        </div>
      </footer>
    </div>
  );
}