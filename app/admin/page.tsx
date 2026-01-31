/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/app/admin/page.tsx */
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Video, 
  Activity, 
  ShieldAlert, 
  Zap, 
  RefreshCw, 
  Search,
  CheckCircle,
  BarChart3,
  Loader2,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  FileText,
  Save,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';
// Using relative path to resolve the supabase client in the current environment
import { supabase } from '../../lib/supabase';

// --- SUB-COMPONENTS ---

function UserManagement({ users, onToggleRole, onRefresh, loading }: any) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
          <Users className="text-emerald-500" /> Athlete Registry
        </h2>
        <button 
          onClick={onRefresh} 
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500 mb-4" />
          <p className="text-xs font-bold uppercase text-slate-600 tracking-widest">Syncing athlete data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Athlete</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4 text-right">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{u.email}</p>
                    <p className="text-[9px] font-mono text-slate-600 truncate max-w-[150px]">{u.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2 py-1 rounded border ${
                      u.role === 'admin' 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-slate-800 text-slate-500 border-transparent'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                      u.is_paid 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-600'
                    }`}>
                      {u.is_paid ? 'PREMIUM' : 'FREE TIER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onToggleRole(u.id, u.role)} 
                      className="text-slate-500 hover:text-emerald-500 transition-all p-2 hover:bg-emerald-500/5 rounded-xl"
                    >
                      {u.role === 'admin' ? <UserCheck size={18} /> : <ShieldCheck size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ContentManagement() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    cloudinary_id: '', 
    transcript_text: '',
    study_guide_url: '',
    is_opener: false 
  });

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      setVideos(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('videos').insert([{
      title: form.title,
      description: form.description,
      cloudinary_public_id: form.cloudinary_id,
      transcript_text: form.transcript_text,
      study_guide_url: form.study_guide_url,
      is_opener: form.is_opener
    }]);
    
    if (!error) {
      setForm({ title: '', description: '', cloudinary_id: '', transcript_text: '', study_guide_url: '', is_opener: false });
      fetchVideos();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl sticky top-28">
          <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
            <PlusCircle size={22} className="text-emerald-500"/> Add Curriculum Node
          </h2>
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., Squat Mechanics & Bioenergetics" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Key learning outcomes..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none h-20 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cloudinary ID</label>
                <input value={form.cloudinary_id} onChange={e => setForm({...form, cloudinary_id: e.target.value})} placeholder="cpt_module_01" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Study Guide URL</label>
                <input value={form.study_guide_url} onChange={e => setForm({...form, study_guide_url: e.target.value})} placeholder="PDF path/link" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transcript (For AI Adventure Engine)</label>
              <textarea value={form.transcript_text} onChange={e => setForm({...form, transcript_text: e.target.value})} placeholder="Paste timestamped transcript here..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-emerald-500 outline-none h-32" />
            </div>

            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-all">
              <input type="checkbox" checked={form.is_opener} onChange={e => setForm({...form, is_opener: e.target.checked})} className="w-4 h-4 accent-emerald-500" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-tight">Public Node</span>
                <span className="text-[9px] text-slate-500 uppercase font-black">Mark as Chapter Opener (Free Access)</span>
              </div>
            </label>
            
            <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-black uppercase py-4 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95">
              <Save size={18}/> Deploy to curriculum
            </button>
          </form>
        </section>
      </div>

      <div className="lg:col-span-7">
        <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Video size={18} className="text-emerald-500"/> Deployment Status
            </h2>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {videos.length} Total Nodes
            </div>
          </div>
          <div className="divide-y divide-slate-800 max-h-212.5 overflow-y-auto custom-scrollbar">
            {videos.length === 0 ? (
              <div className="p-20 text-center text-slate-600 font-black uppercase italic tracking-widest">Curriculum is currently empty</div>
            ) : (
              videos.map(v => (
                <div key={v.id} className="p-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">{v.title}</h3>
                    <div className="flex items-center space-x-4">
                      <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Zap size={10} className="text-emerald-500" /> {v.cloudinary_public_id}
                      </p>
                      {v.transcript_text && (
                        <p className="text-[10px] text-emerald-500/60 font-black flex items-center gap-1 uppercase tracking-tighter">
                          <FileText size={10} /> Indexed
                        </p>
                      )}
                      {v.study_guide_url && (
                        <p className="text-[10px] text-amber-500/60 font-black flex items-center gap-1 uppercase tracking-tighter">
                          <LinkIcon size={10} /> Asset
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                     {v.is_opener && <span className="text-[8px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">FREE</span>}
                     <button className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                       <Trash2 size={16}/>
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// --- MAIN ADMIN PAGE WRAPPER ---

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content'>('overview');
  const [stats, setStats] = useState({ users: 0, videos: 0, pendingEmbeddings: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [u, v, l] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(6)
      ]);
      setStats({ users: u.count || 0, videos: v.count || 0, pendingEmbeddings: 0 });
      setLogs(l.data || []);
    } catch (err) {
      console.error("Stats fetch failed:", err);
    }
  }, []);

  const fetchUserManagement = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/'; return; }
        
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') {
          setAuthorized(true);
          fetchStats();
        } else {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fetchStats]);

  // Handle data fetching when switching tabs
  useEffect(() => {
    if (authorized && activeTab === 'users') {
      fetchUserManagement();
    }
    if (authorized && activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab, authorized, fetchUserManagement, fetchStats]);

  const handleToggleRole = async (id: string, current: string) => {
    const newRole = current === 'admin' ? 'student' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      fetchStats(); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Authorizing Admin Terminal...</p>
      </div>
    );
  }

  if (!authorized) return null; // Logic in useEffect redirects

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10 font-sans selection:bg-emerald-500/30">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50 py-4 border-b border-white/5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-amber-500 font-black text-xs tracking-widest uppercase mb-1">
              <Zap size={14} className="animate-pulse" />
              <span>Mission Control v2.1</span>
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Command Center</h1>
          </div>
        </div>

        <nav className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          {(['overview', 'users', 'content'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Athletes Enrolled</p>
                  <h3 className="text-5xl font-black text-white tabular-nums">{stats.users}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Knowledge Nodes</p>
                  <h3 className="text-5xl font-black text-white tabular-nums">{stats.videos}</h3>
                </div>
                <div className="bg-slate-900 border border-emerald-500/20 p-8 rounded-3xl shadow-inner shadow-emerald-500/5">
                  <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-1">Adventure Engine</p>
                  <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter">Optimal</h3>
                </div>
              </div>

              <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                    <Activity className="text-emerald-500" size={18} /> Telemetry Stream
                  </h2>
                  <span className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Live
                  </span>
                </div>
                <div className="divide-y divide-slate-800">
                  {logs.length === 0 ? (
                    <div className="p-10 text-center text-slate-600 uppercase font-black tracking-[0.2em] text-[10px]">Waiting for athletic activity...</div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="p-4 flex justify-between items-center hover:bg-slate-800/20 transition-colors">
                        <span className="text-xs font-bold text-slate-400 tracking-tight">{log.event_type}</span>
                        <span className="text-[10px] font-mono text-slate-600 tracking-tighter">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
            
            <div className="space-y-8">
              <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 h-fit shadow-xl shadow-emerald-500/5">
                <BarChart3 className="text-emerald-500 mb-4" size={32} />
                <h3 className="font-bold text-white text-base mb-2 uppercase tracking-tighter">Engine Integrity</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                  Semantic embeddings and non-linear adventure paths are synchronized with the latest curriculum nodes.
                </p>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Load</p>
                   <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[12%]" />
                   </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement 
            users={users} 
            onToggleRole={handleToggleRole} 
            onRefresh={fetchUserManagement} 
            loading={loadingUsers} 
          />
        )}
        
        {activeTab === 'content' && <ContentManagement />}
      </main>
    </div>
  );
}