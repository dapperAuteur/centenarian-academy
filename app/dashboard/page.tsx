/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ArrowRight,
  Sparkles,
  HelpCircle,
  Search,
  FileText,
  Download,
  Trophy,
  CheckCircle2,
  PlayCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// --- MOCKED/INLINED ACTIONS & COMPONENTS TO RESOLVE RESOLUTION ERRORS ---

/** * Mocking useRouter for the preview environment as next/navigation 
 * may not be available in the standalone bundler.
 */
const useRouter = () => ({
  push: (path: string) => console.log(`Navigating to: ${path}`),
});

/** Inlined version of getAuthorizedVideoUrl logic */
async function getAuthorizedVideoUrl(videoId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: hasAccess } = await supabase.rpc('check_resource_access', {
      u_id: user?.id || null,
      v_id: videoId
    });
    if (!hasAccess) return { success: false, message: "Access Denied: Premium Membership Required." };
    const { data: video } = await supabase.from('videos').select('cloudinary_public_id').eq('id', videoId).single();
    if (!video) return { success: false, message: "Video not found." };
    // In a real app, this calls the Cloudinary SDK. Here we return a placeholder or the ID.
    return { success: true, url: `https://res.cloudinary.com/demo/video/upload/${video.cloudinary_public_id}.mp4` };
  } catch (err) {
    return { success: false, message: `Security handshake failed. Error: ${err}` };
  }
}

/** Inlined version of Recommendation logic */
async function getSemanticRecommendations(videoId: string) {
  const { data: current } = await supabase.from('videos').select('embedding').eq('id', videoId).single();
  if (!current?.embedding) return { success: false, recommendations: [] };
  const { data: related } = await supabase.rpc('match_videos', {
    query_embedding: current.embedding,
    match_threshold: 0.3,
    match_count: 2,
    exclude_id: videoId
  });
  return { success: true, recommendations: related || [] };
}

// --- SUB-COMPONENTS ---

function VideoPlayer({ videoId, onEnded, onProgress }: any) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchUrl() {
      setLoading(true);
      const result = await getAuthorizedVideoUrl(videoId);
      if (result.success) setVideoUrl(result.url || null);
      else setError(result.message || "Error");
      setLoading(false);
    }
    fetchUrl();
  }, [videoId]);

  if (loading) return <div className="aspect-video bg-slate-800 flex items-center justify-center rounded-3xl animate-pulse"><Loader2 className="animate-spin text-emerald-500" /></div>;
  if (error) return <div className="aspect-video bg-slate-800 flex flex-col items-center justify-center rounded-3xl p-8 text-center border border-red-500/20"><Lock className="text-red-500 mb-4" /><h3 className="text-white font-bold">{error}</h3></div>;

  return (
    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800">
      <video 
        ref={videoRef} src={videoUrl!} controls autoPlay className="w-full h-full" 
        onEnded={onEnded} onTimeUpdate={() => onProgress?.((videoRef.current!.currentTime / videoRef.current!.duration) * 100)}
      />
    </div>
  );
}

function Crossroads({ currentVideoId, onNavigate, onOpenMap }: any) {
  const [recs, setRecs] = useState<any[]>([]);
  useEffect(() => {
    getSemanticRecommendations(currentVideoId).then(res => { if (res.success) setRecs(res.recommendations); });
  }, [currentVideoId]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-50 rounded-3xl">
      <h2 className="text-3xl font-black text-white italic mb-8">THE CROSSROADS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {recs.map(r => (
          <button key={r.id} onClick={() => onNavigate(r.id)} className="bg-slate-800 p-6 rounded-2xl text-left border border-slate-700 hover:border-emerald-500 transition-all">
            <Sparkles className="text-emerald-500 mb-2" />
            <h3 className="font-bold text-white">{r.title}</h3>
          </button>
        ))}
        <button onClick={onOpenMap} className="bg-slate-800/40 p-6 rounded-2xl text-left border border-slate-700 hover:bg-slate-800">
          <MapIcon className="text-slate-500 mb-2" />
          <h3 className="font-bold text-slate-300">Open Trail Map</h3>
        </button>
      </div>
    </motion.div>
  );
}

function TranscriptReader({ videoId, currentTime }: any) {
  const [text, setText] = useState("");
  useEffect(() => {
    supabase.from('videos').select('transcript_text').eq('id', videoId).single().then(({data}) => setText(data?.transcript_text || "No transcript available."));
  }, [videoId]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
         <h3 className="font-bold text-white flex items-center gap-2"><FileText size={18}/> Transcript</h3>
         <Download size={18} className="text-slate-500 cursor-pointer" />
      </div>
      <div className="p-6 overflow-y-auto text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

function Logbook({ userId, onNavigate }: any) {
  const [sections, setSections] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('sections').select('*, chapters(*, videos(*))').order('order_index').then(({data}) => setSections(data || []));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-5xl font-black text-white italic mb-12">THE LOGBOOK</h1>
      <div className="space-y-12">
        {sections.map(s => (
          <div key={s.id}>
            <h2 className="text-emerald-500 font-black uppercase tracking-widest mb-6">{s.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {s.chapters?.flatMap((c:any) => c.videos || []).map((v:any) => (
                <button key={v.id} onClick={() => onNavigate(v.id)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left hover:bg-slate-800 transition-colors flex items-center justify-between">
                  <span className="font-bold">{v.title}</span>
                  {v.is_opener ? <Zap size={14} className="text-emerald-500" /> : <Lock size={14} className="text-slate-700" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function App() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [showCrossroads, setShowCrossroads] = useState(false);
  const [view, setView] = useState<'adventure' | 'logbook'>('adventure');
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);
      const { data: first } = await supabase.from('videos').select('id').eq('is_opener', true).limit(1).single();
      if (first) setActiveVideoId(first.id);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="h-20 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black">C</div>
            <span className="font-black tracking-tighter text-xl italic uppercase">Academy</span>
          </div>
          <nav className="flex bg-slate-900 rounded-full p-1 border border-slate-800">
            <button onClick={() => setView('adventure')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${view === 'adventure' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}>Adventure</button>
            <button onClick={() => setView('logbook')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${view === 'logbook' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}>Logbook</button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
           <span className="text-xs font-bold text-emerald-500 hidden sm:block">{user?.email}</span>
           <button className="p-2 text-slate-500 hover:text-white"><Settings size={20}/></button>
           <button className="p-2 text-slate-500 hover:text-red-400"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="grow relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'adventure' ? (
            <motion.div key="adv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 p-6 lg:p-10 overflow-y-auto space-y-8">
                <div className="relative">
                  <VideoPlayer videoId={activeVideoId} onEnded={() => setShowCrossroads(true)} onProgress={setCurrentTime} />
                  {showCrossroads && <Crossroads currentVideoId={activeVideoId} onNavigate={(id:any) => { setActiveVideoId(id); setShowCrossroads(false); }} onOpenMap={() => setView('logbook')} />}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Current Training Node</h2>
                  <p className="text-slate-400">Master the foundational movements required for the NASM CPT through an AI-guided adaptive learning path.</p>
                </div>
              </div>
              <div className="lg:col-span-4 border-l border-slate-900 p-8 overflow-hidden">
                <TranscriptReader videoId={activeVideoId} currentTime={currentTime} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
              <Logbook userId={user?.id} onNavigate={(id:any) => { setActiveVideoId(id); setView('adventure'); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}