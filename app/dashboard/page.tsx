/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/app/dashboard/page.tsx */
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Map as MapIcon, 
  Zap, 
  Settings,
  LogOut,
  Loader2,
  ShieldCheck,
  Lock,
  Sparkles,
  FileText,
  Download,
  CheckCircle2,
  PlayCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- SHARED UI SUB-COMPONENTS ---

function VideoPlayer({ videoId, onEnded, onProgress }: any) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchUrl() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // Check access via RPC
        const { data: hasAccess } = await supabase.rpc('check_resource_access', {
          u_id: user?.id || null,
          v_id: videoId
        });

        if (!hasAccess) {
          setError("Premium Athlete Access Required.");
          setLoading(false);
          return;
        }

        const { data: video } = await supabase.from('videos').select('cloudinary_public_id').eq('id', videoId).single();
        if (video) {
          // Demo Cloudinary URL structure
          setVideoUrl(`https://res.cloudinary.com/demo/video/upload/f_auto,q_auto/${video.cloudinary_public_id}.mp4`);
        }
      } catch (err) {
        console.error("VideoPlayer error:", err);
        setError("Curriculum handshake failed.");
      } finally {
        setLoading(false);
      }
    }
    fetchUrl();
  }, [videoId]);

  if (loading) return <div className="aspect-video bg-slate-800 flex items-center justify-center rounded-3xl animate-pulse border border-slate-700"><Loader2 className="animate-spin text-emerald-500" /></div>;
  if (error) return (
    <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center rounded-3xl p-8 text-center border border-red-500/20 shadow-2xl">
      <Lock className="text-red-500 mb-4" size={48} />
      <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl mb-2">{error}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6">This curriculum node requires an active Centenarian Academy license.</p>
      <button className="bg-emerald-500 text-slate-950 font-black uppercase px-8 py-3 rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
        Unlock Full Journey $100
      </button>
    </div>
  );

  return (
    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
      <video 
        ref={videoRef} 
        src={videoUrl!} 
        controls 
        autoPlay 
        className="w-full h-full" 
        onEnded={onEnded} 
        onTimeUpdate={() => {
          if (videoRef.current) {
            onProgress?.((videoRef.current.currentTime / videoRef.current.duration) * 100);
          }
        }}
      />
      <div className="absolute top-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
           <ShieldCheck className="text-emerald-500" size={14} />
           <span className="text-[9px] font-black text-white uppercase tracking-widest">Athlete Secure Stream</span>
        </div>
      </div>
    </div>
  );
}

function Crossroads({ currentVideoId, onNavigate, onOpenMap }: any) {
  const [recs, setRecs] = useState<any[]>([]);
  useEffect(() => {
    async function fetchRecs() {
      const { data: current } = await supabase.from('videos').select('embedding').eq('id', currentVideoId).single();
      if (current?.embedding) {
        const { data: related } = await supabase.rpc('match_videos', {
          query_embedding: current.embedding,
          match_threshold: 0.3,
          match_count: 2,
          exclude_id: currentVideoId
        });
        setRecs(related || []);
      }
    }
    fetchRecs();
  }, [currentVideoId]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 z-50 rounded-3xl border border-white/5">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">THE CROSSROADS</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">The journey is non-linear. Choose your focus.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {recs.map((r, i) => (
          <button 
            key={r.id} 
            onClick={() => onNavigate(r.id)} 
            className="group bg-slate-900 p-8 rounded-4xl text-left border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-500 relative overflow-hidden"
          >
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mb-1 block">Semantic Path</span>
            <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">{r.title}</h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
          </button>
        ))}
        <button 
          onClick={onOpenMap} 
          className="bg-slate-900 p-8 rounded-4xl text-left border border-slate-800 hover:bg-slate-800 transition-all flex flex-col justify-end min-h-40"
        >
          <div className="bg-slate-800 w-10 h-10 rounded-xl flex items-center justify-center mb-auto text-slate-500">
            <MapIcon size={20} />
          </div>
          <h3 className="font-bold text-slate-300">View Full Curriculum Map</h3>
        </button>
      </div>
    </motion.div>
  );
}

function TranscriptReader({ videoId, currentTime }: any) {
  const [data, setData] = useState({ text: "", assetUrl: "" });
  useEffect(() => {
    supabase.from('videos').select('transcript_text, study_guide_url').eq('id', videoId).single().then(({data: d}) => {
      setData({ text: d?.transcript_text || "No transcript available.", assetUrl: d?.study_guide_url || "" });
    });
  }, [videoId]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <FileText size={20}/>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Logbook</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lecture Node</p>
            </div>
         </div>
         {data.assetUrl && (
           <a href={data.assetUrl} download className="p-2 text-slate-500 hover:text-emerald-500 transition-colors bg-slate-800 rounded-lg">
             <Download size={18} />
           </a>
         )}
      </div>
      <div className="p-8 overflow-y-auto text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-medium custom-scrollbar">
        {data.text}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [showCrossroads, setShowCrossroads] = useState(false);
  const [view, setView] = useState<'adventure' | 'logbook'>('adventure');
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
        
        const { data: first } = await supabase.from('videos').select('id').eq('is_opener', true).order('order_index').limit(1).single();
        if (first) setActiveVideoId(first.id);
        else {
          // Fallback to latest video if no opener found
          const { data: latest } = await supabase.from('videos').select('id').limit(1).single();
          if (latest) setActiveVideoId(latest.id);
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Hard redirect ensures all state is cleared
      window.location.href = '/';
    } catch (err) {
      console.log('err :>> ', err);
      window.location.href = '/';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
      <p className="text-slate-600 font-bold uppercase tracking-[0.5em] text-[10px]">Initializing Adventure Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      <header className="h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setView('adventure')}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">C</div>
            <span className="font-black tracking-tighter text-2xl italic uppercase text-white group-hover:text-emerald-500 transition-colors">Academy</span>
          </div>
          
          <nav className="hidden sm:flex bg-slate-900/50 rounded-2xl p-1 border border-white/5 shadow-2xl">
            <button 
              onClick={() => setView('adventure')} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'adventure' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
            >
              Adventure
            </button>
            <button 
              onClick={() => setView('logbook')} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'logbook' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
            >
              Logbook
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-6">
           <div className="text-right hidden md:block">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Athlete Identity</p>
              <p className="text-xs font-bold text-emerald-500 tracking-tight">{user?.email}</p>
           </div>
           <div className="h-8 w-px bg-white/5" />
           <div className="flex items-center space-x-2">
             <button className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Settings size={20}/></button>
             <button onClick={handleLogout} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"><LogOut size={20}/></button>
           </div>
        </div>
      </header>

      <main className="grow relative overflow-hidden bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-emerald-500/5 via-slate-950 to-slate-950">
        <AnimatePresence mode="wait">
          {view === 'adventure' ? (
            <motion.div key="adv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 p-6 lg:p-12 overflow-y-auto space-y-10 custom-scrollbar">
                <div className="relative group">
                  <VideoPlayer 
                    videoId={activeVideoId} 
                    onEnded={() => setShowCrossroads(true)} 
                    onProgress={setCurrentTime} 
                  />
                  {showCrossroads && (
                    <Crossroads 
                      currentVideoId={activeVideoId} 
                      onNavigate={(id:any) => { setActiveVideoId(id); setShowCrossroads(false); }} 
                      onOpenMap={() => setView('logbook')} 
                    />
                  )}
                </div>
                
                <div className="space-y-4 max-w-4xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                      <Zap size={16} />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">AI Engine v2 - Active Learning Node</span>
                  </div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Non-Linear Training Session</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Welcome to your Centenarian Athlete Academy training node. This adaptive path utilizes Gemini AI to analyze curriculum transcripts and provide semantic neighbors, ensuring your learning is continuous and contextual.
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-4 border-l border-white/5 p-8 overflow-hidden bg-slate-950/30 backdrop-blur-sm">
                <TranscriptReader videoId={activeVideoId} currentTime={currentTime} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="log" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full overflow-y-auto custom-scrollbar">
               <div className="max-w-7xl mx-auto px-8 py-16">
                  <header className="mb-16">
                    <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter mb-4">THE LOGBOOK</h1>
                    <div className="flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-xs">
                       <MapIcon size={16} className="text-emerald-500" />
                       <span>Visualizing Your Athletic Progression</span>
                    </div>
                  </header>
                  <p className="text-slate-500 italic mb-20 text-xl max-w-2xl">
                    Select a node to resume your training. Completed paths are highlighted in the grid below.
                  </p>
                  {/* Actual Grid logic remains in the Logbook subcomponent we'll refine if needed */}
                  <div className="p-20 border-2 border-dashed border-slate-900 rounded-[3rem] text-center">
                     <p className="text-slate-700 font-black uppercase tracking-widest">Hydrating Trail Map State...</p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}